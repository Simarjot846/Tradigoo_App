package com.tradigoo.app.data.repository

import android.content.Context
import com.google.gson.Gson
import com.tradigoo.app.data.api.CartRequest
import com.tradigoo.app.data.api.RetrofitClient
import com.tradigoo.app.data.api.UpdateCartRequest
import com.tradigoo.app.domain.model.CartItem
import com.tradigoo.app.domain.model.Product
import com.tradigoo.app.domain.model.Resource
import com.tradigoo.app.domain.model.TaxCalculator
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext

class CartRepository(private val context: Context) {

    private val api = RetrofitClient.getApiService(context)
    private val gson = Gson()

    private val _cartItems = MutableStateFlow<List<CartItem>>(emptyList())
    val cartItems: StateFlow<List<CartItem>> = _cartItems.asStateFlow()

    suspend fun refreshCart(): Resource<List<CartItem>> = withContext(Dispatchers.IO) {
        try {
            val response = api.getCart()
            if (response.isSuccessful && response.body() != null) {
                val mapped = response.body()!!.mapNotNull { apiItem ->
                    val p = apiItem.product ?: return@mapNotNull null
                    CartItem(
                        id = apiItem.id,
                        productId = p.id,
                        productName = p.name,
                        category = p.category,
                        basePrice = p.basePrice,
                        unit = p.unit ?: "kg",
                        minOrderQuantity = (p.minOrderQuantity ?: 1).coerceAtLeast(1),
                        quantity = apiItem.quantity,
                        imageUrl = p.imageUrl,
                        sellerId = p.sellerId,
                        sellerBusinessName = p.seller?.businessName ?: p.seller?.name
                    )
                }
                _cartItems.value = mapped
                Resource.Success(mapped)
            } else {
                Resource.Error(extractErrorMessage(response.errorBody()?.string()) ?: "Unable to sync cart")
            }
        } catch (e: Exception) {
            Resource.Error(e.localizedMessage ?: "Network error loading cart", e)
        }
    }

    suspend fun addToCart(product: Product, quantity: Int = product.minOrderQuantity): Resource<Boolean> =
        withContext(Dispatchers.IO) {
            try {
                val safeQty = quantity.coerceAtLeast(product.minOrderQuantity.coerceAtLeast(1))
                val response = api.addToCart(CartRequest(productId = product.id, quantity = safeQty))
                val body = response.body()
                if (response.isSuccessful && (body?.success != false)) {
                    refreshCart()
                    Resource.Success(true)
                } else {
                    Resource.Error(body?.error ?: extractErrorMessage(response.errorBody()?.string()) ?: "Could not add item to cart")
                }
            } catch (e: Exception) {
                Resource.Error(e.localizedMessage ?: "Network error adding item to cart", e)
            }
        }

    suspend fun updateQuantity(cartItemId: String, newQuantity: Int): Resource<Boolean> =
        withContext(Dispatchers.IO) {
            if (newQuantity <= 0) {
                return@withContext removeFromCart(cartItemId)
            }
            val currentItem = _cartItems.value.firstOrNull { it.id == cartItemId }
            val moq = (currentItem?.minOrderQuantity ?: 1).coerceAtLeast(1)
            if (newQuantity < moq) {
                return@withContext Resource.Error("Quantity cannot be below minimum order quantity ($moq).")
            }

            try {
                val response = api.updateCartItem(UpdateCartRequest(id = cartItemId, quantity = newQuantity))
                val body = response.body()
                if (response.isSuccessful && (body?.success != false)) {
                    refreshCart()
                    Resource.Success(true)
                } else {
                    Resource.Error(body?.error ?: extractErrorMessage(response.errorBody()?.string()) ?: "Failed to update quantity")
                }
            } catch (e: Exception) {
                Resource.Error(e.localizedMessage ?: "Network error updating cart", e)
            }
        }

    suspend fun removeFromCart(cartItemId: String): Resource<Boolean> = withContext(Dispatchers.IO) {
        try {
            val response = api.deleteCartItem(cartItemId)
            val body = response.body()
            if (response.isSuccessful && (body?.success != false)) {
                _cartItems.value = _cartItems.value.filterNot { it.id == cartItemId }
                Resource.Success(true)
            } else {
                Resource.Error(body?.error ?: extractErrorMessage(response.errorBody()?.string()) ?: "Failed to remove item")
            }
        } catch (e: Exception) {
            Resource.Error(e.localizedMessage ?: "Network error removing item", e)
        }
    }

    suspend fun checkout(): Resource<List<String>> = withContext(Dispatchers.IO) {
        try {
            val response = api.checkout()
            val body = response.body()
            if (response.isSuccessful && body?.success == true) {
                _cartItems.value = emptyList()
                Resource.Success(body.orderIds ?: emptyList())
            } else {
                Resource.Error(body?.error ?: extractErrorMessage(response.errorBody()?.string()) ?: "Checkout failed")
            }
        } catch (e: Exception) {
            Resource.Error(e.localizedMessage ?: "Network error during checkout", e)
        }
    }

    fun clearLocalCache() {
        _cartItems.value = emptyList()
    }

    fun getSubtotal(): Double = TaxCalculator.calculateCartTotals(_cartItems.value).subtotal

    fun getGst(): Double = TaxCalculator.calculateCartTotals(_cartItems.value).gstAmount

    fun getTotal(): Double = TaxCalculator.calculateCartTotals(_cartItems.value).totalAmount

    private fun extractErrorMessage(rawBody: String?): String? {
        if (rawBody.isNullOrBlank()) return null
        return try {
            val map = gson.fromJson(rawBody, Map::class.java)
            (map?.get("error") as? String) ?: (map?.get("message") as? String) ?: rawBody
        } catch (_: Exception) {
            rawBody
        }
    }

    companion object {
        @Volatile
        private var instance: CartRepository? = null

        fun getInstance(context: Context): CartRepository {
            return instance ?: synchronized(this) {
                instance ?: CartRepository(context.applicationContext).also { instance = it }
            }
        }
    }
}
