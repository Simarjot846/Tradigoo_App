package com.tradigoo.app.data.api

import com.google.gson.annotations.SerializedName

data class SignInRequest(
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String
)

data class SignInResponse(
    @SerializedName("user") val user: ApiUser?,
    @SerializedName("token") val token: String? = null,
    @SerializedName("error") val error: String? = null
)

data class GoogleAuthRequest(
    @SerializedName("idToken") val idToken: String? = null,
    @SerializedName("accessToken") val accessToken: String? = null,
    @SerializedName("role") val role: String = "retailer",
    @SerializedName("name") val name: String? = null,
    @SerializedName("email") val email: String? = null,
    @SerializedName("businessName") val businessName: String? = null,
    @SerializedName("phone") val phone: String? = null,
    @SerializedName("location") val location: String? = null
)

data class SignUpRequest(
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String,
    @SerializedName("userData") val userData: UserDataRequest
)

data class UserDataRequest(
    @SerializedName("name") val name: String,
    @SerializedName("role") val role: String,
    @SerializedName("business_name") val businessName: String,
    @SerializedName("phone") val phone: String?,
    @SerializedName("location") val location: String,
    @SerializedName("gstin") val gstin: String? = null
)

data class SignUpResponse(
    @SerializedName("user") val user: ApiUser?,
    @SerializedName("token") val token: String? = null,
    @SerializedName("message") val message: String?,
    @SerializedName("error") val error: String?
)

data class ForgotPasswordRequest(
    @SerializedName("email") val email: String
)

data class ApiUser(
    @SerializedName("id") val id: String,
    @SerializedName("email") val email: String?,
    @SerializedName("role") val role: String? = null,
    @SerializedName("user_metadata") val userMetadata: Map<String, Any>?
)

data class ApiProfileData(
    @SerializedName("id") val id: String,
    @SerializedName("email") val email: String?,
    @SerializedName("role") val role: String?,
    @SerializedName("name") val name: String?,
    @SerializedName("phone") val phone: String? = null,
    @SerializedName("business_name") val businessName: String? = null,
    @SerializedName("location") val location: String? = null,
    @SerializedName("gst_number") val gstNumber: String? = null,
    @SerializedName("gst_verified") val gstVerified: Boolean? = null,
    @SerializedName("business_type") val businessType: String? = null,
    @SerializedName("business_address") val businessAddress: String? = null,
    @SerializedName("pin_code") val pinCode: String? = null,
    @SerializedName("business_description") val businessDescription: String? = null,
    @SerializedName("trust_score") val trustScore: Int? = null,
    @SerializedName("total_orders") val totalOrders: Int? = null,
    @SerializedName("successful_orders") val successfulOrders: Int? = null,
    @SerializedName("disputed_orders") val disputedOrders: Int? = null
)

data class ProfileResponse(
    @SerializedName("user") val user: ApiProfileData? = null,
    @SerializedName("success") val success: Boolean? = null,
    @SerializedName("error") val error: String? = null
)

data class UpdateProfileRequest(
    @SerializedName("name") val name: String,
    @SerializedName("phone") val phone: String? = null,
    @SerializedName("business_name") val businessName: String,
    @SerializedName("location") val location: String,
    @SerializedName("gst_number") val gstNumber: String? = null,
    @SerializedName("business_type") val businessType: String? = null,
    @SerializedName("business_address") val businessAddress: String? = null,
    @SerializedName("pin_code") val pinCode: String? = null,
    @SerializedName("business_description") val businessDescription: String? = null
)

data class ApiProduct(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("category") val category: String,
    @SerializedName("base_price") val basePrice: Double,
    @SerializedName("unit") val unit: String?,
    @SerializedName("min_order_quantity") val minOrderQuantity: Int?,
    @SerializedName("image_url") val imageUrl: String?,
    @SerializedName("description") val description: String?,
    @SerializedName("demand_level") val demandLevel: String?,
    @SerializedName("demand_score") val demandScore: Int?,
    @SerializedName("expected_margin") val expectedMargin: Double?,
    @SerializedName("supplier_count") val supplierCount: Int? = null,
    @SerializedName("is_active") val isActive: Boolean? = true,
    @SerializedName("batch_number") val batchNumber: String? = null,
    @SerializedName("expiry_date") val expiryDate: String? = null,
    @SerializedName("seller_id") val sellerId: String? = null,
    @SerializedName("seller") val seller: ApiNestedProfile? = null
)

