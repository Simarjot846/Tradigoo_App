package com.tradigoo.app.data.repository

import android.content.Context
import com.tradigoo.app.data.api.GoogleAuthRequest
import com.tradigoo.app.data.api.RetrofitClient
import com.tradigoo.app.data.api.SignInRequest
import com.tradigoo.app.data.api.SignUpRequest
import com.tradigoo.app.data.api.UserDataRequest
import com.tradigoo.app.data.local.SessionManager
import com.tradigoo.app.domain.model.Resource
import com.tradigoo.app.domain.model.User
import com.tradigoo.app.domain.model.UserRole
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class AuthRepository(private val context: Context) {

    private val api = RetrofitClient.getApiService(context)
    private val sessionManager = SessionManager.getInstance(context)

    suspend fun signIn(email: String, password: String): Resource<User> = withContext(Dispatchers.IO) {
        try {
            val response = api.signIn(SignInRequest(email = email.trim(), password = password))
            if (response.isSuccessful && response.body()?.user != null) {
                val apiUser = response.body()!!.user!!
                val meta = apiUser.userMetadata ?: emptyMap<String, Any>()
                val roleStr = (apiUser.role) ?: (meta["role"] as? String) ?: "retailer"
                val role = UserRole.fromString(roleStr)

                val user = User(
                    id = apiUser.id,
                    email = apiUser.email ?: email,
                    role = role,
                    name = (meta["name"] as? String) ?: (email.substringBefore("@")),
                    phone = meta["phone"] as? String,
                    businessName = (meta["business_name"] as? String) ?: "",
                    location = (meta["location"] as? String) ?: "India",
                    trustScore = (meta["trust_score"] as? Number)?.toInt() ?: 500,
                    totalOrders = (meta["total_orders"] as? Number)?.toInt() ?: 0,
                    successfulOrders = (meta["successful_orders"] as? Number)?.toInt() ?: 0
                )
                sessionManager.saveUser(user)
                sessionManager.saveSelectedRole(role)
                sessionManager.saveAuthToken(response.body()?.token ?: apiUser.id)
                Resource.Success(user)
            } else {
                val errorMsg = response.body()?.error
                    ?: response.errorBody()?.string()
                    ?: "Invalid email or password. Please verify your credentials."
                Resource.Error(cleanErrorMessage(errorMsg))
            }
        } catch (e: Exception) {
            Resource.Error("Network error: Could not reach Tradigoo servers. Please check your connection.", e)
        }
    }

    suspend fun signUp(
        email: String,
        password: String,
        name: String,
        role: UserRole,
        businessName: String,
        phone: String?,
        location: String
    ): Resource<User> = withContext(Dispatchers.IO) {
        try {
            val req = SignUpRequest(
                email = email.trim(),
                password = password,
                userData = UserDataRequest(
                    name = name.trim(),
                    role = role.value,
                    businessName = businessName.trim(),
                    phone = phone?.trim(),
                    location = location.trim()
                )
            )
            val response = api.signUp(req)
            if (response.isSuccessful && response.body()?.user != null) {
                val apiUser = response.body()!!.user!!
                val user = User(
                    id = apiUser.id,
                    email = apiUser.email ?: email,
                    role = role,
                    name = name,
                    phone = phone,
                    businessName = businessName,
                    location = location,
                    trustScore = 500,
                    totalOrders = 0,
                    successfulOrders = 0
                )
                sessionManager.saveUser(user)
                sessionManager.saveAuthToken(apiUser.id)
                Resource.Success(user)
            } else {
                val errorMsg = response.body()?.error
                    ?: response.errorBody()?.string()
                    ?: "Account creation failed. Please check the details entered."
                Resource.Error(cleanErrorMessage(errorMsg))
            }
        } catch (e: Exception) {
            Resource.Error("Network error while creating account: ${e.localizedMessage}", e)
        }
    }

    suspend fun authenticateWithGoogle(
        idToken: String? = null,
        accessToken: String? = null,
        role: UserRole = getSelectedRole(),
        name: String? = null,
        email: String? = null,
        businessName: String? = null,
        phone: String? = null,
        location: String? = null
    ): Resource<User> = withContext(Dispatchers.IO) {
        try {
            val req = GoogleAuthRequest(
                idToken = idToken,
                accessToken = accessToken,
                role = role.value,
                name = name,
                email = email,
                businessName = businessName,
                phone = phone,
                location = location
            )
            val response = api.googleAuth(req)
            if (response.isSuccessful && response.body()?.user != null) {
                val apiUser = response.body()!!.user!!
                val meta = apiUser.userMetadata ?: emptyMap()
                val roleStr = (apiUser.role) ?: (meta["role"] as? String) ?: role.value
                val resolvedRole = UserRole.fromString(roleStr)

                val user = User(
                    id = apiUser.id,
                    email = apiUser.email ?: (email ?: ""),
                    role = resolvedRole,
                    name = (meta["name"] as? String) ?: (name ?: email?.substringBefore("@") ?: "Tradigoo Partner"),
                    phone = (meta["phone"] as? String) ?: phone,
                    businessName = (meta["business_name"] as? String) ?: (businessName ?: ""),
                    location = (meta["location"] as? String) ?: (location ?: "India"),
                    trustScore = (meta["trust_score"] as? Number)?.toInt() ?: 500,
                    totalOrders = (meta["total_orders"] as? Number)?.toInt() ?: 0,
                    successfulOrders = (meta["successful_orders"] as? Number)?.toInt() ?: 0
                )
                sessionManager.saveUser(user)
                sessionManager.saveAuthToken(apiUser.id)
                sessionManager.saveSelectedRole(resolvedRole)
                Resource.Success(user)
            } else {
                val errorMsg = response.body()?.error
                    ?: response.errorBody()?.string()
                    ?: "Google authentication failed. Please try again."
                Resource.Error(cleanErrorMessage(errorMsg))
            }
        } catch (e: Exception) {
            Resource.Error("Network error during Google authentication: ${e.localizedMessage}", e)
        }
    }

    fun getCurrentUser(): User? = sessionManager.getUser()

    fun getSelectedRole(): UserRole = sessionManager.getSelectedRole()

    fun setSelectedRole(role: UserRole) = sessionManager.saveSelectedRole(role)

    fun isLoggedIn(): Boolean = sessionManager.isLoggedIn()

    fun logout() = sessionManager.clearSession()

    private fun cleanErrorMessage(raw: String): String {
        return if (raw.contains("already registered", ignoreCase = true) || raw.contains("duplicate", ignoreCase = true)) {
            "An account with this email already exists. Please login instead."
        } else if (raw.contains("invalid login", ignoreCase = true) || raw.contains("invalid credentials", ignoreCase = true)) {
            "Invalid email or password. Please verify your credentials."
        } else {
            raw.replace("\"", "").take(150)
        }
    }
}
