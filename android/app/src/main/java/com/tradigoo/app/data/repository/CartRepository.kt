package com.tradigoo.app.data.repository

import android.content.Context
import com.tradigoo.app.domain.model.CartItem
import com.tradigoo.app.domain.model.Product
import com.tradigoo.app.domain.model.Resource
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class CartRepository(private val context: Context) {

    private val _cartItems = MutableStateFlow<List<CartItem>>(
        listOf(
            CartItem(
                id = "cart_1",
                productId = "prod_1",
                productName = "Premium Sharbati Wheat (Atta)",
                basePrice = 36.50,
                unit = "kg",
                quantity = 100
            ),
            CartItem(
                id = "cart_2",
                productId = "prod_2",
                productName = "Organic Toor Dal (Polished)",
                basePrice = 145.00,
                unit = "kg",
                quantity = 50
            )
        )
    )
    val cartItems: StateFlow<List<CartItem>> = _cartItems.asStateFlow()

    fun addToCart(product: Product, quantity: Int = product.minOrderQuantity): Resource<Boolean> {
        val current = _cartItems.value.toMutableList()
        val existingIndex = current.indexOfFirst { it.productId == product.id }
        if (existingIndex >= 0) {
            val existing = current[existingIndex]
            current[existingIndex] = existing.copy(quantity = existing.quantity + quantity)
        } else {
            current.add(
                CartItem(
                    id = "cart_" + System.currentTimeMillis(),
                    productId = product.id,
                    productName = product.name,
                    basePrice = product.basePrice,
                    unit = product.unit,
                    quantity = quantity,
                    imageUrl = product.imageUrl,
                    sellerId = product.sellerId
                )
            )
        }
        _cartItems.value = current
        return Resource.Success(true)
    }

    fun updateQuantity(cartItemId: String, newQuantity: Int) {
        if (newQuantity <= 0) {
            removeFromCart(cartItemId)
            return
        }
        val current = _cartItems.value.toMutableList()
        val index = current.indexOfFirst { it.id == cartItemId }
        if (index >= 0) {
            current[index] = current[index].copy(quantity = newQuantity)
            _cartItems.value = current
        }
    }

    fun removeFromCart(cartItemId: String) {
        _cartItems.value = _cartItems.value.filter { it.id != cartItemId }
    }

    fun clearCart() {
        _cartItems.value = emptyList()
    }

    fun getSubtotal(): Double {
        return _cartItems.value.sumOf { it.totalPrice }
    }

    fun getGst(): Double {
        return getSubtotal() * 0.18
    }

    fun getTotal(): Double {
        return getSubtotal() + getGst()
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
