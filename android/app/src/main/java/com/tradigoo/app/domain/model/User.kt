package com.tradigoo.app.domain.model

data class User(
    val id: String,
    val email: String,
    val role: UserRole,
    val name: String,
    val phone: String? = null,
    val businessName: String = "",
    val location: String = "India",
    val trustScore: Int = 500,
    val totalOrders: Int = 0,
    val successfulOrders: Int = 0,
    val disputedOrders: Int = 0,
    val gstNumber: String? = null,
    val gstVerified: Boolean = false,
    val businessType: String? = null,
    val businessAddress: String? = null,
    val pinCode: String? = null,
    val businessDescription: String? = null
)
