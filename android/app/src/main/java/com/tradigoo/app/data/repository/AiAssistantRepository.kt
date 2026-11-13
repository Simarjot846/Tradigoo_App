package com.tradigoo.app.data.repository

import android.content.Context
import com.google.gson.Gson
import com.tradigoo.app.data.api.ApiChatHistoryItem
import com.tradigoo.app.data.api.ApiChatRequest
import com.tradigoo.app.data.api.RetrofitClient
import com.tradigoo.app.domain.model.Resource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class AiAssistantRepository(private val context: Context) {

    private val api = RetrofitClient.getApiService(context)
    private val gson = Gson()

    suspend fun askAssistant(
        prompt: String,
        history: List<ApiChatHistoryItem> = emptyList()
    ): Resource<String> = withContext(Dispatchers.IO) {
        try {
            val response = api.askChat(ApiChatRequest(message = prompt.trim(), history = history))
            val body = response.body()
            if (response.isSuccessful && body != null) {
                val answer = body.reply ?: body.recommendation
                    ?: "I am here to assist with your B2B trade, escrow, and order questions."
                Resource.Success(answer)
            } else {
                val err = body?.error ?: extractErrorMessage(response.errorBody()?.string())
                    ?: "Assistant service temporarily unavailable"
                Resource.Error(err)
            }
        } catch (e: Exception) {
            Resource.Error(e.localizedMessage ?: "Could not connect to Tradigoo Assistant", e)
        }
    }

    private fun extractErrorMessage(rawBody: String?): String? {
        if (rawBody.isNullOrBlank()) return null
        return try {
            val map = gson.fromJson(rawBody, Map::class.java)
            (map?.get("error") as? String) ?: (map?.get("reply") as? String) ?: rawBody
        } catch (_: Exception) {
            rawBody
        }
    }
}
