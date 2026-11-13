package com.tradigoo.app.domain.model

data class Product(
    val id: String,
    val sellerId: String? = null,
    val name: String,
    val category: String,
    val basePrice: Double,
    val unit: String = "kg",
    val minOrderQuantity: Int = 1,
    val imageUrl: String? = null,
    val description: String = "",
    val demandLevel: String = "Standard",
    val demandScore: Int = 50,
    val expectedMargin: Double = 15.0,
    val supplierCount: Int = 1,
    val isActive: Boolean = true,
    val batchNumber: String? = null,
    val expiryDate: String? = null,
    val sellerName: String? = null,
    val sellerBusinessName: String? = null,
    val sellerLocation: String? = null,
    val sellerTrustScore: Int? = null,
    val sellerGstVerified: Boolean = false
)
