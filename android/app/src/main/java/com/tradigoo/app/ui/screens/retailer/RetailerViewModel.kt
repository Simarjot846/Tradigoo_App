package com.tradigoo.app.ui.screens.retailer

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.tradigoo.app.data.local.SessionManager
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
    val user: User? = null,
    val products: List<Product> = emptyList(),
    val filteredProducts: List<Product> = emptyList(),
    val orders: List<Order> = emptyList(),
    val cartItems: List<CartItem> = emptyList(),
    val selectedCategory: String = "All",
    val searchQuery: String = "",
    val error: String? = null,
    val orderPlacedSuccess: Boolean = false
)

class RetailerViewModel(application: Application) : AndroidViewModel(application) {

    private val authRepository = AuthRepository(application)
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
        val currentUser = sessionManager.getUser()

        _uiState.value = _uiState.value.copy(
            isLoading = true,
            user = currentUser,
            error = null
        )

        viewModelScope.launch {
            when (val prodResult = productRepository.getProducts()) {
                is Resource.Success -> {
                    _uiState.value = _uiState.value.copy(
                        products = prodResult.data,
                        filteredProducts = prodResult.data,
                        isLoading = false
                    )
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

            if (currentUser != null) {
                when (val ordResult = orderRepository.getOrders(currentUser.id, UserRole.RETAILER)) {
                    is Resource.Success -> {
                        _uiState.value = _uiState.value.copy(orders = ordResult.data)
                    }
                    else -> {}
                }
            }
        }
    }

    fun selectCategory(category: String) {
        _uiState.value = _uiState.value.copy(selectedCategory = category)
        applyFilters(category, _uiState.value.searchQuery)
    }

    fun searchProducts(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
        applyFilters(_uiState.value.selectedCategory, query)
    }

    private fun applyFilters(category: String, query: String) {
        val all = _uiState.value.products
        val filtered = all.filter { product ->
            val matchCategory = category == "All" || product.category.equals(category, ignoreCase = true)
            val matchQuery = query.isBlank() || product.name.contains(query, ignoreCase = true) || product.category.contains(query, ignoreCase = true)
            matchCategory && matchQuery
        }
        _uiState.value = _uiState.value.copy(filteredProducts = filtered)
    }

    fun addToCart(product: Product, quantity: Int = product.minOrderQuantity) {
        cartRepository.addToCart(product, quantity)
    }

    fun updateCartQuantity(cartItemId: String, newQuantity: Int) {
        cartRepository.updateQuantity(cartItemId, newQuantity)
    }

    fun removeFromCart(cartItemId: String) {
        cartRepository.removeFromCart(cartItemId)
    }

    fun checkout(onSuccess: () -> Unit) {
        val user = _uiState.value.user ?: return
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            val items = _uiState.value.cartItems
            if (items.isNotEmpty()) {
                val firstItem = items.first()
                val result = orderRepository.createOrder(
                    buyerId = user.id,
                    sellerId = firstItem.sellerId ?: "direct_wholesaler",
                    productId = firstItem.productId,
                    quantity = firstItem.quantity,
                    unitPrice = firstItem.basePrice
                )
                if (result is Resource.Success) {
                    cartRepository.clearCart()
                    loadData()
                    _uiState.value = _uiState.value.copy(isLoading = false, orderPlacedSuccess = true)
                    onSuccess()
                } else {
                    _uiState.value = _uiState.value.copy(isLoading = false, error = (result as Resource.Error).message)
                }
            } else {
                _uiState.value = _uiState.value.copy(isLoading = false)
            }
        }
    }

    fun logout() {
        authRepository.logout()
    }
}
