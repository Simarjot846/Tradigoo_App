package com.tradigoo.app.data.api

import android.content.Context
import com.tradigoo.app.data.local.SessionManager
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {

    // Default production endpoint as deployed for Tradigoo
    const val DEFAULT_BASE_URL = "https://tradigoo.vercel.app/"

    private var retrofit: Retrofit? = null
    private var currentBaseUrl = DEFAULT_BASE_URL
    private var applicationContext: Context? = null

    /**
     * Initializes the client with application context for token injection
     */
    fun init(context: Context) {
        applicationContext = context.applicationContext
    }

    /**
     * Default direct access property for TradigooApiService
     */
    val apiService: TradigooApiService
        get() = getApiService(applicationContext)

    fun getApiService(context: Context? = null, baseUrl: String = currentBaseUrl): TradigooApiService {
        if (context != null) {
            applicationContext = context.applicationContext
        }

        if (retrofit == null || currentBaseUrl != baseUrl) {
            currentBaseUrl = baseUrl

            val logging = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }

            val authInterceptor = Interceptor { chain ->
                val original = chain.request()
                val builder = original.newBuilder()
                    .header("Accept", "application/json")
                    .header("Content-Type", "application/json")

                val ctx = applicationContext ?: context
                if (ctx != null) {
                    try {
                        val sessionManager = SessionManager.getInstance(ctx)
                        val token = sessionManager.getAuthToken()
                        if (!token.isNullOrEmpty()) {
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
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(15, TimeUnit.SECONDS)
                .writeTimeout(15, TimeUnit.SECONDS)
                .build()

            retrofit = Retrofit.Builder()
                .baseUrl(baseUrl)
                .client(okHttpClient)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
        }
        return retrofit!!.create(TradigooApiService::class.java)
    }
}