data class ApiCreateProductRequest(
    @SerializedName("name") val name: String,
    @SerializedName("category") val category: String,
    @SerializedName("base_price") val basePrice: Double,
    @SerializedName("unit") val unit: String = "kg",
    @SerializedName("min_order_quantity") val minOrderQuantity: Int = 1,
    @SerializedName("description") val description: String = "",
    @SerializedName("image_url") val imageUrl: String? = null,
    @SerializedName("batch_number") val batchNumber: String? = null,
    @SerializedName("expiry_date") val expiryDate: String? = null,
    @SerializedName("is_active") val isActive: Boolean = true,
    @SerializedName("seller_id") val sellerId: String? = null
)

data class ApiUpdateProductRequest(
    @SerializedName("name") val name: String? = null,
    @SerializedName("category") val category: String? = null,
    @SerializedName("base_price") val basePrice: Double? = null,
    @SerializedName("unit") val unit: String? = null,
    @SerializedName("min_order_quantity") val minOrderQuantity: Int? = null,
    @SerializedName("description") val description: String? = null,
    @SerializedName("image_url") val imageUrl: String? = null,
    @SerializedName("batch_number") val batchNumber: String? = null,
    @SerializedName("expiry_date") val expiryDate: String? = null,
    @SerializedName("is_active") val isActive: Boolean? = null
)

data class ApiUploadResponse(
    @SerializedName("success") val success: Boolean? = null,
    @SerializedName("url") val url: String? = null,
    @SerializedName("path") val path: String? = null,
    @SerializedName("error") val error: String? = null
)

data class ApiOrder(
    @SerializedName("id") val id: String,
    @SerializedName("buyer_id") val buyerId: String,
    @SerializedName("seller_id") val sellerId: String,
    @SerializedName("product_id") val productId: String,
    @SerializedName("quantity") val quantity: Int,
    @SerializedName("unit_price") val unitPrice: Double,
    @SerializedName("total_amount") val totalAmount: Double,
    @SerializedName("status") val status: String,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("otp") val otp: String? = null,
    @SerializedName("otp_verified") val otpVerified: Boolean? = null,
    @SerializedName("inspection_deadline") val inspectionDeadline: String? = null,
    @SerializedName("dispute_reason") val disputeReason: String? = null,
    @SerializedName("product") val product: ApiNestedProduct?,
    @SerializedName("seller") val seller: ApiNestedProfile?,
    @SerializedName("buyer") val buyer: ApiNestedProfile?
)

data class ApiNestedProduct(
    @SerializedName("id") val id: String? = null,
    @SerializedName("name") val name: String?,
    @SerializedName("category") val category: String? = null,
    @SerializedName("image_url") val imageUrl: String?,
    @SerializedName("unit") val unit: String?
)

data class ApiNestedProfile(
    @SerializedName("id") val id: String? = null,
    @SerializedName("name") val name: String? = null,
    @SerializedName("business_name") val businessName: String? = null,
    @SerializedName("location") val location: String? = null,
    @SerializedName("gst_verified") val gstVerified: Boolean? = null,
    @SerializedName("trust_score") val trustScore: Int? = null
)

data class CreateOrderRequest(
    @SerializedName("seller_id") val sellerId: String,
    @SerializedName("product_id") val productId: String,
    @SerializedName("quantity") val quantity: Int
)

data class UpdateOrderStatusRequest(
    @SerializedName("status") val status: String
)

data class OrderStatusResponse(
    @SerializedName("success") val success: Boolean? = null,
    @SerializedName("status") val status: String? = null,
    @SerializedName("order") val order: ApiOrder? = null,
    @SerializedName("error") val error: String? = null
)

data class OrderOtpRequest(
    @SerializedName("action") val action: String,
    @SerializedName("code") val code: String? = null
)

data class OrderOtpResponse(
    @SerializedName("success") val success: Boolean? = null,
    @SerializedName("status") val status: String? = null,
    @SerializedName("message") val message: String? = null,
    @SerializedName("error") val error: String? = null
)

data class RaiseDisputeRequest(
    @SerializedName("orderId") val orderId: String,
    @SerializedName("reason") val reason: String,
    @SerializedName("evidenceUrls") val evidenceUrls: List<String> = emptyList()
)

data class RaiseDisputeResponse(
    @SerializedName("success") val success: Boolean? = null,
    @SerializedName("status") val status: String? = null,
    @SerializedName("message") val message: String? = null,
    @SerializedName("error") val error: String? = null
)

// Cart DTOs matching /api/cart & /api/checkout
data class ApiCartItem(
    @SerializedName("id") val id: String,
    @SerializedName("quantity") val quantity: Int,
    @SerializedName("product") val product: ApiProduct? = null
)

data class CartRequest(
    @SerializedName("product_id") val productId: String,
    @SerializedName("quantity") val quantity: Int
)

data class UpdateCartRequest(
    @SerializedName("id") val id: String,
    @SerializedName("quantity") val quantity: Int
)

