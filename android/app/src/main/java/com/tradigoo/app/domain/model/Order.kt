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
    val sellerLocation: String? = null,
    val sellerGstVerified: Boolean = false,
    val sellerTrustScore: Int? = null,
    val buyerBusinessName: String? = null,
    val buyerLocation: String? = null,
    val unit: String = "kg",
    val category: String? = null,
    val imageUrl: String? = null,
    val otp: String? = null,
    val otpVerified: Boolean = false,
    val inspectionDeadline: String? = null,
    val disputeReason: String? = null
) {
    fun normalizedStatus(): String {
        return when (status.trim().lowercase()) {
            "order_created", "payment_pending" -> "payment_pending"
            "payment_held", "payment_in_escrow" -> "payment_in_escrow"
            "shipped" -> "shipped"
            "courier_verified" -> "courier_verified"
            "delivered" -> "delivered"
            "otp_confirmed", "inspection", "inspection_pending" -> "inspection"
            "payment_released", "completed" -> "completed"
            "disputed" -> "disputed"
            "cancelled" -> "cancelled"
            "refunded" -> "refunded"
            else -> status.trim().lowercase()
        }
    }
}
