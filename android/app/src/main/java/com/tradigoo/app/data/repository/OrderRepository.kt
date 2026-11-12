package com.tradigoo.app.data.repository

import android.content.Context
import com.tradigoo.app.data.api.CreateOrderRequest
import com.tradigoo.app.data.api.RetrofitClient
import com.tradigoo.app.domain.model.Order
import com.tradigoo.app.domain.model.Resource
import com.tradigoo.app.domain.model.UserRole
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class OrderRepository(private val context: Context) {

    private val api = RetrofitClient.getApiService(context)

    suspend fun getOrders(userId: String, role: UserRole): Resource<List<Order>> = withContext(Dispatchers.IO) {
        try {
            val roleParam = if (role == UserRole.WHOLESALER) "wholesaler" else "buyer"
            val response = api.getOrders(role = roleParam, userId = userId, limit = 50)
            if (response.isSuccessful && response.body() != null) {
                val apiOrders = response.body()!!
                val orders = apiOrders.map { item ->
                    Order(
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
                        sellerBusinessName = item.seller?.businessName ?: "Verified Supplier",
                        buyerBusinessName = item.buyer?.businessName ?: "Retail Partner",
                        unit = item.product?.unit ?: "kg",
                        imageUrl = item.product?.imageUrl
                    )
                }
                Resource.Success(orders)
            } else {
                Resource.Success(emptyList())
            }
        } catch (e: Exception) {
            Resource.Error(e.localizedMessage ?: "Failed to fetch orders from server")
        }
    }

    suspend fun createOrder(
        buyerId: String,
        sellerId: String,
        productId: String,
        quantity: Int,
        unitPrice: Double
    ): Resource<Boolean> = withContext(Dispatchers.IO) {
        val total = quantity * unitPrice
        try {
            val req = CreateOrderRequest(
                buyerId = buyerId,
                sellerId = sellerId,
                productId = productId,
                quantity = quantity,
                unitPrice = unitPrice,
                totalAmount = total
            )
            val response = api.createOrder(req)
            if (response.isSuccessful) {
                Resource.Success(true)
            } else {
                Resource.Error(response.errorBody()?.string() ?: "Order creation failed")
            }
        } catch (e: Exception) {
            Resource.Error(e.localizedMessage ?: "Network error creating order")
        }
    }
}
