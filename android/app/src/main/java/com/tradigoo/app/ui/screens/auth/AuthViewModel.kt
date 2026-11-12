package com.tradigoo.app.ui.screens.auth

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.tradigoo.app.data.repository.AuthRepository
import com.tradigoo.app.domain.model.Resource
import com.tradigoo.app.domain.model.User
import com.tradigoo.app.domain.model.UserRole
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AuthUiState(
    val isLoading: Boolean = false,
    val user: User? = null,
    val error: String? = null,
    val isSuccess: Boolean = false
)

class AuthViewModel(application: Application) : AndroidViewModel(application) {

    private val authRepository = AuthRepository(application)

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    fun signIn(email: String, password: String) {
        if (email.isBlank() || password.isBlank()) {
            _uiState.value = AuthUiState(error = "Please enter both email and password")
            return
        }

        viewModelScope.launch {
            _uiState.value = AuthUiState(isLoading = true)
            when (val result = authRepository.signIn(email, password)) {
                is Resource.Success -> {
                    _uiState.value = AuthUiState(user = result.data, isSuccess = true)
                }
                is Resource.Error -> {
                    _uiState.value = AuthUiState(error = result.message)
                }
                is Resource.Loading -> {
                    _uiState.value = AuthUiState(isLoading = true)
                }
            }
        }
    }

    fun signUp(
        email: String,
        password: String,
        name: String,
        role: UserRole,
        businessName: String,
        phone: String?,
        location: String
    ) {
        if (email.isBlank() || password.isBlank() || name.isBlank() || businessName.isBlank()) {
            _uiState.value = AuthUiState(error = "Please fill in all required fields")
            return
        }

        if (password.length < 6) {
            _uiState.value = AuthUiState(error = "Password must be at least 6 characters")
            return
        }

        viewModelScope.launch {
            _uiState.value = AuthUiState(isLoading = true)
            when (val result = authRepository.signUp(
                email = email,
                password = password,
                name = name,
                role = role,
                businessName = businessName,
                phone = phone,
                location = location
            )) {
                is Resource.Success -> {
                    _uiState.value = AuthUiState(user = result.data, isSuccess = true)
                }
                is Resource.Error -> {
                    _uiState.value = AuthUiState(error = result.message)
                }
                is Resource.Loading -> {
                    _uiState.value = AuthUiState(isLoading = true)
                }
            }
        }
    }

    fun signInWithGoogle(
        idToken: String? = null,
        accessToken: String? = null,
        role: UserRole = getSelectedRole(),
        name: String? = null,
        email: String? = null,
        businessName: String? = null,
        phone: String? = null,
        location: String? = null
    ) {
        viewModelScope.launch {
            _uiState.value = AuthUiState(isLoading = true)
            when (val result = authRepository.authenticateWithGoogle(
                idToken = idToken,
                accessToken = accessToken,
                role = role,
                name = name,
                email = email,
                businessName = businessName,
                phone = phone,
                location = location
            )) {
                is Resource.Success -> {
                    _uiState.value = AuthUiState(user = result.data, isSuccess = true)
                }
                is Resource.Error -> {
                    _uiState.value = AuthUiState(error = result.message)
                }
                is Resource.Loading -> {
                    _uiState.value = AuthUiState(isLoading = true)
                }
            }
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }

    fun getSelectedRole(): UserRole = authRepository.getSelectedRole()
}
