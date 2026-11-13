package com.tradigoo.app.data.api

import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.*

interface TradigooApiService {

    // Auth Endpoints
    @POST("api/auth/signin")
    suspend fun signIn(
        @Body request: SignInRequest
    ): Response<SignInResponse>

    @POST("api/auth/signup")
    suspend fun signUp(
        @Body request: SignUpRequest
    ): Response<SignUpResponse>

    @POST("api/auth/google")
    suspend fun googleAuth(
        @Body request: GoogleAuthRequest
    ): Response<SignInResponse>

    @POST("api/auth/forgot-password")
    suspend fun forgotPassword(
        @Body request: ForgotPasswordRequest
    ): Response<GenericResponse>

    @POST("api/auth/signout")
    suspend fun signOut(): Response<GenericResponse>

    // Profile Endpoints
    @GET("api/profile")
    suspend fun getProfile(): Response<ProfileResponse>

    @PATCH("api/profile")
    suspend fun updateProfile(
        @Body request: UpdateProfileRequest
    ): Response<ProfileResponse>

    // Product Endpoints
    @GET("api/products")
    suspend fun getProducts(
        @Query("category") category: String? = null,
        @Query("search") search: String? = null,
        @Query("sort") sort: String? = null,
        @Query("verifiedOnly") verifiedOnly: Boolean? = null,
        @Query("sellerId") sellerId: String? = null,
        @Query("includeInactive") includeInactive: Boolean? = null,
        @Query("limit") limit: Int = 50
    ): Response<List<ApiProduct>>

    @GET("api/products/{id}")
    suspend fun getProductById(
        @Path("id") id: String
    ): Response<ApiProduct>

    @POST("api/products")
    suspend fun createProduct(
        @Body request: ApiCreateProductRequest
    ): Response<ApiProduct>

    @PUT("api/products/{id}")
    suspend fun updateProduct(
        @Path("id") id: String,
        @Body request: ApiUpdateProductRequest
    ): Response<ApiProduct>

    @DELETE("api/products/{id}")
    suspend fun deleteProduct(
        @Path("id") id: String
    ): Response<GenericResponse>

    @Multipart
    @POST("api/products/upload")
    suspend fun uploadProductImage(
        @Part file: MultipartBody.Part
    ): Response<ApiUploadResponse>

    // Cart & Checkout Endpoints
    @GET("api/cart")
    suspend fun getCart(): Response<List<ApiCartItem>>

    @POST("api/cart")
    suspend fun addToCart(
        @Body request: CartRequest
    ): Response<GenericResponse>

    @PUT("api/cart")
    suspend fun updateCartItem(
        @Body request: UpdateCartRequest
    ): Response<GenericResponse>

    @DELETE("api/cart")
    suspend fun deleteCartItem(
        @Query("id") id: String
    ): Response<GenericResponse>

    @POST("api/checkout")
    suspend fun checkout(): Response<CheckoutResponse>

    // Order Endpoints
    @GET("api/orders")
    suspend fun getOrders(
        @Query("role") role: String,
        @Query("userId") userId: String,
        @Query("limit") limit: Int = 50
    ): Response<List<ApiOrder>>

    @POST("api/order/create")
    suspend fun createOrder(
        @Body request: CreateOrderRequest
    ): Response<ApiOrder>

    @PATCH("api/orders/{id}/status")
    suspend fun updateOrderStatus(
        @Path("id") id: String,
        @Body request: UpdateOrderStatusRequest
    ): Response<OrderStatusResponse>

    @POST("api/orders/{id}/otp")
    suspend fun verifyOrderOtp(
        @Path("id") id: String,
        @Body request: OrderOtpRequest
    ): Response<OrderOtpResponse>

    // Dispute Endpoints
    @Multipart
    @POST("api/disputes/upload")
    suspend fun uploadDisputeEvidence(
        @Part file: MultipartBody.Part,
        @Part("orderId") orderId: RequestBody
    ): Response<ApiUploadResponse>

    @POST("api/disputes/raise")
    suspend fun raiseDispute(
        @Body request: RaiseDisputeRequest
    ): Response<RaiseDisputeResponse>

    // Support Tickets (Employee Operations & Founder Oversight)
    @GET("api/tickets")
    suspend fun getTickets(
        @Query("status") status: String? = null,
        @Query("assignedTo") assignedTo: String? = null
    ): Response<List<ApiSupportTicket>>

    @GET("api/tickets/{id}")
    suspend fun getTicketById(
        @Path("id") id: String
    ): Response<ApiSupportTicket>

    @PATCH("api/tickets/{id}")
    suspend fun updateTicket(
        @Path("id") id: String,
        @Body request: ApiUpdateTicketRequest
    ): Response<ApiSupportTicket>

    // Founder Platform Metrics
    @GET("api/admin/founder-stats")
    suspend fun getFounderStats(): Response<ApiFounderStats>

    // Real Supplier Trust Score
    @GET("api/trust-score/{userId}")
    suspend fun getTrustScore(
        @Path("userId") userId: String
    ): Response<ApiTrustScoreResponse>

    // AI Chat & Trade Brain Assistant
    @POST("api/chat")
    suspend fun askChat(
        @Body request: ApiChatRequest
    ): Response<ApiAiQueryResponse>

    @POST("api/trade-brain")
    suspend fun queryTradeBrain(
        @Body request: ApiAiQueryRequest
    ): Response<ApiAiQueryResponse>

    // Notifications
    @POST("api/notifications/register-token")
    suspend fun registerFcmToken(
        @Body request: RegisterTokenRequest
    ): Response<GenericResponse>
}
