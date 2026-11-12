package com.tradigoo.app.data.repository

import android.content.Context
import com.tradigoo.app.data.api.ApiCreateProductRequest
import com.tradigoo.app.data.api.RetrofitClient
import com.tradigoo.app.data.local.SessionManager
import com.tradigoo.app.domain.model.Product
import com.tradigoo.app.domain.model.Resource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class ProductRepository(private val context: Context) {

    private val api = RetrofitClient.getApiService(context)
    private val sessionManager = SessionManager.getInstance(context)

    suspend fun getProducts(category: String? = null): Resource<List<Product>> = withContext(Dispatchers.IO) {
        try {
            val response = api.getProducts(category = if (category == "All") null else category, limit = 50)
            if (response.isSuccessful && response.body() != null) {
                val apiList = response.body()!!
                val products = apiList.map { item ->
                    Product(
                        id = item.id,
                        name = item.name,
                        category = item.category,
                        basePrice = item.basePrice,
                        unit = item.unit ?: "kg",
                        minOrderQuantity = item.minOrderQuantity ?: 1,
                        imageUrl = item.imageUrl,
                        description = item.description ?: "",
                        demandLevel = item.demandLevel ?: "High",
                        demandScore = item.demandScore ?: 80,
                        expectedMargin = item.expectedMargin ?: 12.0,
                        sellerId = item.sellerId
                    )
                }
                Resource.Success(products)
            } else {
                Resource.Success(emptyList())
            }
        } catch (e: Exception) {
            Resource.Error(e.localizedMessage ?: "Failed to load products from server")
        }
    }

    suspend fun addProduct(
        name: String,
        category: String,
        basePrice: Double,
        unit: String,
        minOrderQuantity: Int,
        description: String,
        imageUrl: String? = null
    ): Resource<Product> = withContext(Dispatchers.IO) {
        try {
            val currentUser = sessionManager.getUser()
            val request = ApiCreateProductRequest(
                name = name,
                category = category,
                basePrice = basePrice,
                unit = unit,
                minOrderQuantity = minOrderQuantity,
                description = description,
                imageUrl = imageUrl,
                sellerId = currentUser?.id
            )
            val response = api.createProduct(request)
            if (response.isSuccessful && response.body() != null) {
                val item = response.body()!!
                val product = Product(
                    id = item.id,
                    name = item.name,
                    category = item.category,
                    basePrice = item.basePrice,
                    unit = item.unit ?: unit,
                    minOrderQuantity = item.minOrderQuantity ?: minOrderQuantity,
                    imageUrl = item.imageUrl ?: imageUrl,
                    description = item.description ?: description,
                    sellerId = item.sellerId ?: currentUser?.id
                )
                Resource.Success(product)
            } else {
                Resource.Error(response.errorBody()?.string() ?: "Failed to publish product")
            }
        } catch (e: Exception) {
            Resource.Error(e.localizedMessage ?: "Network error creating product")
        }
    }

    suspend fun deleteProduct(id: String): Resource<Boolean> = withContext(Dispatchers.IO) {
        try {
            val response = api.deleteProduct(id)
            if (response.isSuccessful) {
                Resource.Success(true)
            } else {
                Resource.Error("Failed to delete product")
            }
        } catch (e: Exception) {
            Resource.Error(e.localizedMessage ?: "Error deleting product")
        }
    }
}
