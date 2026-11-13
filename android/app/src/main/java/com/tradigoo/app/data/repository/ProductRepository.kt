package com.tradigoo.app.data.repository

import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
import com.google.gson.Gson
import com.tradigoo.app.data.api.ApiCreateProductRequest
import com.tradigoo.app.data.api.ApiProduct
import com.tradigoo.app.data.api.ApiUpdateProductRequest
import com.tradigoo.app.data.api.RetrofitClient
import com.tradigoo.app.data.local.SessionManager
import com.tradigoo.app.domain.model.Product
import com.tradigoo.app.domain.model.Resource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody

class ProductRepository(private val context: Context) {

    private val api = RetrofitClient.getApiService(context)
    private val sessionManager = SessionManager.getInstance(context)
    private val gson = Gson()

    suspend fun getProducts(
        category: String? = null,
        search: String? = null,
        sort: String? = null,
        verifiedOnly: Boolean? = null,
        sellerId: String? = null,
        includeInactive: Boolean? = null
    ): Resource<List<Product>> = withContext(Dispatchers.IO) {
        try {
            val response = api.getProducts(
                category = if (category == null || category == "All") null else category,
                search = search?.trim()?.takeIf { it.isNotBlank() },
                sort = sort,
                verifiedOnly = if (verifiedOnly == true) true else null,
                sellerId = sellerId?.takeIf { it.isNotBlank() },
                includeInactive = if (includeInactive == true) true else null,
                limit = 80
            )
            if (response.isSuccessful && response.body() != null) {
                Resource.Success(response.body()!!.map(::mapApiProduct))
            } else {
                Resource.Error(extractErrorMessage(response.errorBody()?.string()) ?: "Failed to load marketplace products")
            }
        } catch (e: Exception) {
            Resource.Error(e.localizedMessage ?: "Failed to load products from server", e)
        }
    }

    suspend fun getProductById(id: String): Resource<Product> = withContext(Dispatchers.IO) {
        try {
            val response = api.getProductById(id)
            if (response.isSuccessful && response.body() != null) {
                Resource.Success(mapApiProduct(response.body()!!))
            } else {
                Resource.Error(extractErrorMessage(response.errorBody()?.string()) ?: "Product not found")
            }
        } catch (e: Exception) {
            Resource.Error(e.localizedMessage ?: "Failed to load product details", e)
        }
    }

    suspend fun uploadProductImage(uri: Uri): Resource<String> = withContext(Dispatchers.IO) {
        try {
            val mimeType = context.contentResolver.getType(uri) ?: "image/jpeg"
            val bytes = context.contentResolver.openInputStream(uri)?.use { it.readBytes() }
                ?: return@withContext Resource.Error("Could not read selected image file.")

            if (bytes.size > 5 * 1024 * 1024) {
                return@withContext Resource.Error("Image is too large. Maximum allowed size is 5 MB.")
            }

            var fileName = "product_${System.currentTimeMillis()}.jpg"
            context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
                val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                if (nameIndex >= 0 && cursor.moveToFirst()) {
                    fileName = cursor.getString(nameIndex) ?: fileName
                }
            }

            val reqBody = bytes.toRequestBody(mimeType.toMediaTypeOrNull())
            val part = MultipartBody.Part.createFormData("file", fileName, reqBody)
            val response = api.uploadProductImage(part)
            val body = response.body()
            if (response.isSuccessful && body?.url != null) {
                Resource.Success(body.url)
            } else {
                Resource.Error(body?.error ?: extractErrorMessage(response.errorBody()?.string()) ?: "Failed to upload product image")
            }
        } catch (e: Exception) {
            Resource.Error(e.localizedMessage ?: "Error uploading product image", e)
        }
    }

    suspend fun addProduct(
        name: String,
        category: String,
        basePrice: Double,
        unit: String,
        minOrderQuantity: Int,
        description: String,
        imageUrl: String? = null,
        batchNumber: String? = null
    ): Resource<Product> = withContext(Dispatchers.IO) {
        try {
            val currentUser = sessionManager.getUser()
            val request = ApiCreateProductRequest(
                name = name.trim(),
                category = category.trim(),
                basePrice = basePrice,
                unit = unit.trim().ifBlank { "kg" },
                minOrderQuantity = minOrderQuantity.coerceAtLeast(1),
                description = description.trim(),
                imageUrl = imageUrl?.takeIf { it.isNotBlank() },
                batchNumber = batchNumber?.trim()?.takeIf { it.isNotBlank() },
                sellerId = currentUser?.id
            )
            val response = api.createProduct(request)
            if (response.isSuccessful && response.body() != null) {
                Resource.Success(mapApiProduct(response.body()!!))
            } else {
                Resource.Error(extractErrorMessage(response.errorBody()?.string()) ?: "Failed to publish product")
            }
        } catch (e: Exception) {
            Resource.Error(e.localizedMessage ?: "Network error creating product", e)
        }
    }

    suspend fun updateProduct(
        id: String,
        name: String? = null,
        category: String? = null,
        basePrice: Double? = null,
        unit: String? = null,
        minOrderQuantity: Int? = null,
        description: String? = null,
        isActive: Boolean? = null
    ): Resource<Product> = withContext(Dispatchers.IO) {
        try {
            val request = ApiUpdateProductRequest(
                name = name?.trim(),
                category = category?.trim(),
                basePrice = basePrice,
                unit = unit?.trim(),
                minOrderQuantity = minOrderQuantity,
                description = description?.trim(),
                isActive = isActive
            )
            val response = api.updateProduct(id, request)
            if (response.isSuccessful && response.body() != null) {
                Resource.Success(mapApiProduct(response.body()!!))
            } else {
                Resource.Error(extractErrorMessage(response.errorBody()?.string()) ?: "Failed to update product")
            }
        } catch (e: Exception) {
            Resource.Error(e.localizedMessage ?: "Error updating product", e)
        }
    }

    suspend fun deleteProduct(id: String): Resource<Boolean> = withContext(Dispatchers.IO) {
        try {
            val response = api.deleteProduct(id)
            if (response.isSuccessful) {
                Resource.Success(true)
            } else {
                Resource.Error(extractErrorMessage(response.errorBody()?.string()) ?: "Failed to delete product")
            }
        } catch (e: Exception) {
            Resource.Error(e.localizedMessage ?: "Error deleting product", e)
        }
    }

    private fun mapApiProduct(item: ApiProduct): Product {
        return Product(
            id = item.id,
            name = item.name,
            category = item.category,
            basePrice = item.basePrice,
            unit = item.unit ?: "kg",
            minOrderQuantity = item.minOrderQuantity ?: 1,
            imageUrl = item.imageUrl,
            description = item.description ?: "",
            demandLevel = item.demandLevel ?: "Standard",
            demandScore = item.demandScore ?: 75,
            expectedMargin = item.expectedMargin ?: 12.0,
            supplierCount = item.supplierCount ?: 1,
            isActive = item.isActive ?: true,
            batchNumber = item.batchNumber,
            expiryDate = item.expiryDate,
            sellerId = item.sellerId,
            sellerName = item.seller?.name,
            sellerBusinessName = item.seller?.businessName,
            sellerLocation = item.seller?.location,
            sellerTrustScore = item.seller?.trustScore,
            sellerGstVerified = item.seller?.gstVerified ?: false
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
