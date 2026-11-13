package com.tradigoo.app.data.repository

import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
import com.google.gson.Gson
import com.tradigoo.app.data.api.ApiOrder
import com.tradigoo.app.data.api.CreateOrderRequest
import com.tradigoo.app.data.api.OrderOtpRequest
import com.tradigoo.app.data.api.RaiseDisputeRequest
import com.tradigoo.app.data.api.RetrofitClient
import com.tradigoo.app.data.api.UpdateOrderStatusRequest
import com.tradigoo.app.domain.model.Order
import com.tradigoo.app.domain.model.Resource
import com.tradigoo.app.domain.model.UserRole
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody

class OrderRepository(private val context: Context) {

    private val api = RetrofitClient.getApiService(context)
    private val gson = Gson()

    suspend fun getOrders(userId: String, role: UserRole): Resource<List<Order>> = withContext(Dispatchers.IO) {
        try {
            val roleParam = if (role == UserRole.WHOLESALER) "wholesaler" else "buyer"
            val response = api.getOrders(role = roleParam, userId = userId, limit = 50)
            if (response.isSuccessful && response.body() != null) {
                Resource.Success(response.body()!!.map(::mapApiOrder))
            } else {
                Resource.Error(extractErrorMessage(response.errorBody()?.string()) ?: "Failed to load orders")
            }
        } catch (e: Exception) {
            Resource.Error(e.localizedMessage ?: "Failed to fetch orders from server", e)
        }
    }

    suspend fun createOrder(
        sellerId: String,
        productId: String,
        quantity: Int
    ): Resource<Order> = withContext(Dispatchers.IO) {
        try {
            val req = CreateOrderRequest(
                sellerId = sellerId,
                productId = productId,
                quantity = quantity
            )
            val response = api.createOrder(req)
            if (response.isSuccessful && response.body() != null) {
                Resource.Success(mapApiOrder(response.body()!!))
            } else {
                Resource.Error(extractErrorMessage(response.errorBody()?.string()) ?: "Order creation failed")
            }
        } catch (e: Exception) {
            Resource.Error(e.localizedMessage ?: "Network error creating order", e)
        }
    }

    suspend fun updateOrderStatus(orderId: String, newStatus: String): Resource<String> = withContext(Dispatchers.IO) {
        try {
            val response = api.updateOrderStatus(orderId, UpdateOrderStatusRequest(status = newStatus))
            val body = response.body()
            if (response.isSuccessful && (body?.success != false)) {
                Resource.Success(body?.status ?: newStatus)
            } else {
                Resource.Error(body?.error ?: extractErrorMessage(response.errorBody()?.string()) ?: "Status update failed")
            }
        } catch (e: Exception) {
            Resource.Error(e.localizedMessage ?: "Network error updating order status", e)
        }
    }

    suspend fun verifyDeliveryOtp(orderId: String, code: String): Resource<String> = withContext(Dispatchers.IO) {
        try {
            val response = api.verifyOrderOtp(orderId, OrderOtpRequest(action = "verify", code = code.trim()))
            val body = response.body()
            if (response.isSuccessful && (body?.success != false)) {
                Resource.Success(body?.message ?: "Delivery OTP verified. 24-hour inspection started.")
            } else {
                Resource.Error(body?.error ?: extractErrorMessage(response.errorBody()?.string()) ?: "OTP verification failed")
            }
        } catch (e: Exception) {
            Resource.Error(e.localizedMessage ?: "Network error verifying OTP", e)
        }
    }

    suspend fun uploadDisputeEvidence(orderId: String, uri: Uri): Resource<String> = withContext(Dispatchers.IO) {
        try {
            val mimeType = context.contentResolver.getType(uri) ?: "image/jpeg"
            val bytes = context.contentResolver.openInputStream(uri)?.use { it.readBytes() }
                ?: return@withContext Resource.Error("Unable to read selected evidence file.")

            if (bytes.size > 10 * 1024 * 1024) {
                return@withContext Resource.Error("Evidence file is too large. Max size is 10 MB.")
            }

            var fileName = "evidence_${System.currentTimeMillis()}.jpg"
            context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
                val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                if (nameIndex >= 0 && cursor.moveToFirst()) {
                    fileName = cursor.getString(nameIndex) ?: fileName
                }
            }

            val filePart = MultipartBody.Part.createFormData(
                "file",
                fileName,
                bytes.toRequestBody(mimeType.toMediaTypeOrNull())
            )
            val orderIdBody = orderId.toRequestBody("text/plain".toMediaTypeOrNull())
            val response = api.uploadDisputeEvidence(filePart, orderIdBody)
            val body = response.body()
            if (response.isSuccessful && body?.url != null) {
                Resource.Success(body.url)
            } else {
                Resource.Error(body?.error ?: extractErrorMessage(response.errorBody()?.string()) ?: "Evidence upload failed")
            }
        } catch (e: Exception) {
            Resource.Error(e.localizedMessage ?: "Error uploading dispute evidence", e)
        }
    }

    suspend fun raiseDispute(
        orderId: String,
        reason: String,
        evidenceUrls: List<String> = emptyList()
    ): Resource<String> = withContext(Dispatchers.IO) {
        try {
            val response = api.raiseDispute(
                RaiseDisputeRequest(
                    orderId = orderId,
                    reason = reason.trim(),
                    evidenceUrls = evidenceUrls
                )
            )
            val body = response.body()
            if (response.isSuccessful && (body?.success != false)) {
                Resource.Success(body?.message ?: "Dispute submitted to Tradigoo operations team.")
            } else {
                Resource.Error(body?.error ?: extractErrorMessage(response.errorBody()?.string()) ?: "Failed to submit dispute")
            }
        } catch (e: Exception) {
            Resource.Error(e.localizedMessage ?: "Network error submitting dispute", e)
        }
    }

    private fun mapApiOrder(item: ApiOrder): Order {
        return Order(
            id = item.id,
            buyerId = item.buyerId,
            sellerId = item.sellerId,
            productId = item.productId,
            productName = item.product?.name ?: "Wholesale Consignment",
            quantity = item.quantity,
            unitPrice = item.unitPrice,
            totalAmount = item.totalAmount,
            status = item.status,
            createdAt = item.createdAt,
            sellerBusinessName = item.seller?.businessName ?: item.seller?.name ?: "Supplier",
            sellerLocation = item.seller?.location,
            sellerGstVerified = item.seller?.gstVerified ?: false,
            sellerTrustScore = item.seller?.trustScore,
            buyerBusinessName = item.buyer?.businessName ?: item.buyer?.name ?: "Retail Partner",
            buyerLocation = item.buyer?.location,
            unit = item.product?.unit ?: "kg",
            category = item.product?.category ?: "General",
            imageUrl = item.product?.imageUrl,
            otp = item.otp,
            otpVerified = item.otpVerified ?: false,
            inspectionDeadline = item.inspectionDeadline,
            disputeReason = item.disputeReason
        )
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