data class CheckoutResponse(
    @SerializedName("success") val success: Boolean? = null,
    @SerializedName("orderIds") val orderIds: List<String>? = null,
    @SerializedName("error") val error: String? = null
)

data class GenericResponse(
    @SerializedName("success") val success: Boolean?,
    @SerializedName("error") val error: String?,
    @SerializedName("message") val message: String? = null
)

data class RegisterTokenRequest(
    @SerializedName("userId") val userId: String?,
    @SerializedName("token") val token: String,
    @SerializedName("role") val role: String?,
    @SerializedName("platform") val platform: String = "android"
)

// Support Ticket DTOs
data class ApiSupportTicket(
    @SerializedName("id") val id: String,
    @SerializedName("ticket_number") val ticketNumber: String,
    @SerializedName("customer_id") val customerId: String,
    @SerializedName("customer_name") val customerName: String,
    @SerializedName("customer_email") val customerEmail: String,
    @SerializedName("customer_phone") val customerPhone: String? = null,
    @SerializedName("order_id") val orderId: String? = null,
    @SerializedName("subject") val subject: String,
    @SerializedName("category") val category: String,
    @SerializedName("priority") val priority: String,
    @SerializedName("status") val status: String,
    @SerializedName("assigned_to") val assignedTo: String? = null,
    @SerializedName("internal_notes") val internalNotes: List<String> = emptyList(),
    @SerializedName("messages") val messages: List<ApiTicketMessage> = emptyList(),
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String,
    @SerializedName("resolution_notes") val resolutionNotes: String? = null
)

data class ApiTicketMessage(
    @SerializedName("sender") val sender: String,
    @SerializedName("role") val role: String,
    @SerializedName("message") val message: String,
    @SerializedName("timestamp") val timestamp: String
)

data class ApiUpdateTicketRequest(
    @SerializedName("status") val status: String? = null,
    @SerializedName("assignedTo") val assignedTo: String? = null,
    @SerializedName("internalNote") val internalNote: String? = null,
    @SerializedName("replyMessage") val replyMessage: String? = null,
    @SerializedName("senderName") val senderName: String? = null,
    @SerializedName("senderRole") val senderRole: String? = "employee",
    @SerializedName("resolutionNotes") val resolutionNotes: String? = null,
    @SerializedName("priority") val priority: String? = null
)

// Founder Metrics DTO
data class ApiFounderStats(
    @SerializedName("totalRetailers") val totalRetailers: Int,
    @SerializedName("totalWholesalers") val totalWholesalers: Int,
    @SerializedName("totalActiveProducts") val totalActiveProducts: Int,
    @SerializedName("totalOrders") val totalOrders: Int,
    @SerializedName("pendingOrders") val pendingOrders: Int,
    @SerializedName("completedOrders") val completedOrders: Int,
    @SerializedName("cancelledOrders") val cancelledOrders: Int,
    @SerializedName("pendingDisputes") val pendingDisputes: Int,
    @SerializedName("pendingSupplierVerification") val pendingSupplierVerification: Int,
    @SerializedName("platformTransactionVolume") val platformTransactionVolume: Double,
    @SerializedName("platformHealth") val platformHealth: String,
    @SerializedName("serverTimestamp") val serverTimestamp: String
)

// Trust Score DTO
data class ApiTrustScoreResponse(
    @SerializedName("userId") val userId: String,
    @SerializedName("hasEnoughData") val hasEnoughData: Boolean,
    @SerializedName("score") val score: Int?,
    @SerializedName("totalOrders") val totalOrders: Int,
    @SerializedName("completedOrders") val completedOrders: Int,
    @SerializedName("disputedOrders") val disputedOrders: Int,
    @SerializedName("completionRate") val completionRate: Int? = null,
    @SerializedName("gstVerified") val gstVerified: Boolean,
    @SerializedName("label") val label: String,
    @SerializedName("explanation") val explanation: String? = null,
    @SerializedName("methodology") val methodology: String? = null
)

// AI Chat & Trade Brain DTOs
data class ApiChatHistoryItem(
    @SerializedName("role") val role: String,
    @SerializedName("content") val content: String
)

data class ApiChatRequest(
    @SerializedName("message") val message: String,
    @SerializedName("history") val history: List<ApiChatHistoryItem> = emptyList()
)

data class ApiAiQueryRequest(
    @SerializedName("query") val query: String,
    @SerializedName("role") val role: String = "retailer"
)

data class ApiAiQueryResponse(
    @SerializedName("recommendation") val recommendation: String? = null,
    @SerializedName("reply") val reply: String? = null,
    @SerializedName("provider") val provider: String? = null,
    @SerializedName("model") val model: String? = null,
    @SerializedName("error") val error: String? = null
)
