package com.tradigoo.app.ui.screens.wholesaler

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.tradigoo.app.data.local.SessionManager
import com.tradigoo.app.data.repository.AuthRepository
import com.tradigoo.app.data.repository.OrderRepository
import com.tradigoo.app.data.repository.ProductRepository
import com.tradigoo.app.domain.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class WholesalerUiState(
    val isLoading: Boolean = false,
    val user: User? = null,
    val inventory: List<Product> = emptyList(),
    val receivedOrders: List<Order> = emptyList(),
    val error: String? = null,
    val productAddedSuccess: Boolean = false
)

class WholesalerViewModel(application: Application) : AndroidViewModel(application) {

    private val authRepository = AuthRepository(application)
    private val productRepository = ProductRepository(application)
    private val orderRepository = OrderRepository(application)
    private val sessionManager = SessionManager.getInstance(application)

    private val _uiState = MutableStateFlow(WholesalerUiState())
    val uiState: StateFlow<WholesalerUiState> = _uiState.asStateFlow()

    init {
        loadData()
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
                    // Filter products belonging to this wholesaler or show all if newly joined
                    val myProducts = if (currentUser != null) {
                        prodResult.data.filter { it.sellerId == currentUser.id || it.sellerId == null }
                    } else {
                        prodResult.data
                    }
                    _uiState.value = _uiState.value.copy(
                        inventory = myProducts,
                        isLoading = false
                    )
                }
                is Resource.Error -> {
                    _uiState.value = _uiState.value.copy(isLoading = false, error = prodResult.message)
                }
                else -> {
                    _uiState.value = _uiState.value.copy(isLoading = false)
                }
            }

            if (currentUser != null) {
                when (val ordResult = orderRepository.getOrders(currentUser.id, UserRole.WHOLESALER)) {
                    is Resource.Success -> {
                        _uiState.value = _uiState.value.copy(receivedOrders = ordResult.data)
                    }
                    else -> {}
                }
            }
        }
    }

    fun addProduct(
        name: String,
        category: String,
        basePrice: Double,
        unit: String,
        minOrderQuantity: Int,
        description: String,
        imageUrl: String? = null,
        onSuccess: () -> Unit
    ) {
        if (name.isBlank() || basePrice <= 0 || minOrderQuantity <= 0) {
            _uiState.value = _uiState.value.copy(error = "Please provide valid product details, price and MOQ.")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            when (val result = productRepository.addProduct(name, category, basePrice, unit, minOrderQuantity, description, imageUrl)) {
                is Resource.Success -> {
                    val updated = listOf(result.data) + _uiState.value.inventory
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        inventory = updated,
                        productAddedSuccess = true,
                        error = null
                    )
                    onSuccess()
                }
                is Resource.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = result.message
                    )
                }
                else -> {
                    _uiState.value = _uiState.value.copy(isLoading = false)
                }
            }
        }
    }

    fun deleteProduct(productId: String) {
        viewModelScope.launch {
            productRepository.deleteProduct(productId)
            val updated = _uiState.value.inventory.filter { it.id != productId }
            _uiState.value = _uiState.value.copy(inventory = updated)
        }
    }

    fun updateOrderStatus(orderId: String, newStatus: String) {
        val updated = _uiState.value.receivedOrders.map { order ->
            if (order.id == orderId) order.copy(status = newStatus) else order
        }
        _uiState.value = _uiState.value.copy(receivedOrders = updated)
    }

    fun logout() {
        authRepository.logout()
    }
}
