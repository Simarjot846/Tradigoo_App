package com.tradigoo.app.domain.model

data class Order(
    val id: String,
    val buyerId: String,
    val sellerId: String,
    val productId: String,
    val productName: String,
    val quantity: Int,
    val unitPrice: Double,
    val totalAmount: Double,
    val status: String,
    val createdAt: String,
    val sellerBusinessName: String? = null,
    val buyerBusinessName: String? = null,
    val unit: String = "kg",
    val imageUrl: String? = null
)
