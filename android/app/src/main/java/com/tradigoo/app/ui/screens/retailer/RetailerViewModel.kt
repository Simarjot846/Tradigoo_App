package com.tradigoo.app.ui.screens.retailer

import android.app.Application
import android.net.Uri
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.tradigoo.app.data.api.ApiTrustScoreResponse
import com.tradigoo.app.data.local.SessionManager
import com.tradigoo.app.data.repository.AdminRepository
import com.tradigoo.app.data.repository.AuthRepository
import com.tradigoo.app.data.repository.CartRepository
import com.tradigoo.app.data.repository.OrderRepository
import com.tradigoo.app.data.repository.ProductRepository
import com.tradigoo.app.domain.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class RetailerUiState(
    val isLoading: Boolean = false,
    val isActionLoading: Boolean = false,
    val user: User? = null,
    val trustScore: ApiTrustScoreResponse? = null,
    val products: List<Product> = emptyList(),
    val filteredProducts: List<Product> = emptyList(),
    val orders: List<Order> = emptyList(),
    val cartItems: List<CartItem> = emptyList(),
    val selectedCategory: String = "All",
    val searchQuery: String = "",
    val sortOption: String = "relevance",
    val verifiedOnly: Boolean = false,
    val error: String? = null,
    val actionMessage: String? = null,
    val orderPlacedSuccess: Boolean = false
)

class RetailerViewModel(application: Application) : AndroidViewModel(application) {

    private val authRepository = AuthRepository(application)
    private val adminRepository = AdminRepository(application)
    private val productRepository = ProductRepository(application)
    private val orderRepository = OrderRepository(application)
    private val cartRepository = CartRepository.getInstance(application)
    private val sessionManager = SessionManager.getInstance(application)

    private val _uiState = MutableStateFlow(RetailerUiState())
    val uiState: StateFlow<RetailerUiState> = _uiState.asStateFlow()

    init {
        loadData()
        observeCart()
    }

    private fun observeCart() {
        viewModelScope.launch {
            cartRepository.cartItems.collect { items ->
                _uiState.value = _uiState.value.copy(cartItems = items)
            }
        }
    }

    fun loadData() {
        val cachedUser = sessionManager.getUser()
        _uiState.value = _uiState.value.copy(
            isLoading = true,
            user = cachedUser,
            error = null
        )

        viewModelScope.launch {
            // 1. Refresh user profile from server
            val activeUser = when (val profRes = authRepository.refreshProfile()) {
                is Resource.Success -> {
                    _uiState.value = _uiState.value.copy(user = profRes.data)
                    profRes.data
                }
                else -> cachedUser
            }

            // 2. Load catalog products
            val state = _uiState.value
            when (val prodResult = productRepository.getProducts(
                sort = state.sortOption,
                verifiedOnly = state.verifiedOnly
            )) {
                is Resource.Success -> {
                    _uiState.value = _uiState.value.copy(
                        products = prodResult.data,
                        isLoading = false
                    )
                    applyFilters()
                }
                is Resource.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = prodResult.message
                    )
                }
                else -> {
                    _uiState.value = _uiState.value.copy(isLoading = false)
                }
            }

