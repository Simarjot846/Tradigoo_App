package com.tradigoo.app.data.repository

import android.content.Context
import com.tradigoo.app.data.api.ApiAiQueryRequest
import com.tradigoo.app.data.api.RetrofitClient
import com.tradigoo.app.domain.model.Resource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class AiAssistantRepository(private val context: Context) {

    private val api = RetrofitClient.getApiService(context)

    suspend fun askAssistant(prompt: String): Resource<String> = withContext(Dispatchers.IO) {
        try {
            val response = api.queryTradeBrain(ApiAiQueryRequest(query = prompt))
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                val answer = body.recommendation ?: body.reply ?: "I am here to assist with your B2B trade questions."
                Resource.Success(answer)
            } else {
                Resource.Error(response.errorBody()?.string() ?: "AI service temporarily unavailable")
            }
        } catch (e: Exception) {
            Resource.Error(e.localizedMessage ?: "Could not connect to Tradigoo AI")
        }
    }
}
