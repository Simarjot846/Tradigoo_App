package com.tradigoo.app.ui.screens.wholesaler

import android.app.Application
import android.net.Uri
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.tradigoo.app.data.api.ApiTrustScoreResponse
import com.tradigoo.app.data.local.SessionManager
import com.tradigoo.app.data.repository.AdminRepository
import com.tradigoo.app.data.repository.AuthRepository
import com.tradigoo.app.data.repository.OrderRepository
import com.tradigoo.app.data.repository.ProductRepository
import com.tradigoo.app.domain.model.Order
import com.tradigoo.app.domain.model.Product
import com.tradigoo.app.domain.model.Resource
import com.tradigoo.app.domain.model.User
import com.tradigoo.app.domain.model.UserRole
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class WholesalerUiState(
    val isLoading: Boolean = false,
    val isActionLoading: Boolean = false,
    val user: User? = null,
    val trustScore: ApiTrustScoreResponse? = null,
    val inventory: List<Product> = emptyList(),
    val receivedOrders: List<Order> = emptyList(),
    val error: String? = null,
    val actionMessage: String? = null
)

class WholesalerViewModel(application: Application) : AndroidViewModel(application) {

    private val authRepository = AuthRepository(application)
    private val productRepository = ProductRepository(application)
    private val orderRepository = OrderRepository(application)
    private val adminRepository = AdminRepository(application)
    private val sessionManager = SessionManager.getInstance(application)

    private val _uiState = MutableStateFlow(WholesalerUiState())
    val uiState: StateFlow<WholesalerUiState> = _uiState.asStateFlow()

    init {
        loadData()
    }

    fun loadData() {
        val cachedUser = sessionManager.getUser()

        _uiState.value = _uiState.value.copy(
            isLoading = true,
            user = cachedUser,
            error = null
        )

        viewModelScope.launch {
            val activeUser = if (sessionManager.hasValidToken()) {
                when (val profileRes = authRepository.refreshProfile()) {
                    is Resource.Success -> profileRes.data
                    else -> cachedUser
                }
            } else {
                cachedUser
            }
            _uiState.value = _uiState.value.copy(user = activeUser)

            when (
                val prodResult = productRepository.getProducts(
                    sellerId = activeUser?.id,
                    includeInactive = true
                )
            ) {
                is Resource.Success -> {
                    _uiState.value = _uiState.value.copy(
                        inventory = prodResult.data,
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

            if (activeUser != null) {
                when (val ordResult = orderRepository.getOrders(activeUser.id, UserRole.WHOLESALER)) {
                    is Resource.Success -> {
                        _uiState.value = _uiState.value.copy(receivedOrders = ordResult.data)
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

    fun addProduct(
        name: String,
        category: String,
        basePrice: Double,
        unit: String,
        minOrderQuantity: Int,
        description: String,
        imageUri: Uri? = null,
        batchNumber: String? = null,
        onSuccess: () -> Unit
    ) {
        if (name.isBlank() || basePrice <= 0 || minOrderQuantity <= 0) {
            _uiState.value = _uiState.value.copy(error = "Please provide a valid product name, price, and MOQ.")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isActionLoading = true, error = null, actionMessage = null)

            var uploadedImageUrl: String? = null
            if (imageUri != null) {
                when (val uploadRes = productRepository.uploadProductImage(imageUri)) {
                    is Resource.Success -> {
                        uploadedImageUrl = uploadRes.data
                    }
                    is Resource.Error -> {
                        _uiState.value = _uiState.value.copy(
                            isActionLoading = false,
                            error = uploadRes.message
                        )
                        return@launch
                    }
                    else -> {}
                }
            }

            when (
                val result = productRepository.addProduct(
                    name = name,
                    category = category,
                    basePrice = basePrice,
                    unit = unit,
                    minOrderQuantity = minOrderQuantity,
                    description = description,
                    imageUrl = uploadedImageUrl,
                    batchNumber = batchNumber
                )
            ) {
                is Resource.Success -> {
                    val updated = listOf(result.data) + _uiState.value.inventory
                    _uiState.value = _uiState.value.copy(
                        isActionLoading = false,
                        inventory = updated,
                        error = null,
                        actionMessage = "Listing '${result.data.name}' published to Tradigoo."
                    )
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

    fun updateProduct(
        productId: String,
        name: String,
        category: String,
        basePrice: Double,
        unit: String,
        minOrderQuantity: Int,
        description: String,
        isActive: Boolean,
        onSuccess: () -> Unit
    ) {
        if (name.isBlank() || basePrice <= 0 || minOrderQuantity <= 0) {
            _uiState.value = _uiState.value.copy(error = "Please enter valid SKU details before saving.")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isActionLoading = true, error = null, actionMessage = null)
            when (
                val result = productRepository.updateProduct(
                    id = productId,
                    name = name,
                    category = category,
                    basePrice = basePrice,
                    unit = unit,
                    minOrderQuantity = minOrderQuantity,
                    description = description,
                    isActive = isActive
                )
            ) {
                is Resource.Success -> {
                    val updated = _uiState.value.inventory.map {
                        if (it.id == productId) result.data else it
                    }
                    _uiState.value = _uiState.value.copy(
                        isActionLoading = false,
                        inventory = updated,
                        actionMessage = "Updated '${result.data.name}'."
                    )
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

    fun deleteProduct(productId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isActionLoading = true, error = null, actionMessage = null)
            when (val result = productRepository.deleteProduct(productId)) {
                is Resource.Success -> {
                    val updated = _uiState.value.inventory.filter { it.id != productId }
                    _uiState.value = _uiState.value.copy(
                        isActionLoading = false,
                        inventory = updated,
                        actionMessage = "SKU removed from catalog."
                    )
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

    fun updateOrderStatus(orderId: String, newStatus: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isActionLoading = true, error = null, actionMessage = null)
            when (val result = orderRepository.updateOrderStatus(orderId, newStatus)) {
                is Resource.Success -> {
                    val activeUser = _uiState.value.user ?: sessionManager.getUser()
                    if (activeUser != null) {
                        when (val ordRes = orderRepository.getOrders(activeUser.id, UserRole.WHOLESALER)) {
                            is Resource.Success -> {
                                _uiState.value = _uiState.value.copy(receivedOrders = ordRes.data)
                            }
                            else -> {
                                val updated = _uiState.value.receivedOrders.map { order ->
                                    if (order.id == orderId) order.copy(status = result.data) else order
                                }
                                _uiState.value = _uiState.value.copy(receivedOrders = updated)
                            }
                        }
                    }
                    val label = if (newStatus == "shipped") "dispatched" else newStatus.replace("_", " ")
                    _uiState.value = _uiState.value.copy(
                        isActionLoading = false,
                        actionMessage = "Order marked as $label."
                    )
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

    fun updateProfile(
        name: String,
        phone: String?,
        businessName: String,
        location: String,
        gstNumber: String?,
        businessAddress: String?,
        pinCode: String?,
        onSaved: () -> Unit
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isActionLoading = true, error = null, actionMessage = null)
            when (
                val res = authRepository.updateProfile(
                    name = name,
                    phone = phone,
                    businessName = businessName,
                    location = location,
                    gstNumber = gstNumber,
                    businessAddress = businessAddress,
                    pinCode = pinCode
                )
            ) {
                is Resource.Success -> {
                    _uiState.value = _uiState.value.copy(
                        isActionLoading = false,
                        user = res.data,
                        actionMessage = "Supplier profile updated."
                    )
                    onSaved()
                }
                is Resource.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isActionLoading = false,
                        error = res.message
                    )
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