            // 3. Load cart, orders & live trust score when authenticated
            if (activeUser != null) {
                cartRepository.refreshCart()

                when (val ordResult = orderRepository.getOrders(activeUser.id, UserRole.RETAILER)) {
                    is Resource.Success -> {
                        _uiState.value = _uiState.value.copy(orders = ordResult.data)
                    }
                    is Resource.Error -> {
                        if (_uiState.value.error == null) {
                            _uiState.value = _uiState.value.copy(error = ordResult.message)
                        }
                    }
                    else -> {}
                }

                when (val trustRes = adminRepository.getTrustScore(activeUser.id)) {
                    is Resource.Success -> {
                        _uiState.value = _uiState.value.copy(trustScore = trustRes.data)
                    }
                    else -> {}
                }
            }
        }
    }

    fun selectCategory(category: String) {
        _uiState.value = _uiState.value.copy(selectedCategory = category)
        applyFilters()
    }

    fun searchProducts(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
        applyFilters()
    }

    fun setSortOption(sort: String) {
        _uiState.value = _uiState.value.copy(sortOption = sort)
        applyFilters()
    }

    fun toggleVerifiedOnly(enabled: Boolean) {
        _uiState.value = _uiState.value.copy(verifiedOnly = enabled)
        applyFilters()
    }

    private fun applyFilters() {
        val state = _uiState.value
        val query = state.searchQuery.trim()
        val category = state.selectedCategory

        var filtered = state.products.filter { product ->
            val matchCategory = category == "All" || product.category.equals(category, ignoreCase = true)
            val matchVerified = !state.verifiedOnly || product.sellerGstVerified
            val matchQuery = query.isBlank() ||
                product.name.contains(query, ignoreCase = true) ||
                product.category.contains(query, ignoreCase = true) ||
                product.description.contains(query, ignoreCase = true) ||
                (product.sellerBusinessName?.contains(query, ignoreCase = true) == true) ||
                (product.sellerLocation?.contains(query, ignoreCase = true) == true)
            matchCategory && matchVerified && matchQuery
        }

        filtered = when (state.sortOption) {
            "price-low" -> filtered.sortedBy { it.basePrice }
            "price-high" -> filtered.sortedByDescending { it.basePrice }
            "moq-low" -> filtered.sortedBy { it.minOrderQuantity }
            "trust" -> filtered.sortedByDescending { it.sellerTrustScore ?: 0 }
            else -> filtered.sortedByDescending { it.demandScore }
        }

        _uiState.value = _uiState.value.copy(filteredProducts = filtered)
    }

    fun addToCart(product: Product, quantity: Int = product.minOrderQuantity, onAdded: (() -> Unit)? = null) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isActionLoading = true, error = null)
            when (val res = cartRepository.addToCart(product, quantity)) {
                is Resource.Success -> {
                    _uiState.value = _uiState.value.copy(
                        isActionLoading = false,
                        actionMessage = "Added ${quantity.coerceAtLeast(product.minOrderQuantity)} ${product.unit} of ${product.name} to cart"
                    )
                    onAdded?.invoke()
                }
                is Resource.Error -> {
                    _uiState.value = _uiState.value.copy(isActionLoading = false, error = res.message)
                }
                else -> {
                    _uiState.value = _uiState.value.copy(isActionLoading = false)
                }
            }
        }
    }

    fun updateCartQuantity(cartItemId: String, newQuantity: Int) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(error = null)
            val res = cartRepository.updateQuantity(cartItemId, newQuantity)
            if (res is Resource.Error) {
                _uiState.value = _uiState.value.copy(error = res.message)
            }
        }
    }

    fun removeFromCart(cartItemId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(error = null)
            val res = cartRepository.removeFromCart(cartItemId)
            if (res is Resource.Error) {
                _uiState.value = _uiState.value.copy(error = res.message)
            }
        }
    }

    fun checkout(onSuccess: () -> Unit) {
        val items = _uiState.value.cartItems
        if (items.isEmpty()) return

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isActionLoading = true, error = null)
            when (val result = cartRepository.checkout()) {
                is Resource.Success -> {
                    _uiState.value = _uiState.value.copy(
                        isActionLoading = false,
                        orderPlacedSuccess = true,
                        actionMessage = "Escrow order(s) placed (${result.data.size} shipment${if (result.data.size == 1) "" else "s"})."
                    )
                    loadData()
                    onSuccess()
                }
                is Resource.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isActionLoading = false,
                        error = result.message
                    )
                }
                else -> {
                    _uiState.value = _uiState.value.copy(isActionLoading = false)
                }
            }
        }
    }

    fun verifyOrderOtp(orderId: String, otpCode: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isActionLoading = true, error = null)
            when (val res = orderRepository.verifyDeliveryOtp(orderId, otpCode)) {
                is Resource.Success -> {
                    _uiState.value = _uiState.value.copy(isActionLoading = false, actionMessage = res.data)
                    loadData()
                }
                is Resource.Error -> {
                    _uiState.value = _uiState.value.copy(isActionLoading = false, error = res.message)
                }
                else -> {
                    _uiState.value = _uiState.value.copy(isActionLoading = false)
                }
            }
        }
    }

    fun confirmOrderQuality(orderId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isActionLoading = true, error = null)
            when (val res = orderRepository.updateOrderStatus(orderId, "completed")) {
                is Resource.Success -> {
                    _uiState.value = _uiState.value.copy(
                        isActionLoading = false,
                        actionMessage = "Quality confirmed! Escrow funds released to wholesaler."
                    )
                    loadData()
                }
                is Resource.Error -> {
                    _uiState.value = _uiState.value.copy(isActionLoading = false, error = res.message)
                }
                else -> {
                    _uiState.value = _uiState.value.copy(isActionLoading = false)
                }
            }
        }
    }

    fun raiseDispute(orderId: String, reason: String, evidenceUri: Uri? = null) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isActionLoading = true, error = null)
            val evidenceUrls = mutableListOf<String>()
            if (evidenceUri != null) {
                when (val uploadRes = orderRepository.uploadDisputeEvidence(orderId, evidenceUri)) {
                    is Resource.Success -> evidenceUrls.add(uploadRes.data)
                    is Resource.Error -> {
                        _uiState.value = _uiState.value.copy(
                            isActionLoading = false,
                            error = "Evidence upload failed: ${uploadRes.message}"
                        )
                        return@launch
                    }
                    else -> {}
                }
            }

            when (val res = orderRepository.raiseDispute(orderId, reason, evidenceUrls)) {
                is Resource.Success -> {
                    _uiState.value = _uiState.value.copy(isActionLoading = false, actionMessage = res.data)
                    loadData()
                }
                is Resource.Error -> {
                    _uiState.value = _uiState.value.copy(isActionLoading = false, error = res.message)
                }
                else -> {
                    _uiState.value = _uiState.value.copy(isActionLoading = false)
                }
            }
        }
    }

    fun updateProfile(
        name: String,
        phone: String?,
        businessName: String,
        location: String,
        gstNumber: String?,
        businessAddress: String?,
        pinCode: String?,
        onSaved: () -> Unit = {}
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isActionLoading = true, error = null)
            when (val res = authRepository.updateProfile(
                name = name,
                phone = phone,
                businessName = businessName,
                location = location,
                gstNumber = gstNumber,
                businessAddress = businessAddress,
                pinCode = pinCode
            )) {
                is Resource.Success -> {
                    _uiState.value = _uiState.value.copy(
                        isActionLoading = false,
                        user = res.data,
                        actionMessage = "Business profile updated successfully."
                    )
                    onSaved()
                }
                is Resource.Error -> {
                    _uiState.value = _uiState.value.copy(isActionLoading = false, error = res.message)
                }
                else -> {
                    _uiState.value = _uiState.value.copy(isActionLoading = false)
                }
            }
        }
    }

    fun clearFeedback() {
        _uiState.value = _uiState.value.copy(error = null, actionMessage = null)
    }

    fun logout() {
        authRepository.logout()
    }
}
