package com.tradigoo.app.domain.model

data class CartItem(
    val id: String,
    val productId: String,
    val productName: String,
    val category: String = "General",
    val basePrice: Double,
    val unit: String = "kg",
    val minOrderQuantity: Int = 1,
    val quantity: Int,
    val imageUrl: String? = null,
    val sellerId: String? = null,
    val sellerBusinessName: String? = null
) {
    val totalPrice: Double
        get() = basePrice * quantity

    val gstRate: Int
        get() = TaxCalculator.getGstRateForCategory(category)
}
