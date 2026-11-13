package com.tradigoo.app.data.api

import android.content.Context
import com.tradigoo.app.BuildConfig
import com.tradigoo.app.data.local.SessionManager
import okhttp3.Interceptor
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {

    val DEFAULT_BASE_URL: String = BuildConfig.API_BASE_URL

    private var retrofit: Retrofit? = null
    private var currentBaseUrl = DEFAULT_BASE_URL
    private var applicationContext: Context? = null

    fun init(context: Context) {
        applicationContext = context.applicationContext
    }

    val apiService: TradigooApiService
        get() = getApiService(applicationContext)

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
                val builder = original.newBuilder()
                    .header("Accept", "application/json")

                // Preserve multipart boundary headers on file uploads
                if (original.body !is MultipartBody && original.header("Content-Type") == null) {
                    builder.header("Content-Type", "application/json")
                }

                val ctx = applicationContext ?: context
                if (ctx != null) {
                    try {
                        val sessionManager = SessionManager.getInstance(ctx)
                        val token = sessionManager.getAuthToken()
                        if (!token.isNullOrBlank()) {
                            builder.header("Authorization", "Bearer $token")
                        }
                    } catch (_: Exception) {
                        // Ignore session access issue during early boot
                    }
                }

                chain.proceed(builder.build())
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
