package com.tradigoo.app.data.api

import retrofit2.Response
import retrofit2.http.*

interface TradigooApiService {

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

    // Product Endpoints
    @GET("api/products")
    suspend fun getProducts(
        @Query("category") category: String? = null,
        @Query("limit") limit: Int = 50
    ): Response<List<ApiProduct>>

    @POST("api/products")
    suspend fun createProduct(
        @Body request: ApiCreateProductRequest
    ): Response<ApiProduct>

    @DELETE("api/products/{id}")
    suspend fun deleteProduct(
        @Path("id") id: String
    ): Response<GenericResponse>

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
    ): Response<GenericResponse>

    @POST("api/cart")
    suspend fun addToCart(
        @Body request: CartRequest
    ): Response<GenericResponse>

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

    // AI Trade Brain Assistant
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
