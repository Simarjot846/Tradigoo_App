package com.tradigoo.app.data.repository

import android.content.Context
import com.tradigoo.app.data.api.ApiFounderStats
import com.tradigoo.app.data.api.ApiTrustScoreResponse
import com.tradigoo.app.data.api.RetrofitClient
import com.tradigoo.app.domain.model.Resource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class AdminRepository(private val context: Context) {

    private val api = RetrofitClient.getApiService(context)

    suspend fun getFounderStats(): Resource<ApiFounderStats> = withContext(Dispatchers.IO) {
        try {
            val response = api.getFounderStats()
            if (response.isSuccessful && response.body() != null) {
                Resource.Success(response.body()!!)
            } else {
                Resource.Error("Could not retrieve platform metrics")
            }
        } catch (e: Exception) {
            Resource.Error(e.localizedMessage ?: "Failed to load platform stats")
        }
    }

    suspend fun getTrustScore(userId: String): Resource<ApiTrustScoreResponse> = withContext(Dispatchers.IO) {
        try {
            val response = api.getTrustScore(userId)
            if (response.isSuccessful && response.body() != null) {
                Resource.Success(response.body()!!)
            } else {
                Resource.Error("Failed to calculate trust score")
            }
        } catch (e: Exception) {
            Resource.Error(e.localizedMessage ?: "Error loading trust score")
        }
    }
}
