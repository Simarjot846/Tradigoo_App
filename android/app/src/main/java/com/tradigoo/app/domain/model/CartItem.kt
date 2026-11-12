package com.tradigoo.app.domain.model

data class CartItem(
    val id: String,
    val productId: String,
    val productName: String,
    val basePrice: Double,
    val unit: String = "kg",
    val quantity: Int,
    val imageUrl: String? = null,
    val sellerId: String? = null
) {
    val totalPrice: Double
        get() = basePrice * quantity
}
