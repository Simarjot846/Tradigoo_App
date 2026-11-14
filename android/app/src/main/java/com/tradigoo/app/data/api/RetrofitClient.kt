package com.tradigoo.app.data.api

import android.content.Context
import com.google.gson.Gson
import com.tradigoo.app.BuildConfig
import com.tradigoo.app.data.local.SessionManager
import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {

    val DEFAULT_BASE_URL: String = BuildConfig.API_BASE_URL

    private var retrofit: Retrofit? = null
    private var currentBaseUrl = DEFAULT_BASE_URL
    private var applicationContext: Context? = null
    private val refreshLock = Any()
    private val gson = Gson()
    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    private val refreshHttpClient: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(20, TimeUnit.SECONDS)
            .writeTimeout(20, TimeUnit.SECONDS)
            .build()
    }

    fun init(context: Context) {
        applicationContext = context.applicationContext
    }

    val apiService: TradigooApiService
        get() = getApiService(applicationContext)

    private fun isAuthBypassPath(encodedPath: String): Boolean {
        return encodedPath.contains("/api/auth/signin") ||
            encodedPath.contains("/api/auth/signup") ||
            encodedPath.contains("/api/auth/google") ||
            encodedPath.contains("/api/auth/forgot-password") ||
            encodedPath.contains("/api/auth/refresh") ||
            encodedPath.contains("/api/auth/signout")
    }

    private fun isJwtExpiredResponse(response: Response): Boolean {
        if (response.code == 401) return true
        if (response.code != 400 && response.code != 403 && response.code != 500) return false
        return try {
            val preview = response.peekBody(4096).string().lowercase()
            preview.contains("jwt expired") ||
                preview.contains("token is expired") ||
                preview.contains("pgrst301") ||
                preview.contains("invalid jwt")
        } catch (_: Exception) {
            false
        }
    }

    fun refreshAccessTokenSync(
        sessionManager: SessionManager,
        failedToken: String? = null
    ): String? {
        synchronized(refreshLock) {
            val latestToken = sessionManager.getAuthToken()
            if (!latestToken.isNullOrBlank() &&
                latestToken != failedToken &&
                !sessionManager.isAccessTokenExpiringSoon(60L)
            ) {
                return latestToken
            }

            val refreshToken = sessionManager.getRefreshToken() ?: return null
            val refreshUrl = "${currentBaseUrl}api/auth/refresh"
            val payloadJson = gson.toJson(RefreshTokenRequest(refreshToken = refreshToken))
            val request = Request.Builder()
                .url(refreshUrl)
                .post(payloadJson.toRequestBody(jsonMediaType))
                .header("Accept", "application/json")
                .header("Content-Type", "application/json")
                .build()

            return try {
                refreshHttpClient.newCall(request).execute().use { res ->
                    val rawBody = res.body?.string()
                    if (!res.isSuccessful || rawBody.isNullOrBlank()) {
                        if (res.code == 401) {
                            sessionManager.clearAuthToken()
                        }
                        return null
                    }

                    val parsed = gson.fromJson(rawBody, RefreshTokenResponse::class.java)
                    val newAccessToken = parsed?.session?.accessToken?.takeIf { it.isNotBlank() }
                        ?: parsed?.token?.takeIf { it.isNotBlank() }
                        ?: return null
                    val newRefreshToken = parsed.session?.refreshToken?.takeIf { it.isNotBlank() }
                        ?: parsed.refreshToken?.takeIf { it.isNotBlank() }
                        ?: refreshToken
                    val newExpiresAt = parsed.session?.expiresAt ?: parsed.expiresAt

                    sessionManager.saveSessionTokens(
                        accessToken = newAccessToken,
                        refreshToken = newRefreshToken,
                        expiresAtSec = newExpiresAt
                    )
                    newAccessToken
                }
            } catch (_: Exception) {
                null
            }
        }
    }

    fun getApiService(context: Context? = null, baseUrl: String = currentBaseUrl): TradigooApiService {
        if (context != null) {
            applicationContext = context.applicationContext
        }

        val normalizedBaseUrl = if (baseUrl.endsWith("/")) baseUrl else "$baseUrl/"

        if (retrofit == null || currentBaseUrl != normalizedBaseUrl) {
            currentBaseUrl = normalizedBaseUrl

            val logging = HttpLoggingInterceptor().apply {
                level = if (BuildConfig.DEBUG) {
                    HttpLoggingInterceptor.Level.BASIC
                } else {
                    HttpLoggingInterceptor.Level.NONE
                }
            }

            val authInterceptor = Interceptor { chain ->
                val original = chain.request()
                val ctx = applicationContext ?: context
                val sessionManager = ctx?.let {
                    try {
                        SessionManager.getInstance(it)
                    } catch (_: Exception) {
                        null
                    }
                }

                val path = original.url.encodedPath
                val bypassAuth = isAuthBypassPath(path)

                var activeToken: String? = null
                if (!bypassAuth && sessionManager != null) {
                    if (sessionManager.isAccessTokenExpiringSoon(90L) &&
                        !sessionManager.getRefreshToken().isNullOrBlank()
                    ) {
                        activeToken = refreshAccessTokenSync(sessionManager)
                    }
                    if (activeToken.isNullOrBlank()) {
                        activeToken = sessionManager.getAuthToken()
                    }
                }

                fun buildRequestWithToken(tokenToUse: String?, isRetry: Boolean): Request {
                    val builder = original.newBuilder()
                        .header("Accept", "application/json")

                    // Preserve multipart boundary headers on file uploads
                    if (original.body !is MultipartBody && original.header("Content-Type") == null) {
                        builder.header("Content-Type", "application/json")
                    }

                    if (!tokenToUse.isNullOrBlank()) {
                        builder.header("Authorization", "Bearer $tokenToUse")
                    }
                    if (isRetry) {
                        builder.header("X-Tradigoo-Retried", "1")
                    }
                    return builder.build()
                }

                val initialRequest = buildRequestWithToken(activeToken, isRetry = false)
                val response = chain.proceed(initialRequest)

                if (!bypassAuth &&
                    sessionManager != null &&
                    original.header("X-Tradigoo-Retried") == null &&
                    isJwtExpiredResponse(response) &&
                    !sessionManager.getRefreshToken().isNullOrBlank()
                ) {
                    val refreshedToken = refreshAccessTokenSync(sessionManager, failedToken = activeToken)
                    if (!refreshedToken.isNullOrBlank()) {
                        response.close()
                        return@Interceptor chain.proceed(buildRequestWithToken(refreshedToken, isRetry = true))
                    }
                }

                response
            }

            val okHttpClient = OkHttpClient.Builder()
                .addInterceptor(authInterceptor)
                .addInterceptor(logging)
                .connectTimeout(20, TimeUnit.SECONDS)
                .readTimeout(25, TimeUnit.SECONDS)
                .writeTimeout(25, TimeUnit.SECONDS)
                .build()

            retrofit = Retrofit.Builder()
                .baseUrl(normalizedBaseUrl)
                .client(okHttpClient)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
        }
        return retrofit!!.create(TradigooApiService::class.java)
    }
}
