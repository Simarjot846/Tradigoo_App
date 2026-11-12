package com.tradigoo.app.data.repository

import android.content.Context
import com.tradigoo.app.data.api.ApiSupportTicket
import com.tradigoo.app.data.api.ApiUpdateTicketRequest
import com.tradigoo.app.data.api.RetrofitClient
import com.tradigoo.app.domain.model.Resource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class SupportTicketRepository(private val context: Context) {

    private val api = RetrofitClient.getApiService(context)

    suspend fun getTickets(status: String? = null, assignedTo: String? = null): Resource<List<ApiSupportTicket>> =
        withContext(Dispatchers.IO) {
            try {
                val response = api.getTickets(status = status, assignedTo = assignedTo)
                if (response.isSuccessful && response.body() != null) {
                    Resource.Success(response.body()!!)
                } else {
                    Resource.Success(emptyList())
                }
            } catch (e: Exception) {
                Resource.Error(e.localizedMessage ?: "Failed to load support tickets")
            }
        }

    suspend fun getTicketById(id: String): Resource<ApiSupportTicket> = withContext(Dispatchers.IO) {
        try {
            val response = api.getTicketById(id)
            if (response.isSuccessful && response.body() != null) {
                Resource.Success(response.body()!!)
            } else {
                Resource.Error("Ticket not found")
            }
        } catch (e: Exception) {
            Resource.Error(e.localizedMessage ?: "Error loading ticket details")
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
                Resource.Error("Failed to update ticket")
            }
        } catch (e: Exception) {
            Resource.Error(e.localizedMessage ?: "Error updating ticket")
        }
    }
}
