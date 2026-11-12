package com.tradigoo.app.domain.model

data class Product(
    val id: String,
    val sellerId: String? = null,
    val name: String,
    val category: String,
    val basePrice: Double,
    val unit: String = "kg",
    val minOrderQuantity: Int = 10,
    val imageUrl: String? = null,
    val description: String = "",
    val demandLevel: String = "High",
    val demandScore: Int = 85,
    val expectedMargin: Double = 12.0,
    val supplierCount: Int = 1,
    val isActive: Boolean = true
)
