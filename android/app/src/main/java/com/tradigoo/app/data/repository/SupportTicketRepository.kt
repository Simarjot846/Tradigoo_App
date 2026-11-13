package com.tradigoo.app.data.repository

import android.content.Context
import com.google.gson.Gson
import com.tradigoo.app.data.api.ApiSupportTicket
import com.tradigoo.app.data.api.ApiUpdateTicketRequest
import com.tradigoo.app.data.api.RetrofitClient
import com.tradigoo.app.domain.model.Resource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class SupportTicketRepository(private val context: Context) {

    private val api = RetrofitClient.getApiService(context)
    private val gson = Gson()

    suspend fun getTickets(status: String? = null, assignedTo: String? = null): Resource<List<ApiSupportTicket>> =
        withContext(Dispatchers.IO) {
            try {
                val response = api.getTickets(status = status, assignedTo = assignedTo)
                if (response.isSuccessful && response.body() != null) {
                    Resource.Success(response.body()!!)
                } else {
                    Resource.Error(extractErrorMessage(response.errorBody()?.string()) ?: "Failed to load support tickets")
                }
            } catch (e: Exception) {
                Resource.Error(e.localizedMessage ?: "Failed to load support tickets", e)
            }
        }

    suspend fun getTicketById(id: String): Resource<ApiSupportTicket> = withContext(Dispatchers.IO) {
        try {
            val response = api.getTicketById(id)
            if (response.isSuccessful && response.body() != null) {
                Resource.Success(response.body()!!)
            } else {
                Resource.Error(extractErrorMessage(response.errorBody()?.string()) ?: "Ticket not found")
            }
        } catch (e: Exception) {
            Resource.Error(e.localizedMessage ?: "Error loading ticket details", e)
        }
    }

    suspend fun updateTicket(
        id: String,
        status: String? = null,
        assignedTo: String? = null,
        internalNote: String? = null,
        replyMessage: String? = null,
        senderName: String? = null,
        senderRole: String = "employee",
        resolutionNotes: String? = null
    ): Resource<ApiSupportTicket> = withContext(Dispatchers.IO) {
        try {
            val request = ApiUpdateTicketRequest(
                status = status,
                assignedTo = assignedTo,
                internalNote = internalNote,
                replyMessage = replyMessage,
                senderName = senderName,
                senderRole = senderRole,
                resolutionNotes = resolutionNotes
            )
            val response = api.updateTicket(id, request)
            if (response.isSuccessful && response.body() != null) {
                Resource.Success(response.body()!!)
            } else {
                Resource.Error(extractErrorMessage(response.errorBody()?.string()) ?: "Failed to update ticket")
            }
        } catch (e: Exception) {
            Resource.Error(e.localizedMessage ?: "Error updating ticket", e)
        }
    }

    private fun extractErrorMessage(rawBody: String?): String? {
        if (rawBody.isNullOrBlank()) return null
        return try {
            val map = gson.fromJson(rawBody, Map::class.java)
            (map?.get("error") as? String) ?: (map?.get("message") as? String) ?: rawBody
        } catch (_: Exception) {
            rawBody
        }
    }
}
