package com.tradigoo.app.data.repository

import android.content.Context
import com.google.gson.Gson
import com.tradigoo.app.data.api.ApiProfileData
import com.tradigoo.app.data.api.ForgotPasswordRequest
import com.tradigoo.app.data.api.GoogleAuthRequest
import com.tradigoo.app.data.api.RetrofitClient
import com.tradigoo.app.data.api.SignInRequest
import com.tradigoo.app.data.api.SignUpRequest
import com.tradigoo.app.data.api.UpdateProfileRequest
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
    private val gson = Gson()

    suspend fun signIn(email: String, password: String): Resource<User> = withContext(Dispatchers.IO) {
        try {
            val response = api.signIn(SignInRequest(email = email.trim(), password = password))
            val body = response.body()
            if (response.isSuccessful && body?.user != null) {
                val token = body.token?.takeIf { it.isNotBlank() }
                    ?: return@withContext Resource.Error("Authentication token missing. Please verify your account and try again.")

                val apiUser = body.user
                val meta = apiUser.userMetadata ?: emptyMap<String, Any>()
                val roleStr = apiUser.role ?: (meta["role"] as? String) ?: "retailer"
                val role = UserRole.fromString(roleStr)

                val user = User(
                    id = apiUser.id,
                    email = apiUser.email ?: email.trim(),
                    role = role,
                    name = (meta["name"] as? String) ?: email.substringBefore("@"),
                    phone = meta["phone"] as? String,
                    businessName = (meta["business_name"] as? String) ?: "",
                    location = (meta["location"] as? String) ?: "India",
                    trustScore = (meta["trust_score"] as? Number)?.toInt() ?: 500,
                    totalOrders = (meta["total_orders"] as? Number)?.toInt() ?: 0,
                    successfulOrders = (meta["successful_orders"] as? Number)?.toInt() ?: 0,
                    gstNumber = meta["gst_number"] as? String,
                    gstVerified = (meta["gst_verified"] as? Boolean) ?: false
                )
                sessionManager.saveUser(user)
                sessionManager.saveSelectedRole(role)
                sessionManager.saveAuthToken(token)
                Resource.Success(user)
            } else {
                val errorMsg = body?.error
                    ?: extractErrorMessage(response.errorBody()?.string())
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
        location: String,
        gstin: String? = null
    ): Resource<User> = withContext(Dispatchers.IO) {
        try {
            val cleanGstin = gstin?.trim()?.uppercase()?.takeIf { it.isNotBlank() }
            val req = SignUpRequest(
                email = email.trim(),
                password = password,
                userData = UserDataRequest(
                    name = name.trim(),
                    role = role.value,
                    businessName = businessName.trim(),
                    phone = phone?.trim()?.takeIf { it.isNotBlank() },
                    location = location.trim(),
                    gstin = cleanGstin
                )
            )
            val response = api.signUp(req)
            val body = response.body()
            if (response.isSuccessful && body?.user != null) {
                val token = body.token?.takeIf { it.isNotBlank() }
                if (token == null) {
                    sessionManager.clearAuthToken()
                    return@withContext Resource.Error(
                        "Account created! Please check your email inbox to confirm your address, then sign in."
                    )
                }

                val apiUser = body.user
                val meta = apiUser.userMetadata ?: emptyMap<String, Any>()
                val user = User(
                    id = apiUser.id,
                    email = apiUser.email ?: email.trim(),
                    role = role,
                    name = name.trim(),
                    phone = phone?.trim()?.takeIf { it.isNotBlank() },
                    businessName = businessName.trim(),
                    location = location.trim(),
                    trustScore = (meta["trust_score"] as? Number)?.toInt() ?: 500,
                    totalOrders = 0,
                    successfulOrders = 0,
                    gstNumber = (meta["gst_number"] as? String) ?: cleanGstin,
                    gstVerified = false
                )
                sessionManager.saveUser(user)
                sessionManager.saveSelectedRole(role)
                sessionManager.saveAuthToken(token)
                Resource.Success(user)
            } else {
                val errorMsg = body?.error
                    ?: extractErrorMessage(response.errorBody()?.string())
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
            val body = response.body()
            if (response.isSuccessful && body?.user != null) {
                val token = body.token?.takeIf { it.isNotBlank() } ?: accessToken?.takeIf { it.isNotBlank() }
                if (token == null) {
                    return@withContext Resource.Error(
                        "Google session could not be established. Please complete sign-in via browser OAuth or email/password."
                    )
                }

                val apiUser = body.user
                val meta = apiUser.userMetadata ?: emptyMap()
                val roleStr = apiUser.role ?: (meta["role"] as? String) ?: role.value
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
                    successfulOrders = (meta["successful_orders"] as? Number)?.toInt() ?: 0,
                    gstNumber = meta["gst_number"] as? String,
                    gstVerified = (meta["gst_verified"] as? Boolean) ?: false
                )
                sessionManager.saveUser(user)
                sessionManager.saveAuthToken(token)
                sessionManager.saveSelectedRole(resolvedRole)
                Resource.Success(user)
            } else {
                val errorMsg = body?.error
                    ?: extractErrorMessage(response.errorBody()?.string())
                    ?: "Google authentication failed. Please try again."
                Resource.Error(cleanErrorMessage(errorMsg))
            }
        } catch (e: Exception) {
            Resource.Error("Network error during Google authentication: ${e.localizedMessage}", e)
        }
    }

    suspend fun requestPasswordReset(email: String): Resource<String> = withContext(Dispatchers.IO) {
        try {
            val response = api.forgotPassword(ForgotPasswordRequest(email = email.trim()))
            val body = response.body()
            if (response.isSuccessful) {
                Resource.Success(body?.message ?: "Password reset instructions sent to ${email.trim()}")
            } else {
                val errorMsg = body?.error
                    ?: extractErrorMessage(response.errorBody()?.string())
                    ?: "Failed to send reset instructions."
                Resource.Error(cleanErrorMessage(errorMsg))
            }
        } catch (e: Exception) {
            Resource.Error("Network error sending reset link: ${e.localizedMessage}", e)
        }
    }

    suspend fun refreshProfile(): Resource<User> = withContext(Dispatchers.IO) {
        try {
            if (!sessionManager.hasValidToken()) {
                return@withContext Resource.Error("No active session token.")
            }
            val response = api.getProfile()
            if (response.code() == 401) {
                logout()
                return@withContext Resource.Error("Session expired. Please sign in again.")
            }
            val profile = response.body()?.user
            if (response.isSuccessful && profile != null) {
                val mapped = mapProfileToUser(profile)
                sessionManager.saveUser(mapped)
                sessionManager.saveSelectedRole(mapped.role)
                Resource.Success(mapped)
            } else {
                val errorMsg = response.body()?.error
                    ?: extractErrorMessage(response.errorBody()?.string())
                    ?: "Failed to refresh profile."
                Resource.Error(errorMsg)
            }
        } catch (e: Exception) {
            Resource.Error("Network error refreshing profile: ${e.localizedMessage}", e)
        }
    }

    suspend fun updateProfile(
        name: String,
        phone: String?,
        businessName: String,
        location: String,
        gstNumber: String?,
        businessAddress: String? = null,
        pinCode: String? = null,
        businessDescription: String? = null
    ): Resource<User> = withContext(Dispatchers.IO) {
        try {
            val req = UpdateProfileRequest(
                name = name.trim(),
                phone = phone?.trim()?.takeIf { it.isNotBlank() },
                businessName = businessName.trim(),
                location = location.trim(),
                gstNumber = gstNumber?.trim()?.uppercase()?.takeIf { it.isNotBlank() },
                businessAddress = businessAddress?.trim()?.takeIf { it.isNotBlank() },
                pinCode = pinCode?.trim()?.takeIf { it.isNotBlank() },
                businessDescription = businessDescription?.trim()?.takeIf { it.isNotBlank() }
            )
            val response = api.updateProfile(req)
            if (response.code() == 401) {
                logout()
                return@withContext Resource.Error("Session expired. Please sign in again.")
            }
            val profile = response.body()?.user
            if (response.isSuccessful && profile != null) {
                val mapped = mapProfileToUser(profile)
                sessionManager.saveUser(mapped)
                Resource.Success(mapped)
            } else {
                val errorMsg = response.body()?.error
                    ?: extractErrorMessage(response.errorBody()?.string())
                    ?: "Could not update business profile."
                Resource.Error(cleanErrorMessage(errorMsg))
            }
        } catch (e: Exception) {
            Resource.Error("Network error updating profile: ${e.localizedMessage}", e)
        }
    }

    private fun mapProfileToUser(profile: ApiProfileData): User {
        return User(
            id = profile.id,
            email = profile.email ?: "",
            role = UserRole.fromString(profile.role),
            name = profile.name ?: "Tradigoo Partner",
            phone = profile.phone,
            businessName = profile.businessName ?: "",
            location = profile.location ?: "India",
            trustScore = profile.trustScore ?: 500,
            totalOrders = profile.totalOrders ?: 0,
            successfulOrders = profile.successfulOrders ?: 0,
            gstNumber = profile.gstNumber,
            gstVerified = profile.gstVerified ?: false,
            businessType = profile.businessType,
            businessAddress = profile.businessAddress,
            pinCode = profile.pinCode,
            businessDescription = profile.businessDescription
        )
    }

    fun getCurrentUser(): User? = sessionManager.getUser()

    fun getSelectedRole(): UserRole = sessionManager.getSelectedRole()

    fun setSelectedRole(role: UserRole) = sessionManager.saveSelectedRole(role)

    fun isLoggedIn(): Boolean = sessionManager.isLoggedIn()

    fun logout() {
        sessionManager.clearSession()
        CartRepository.getInstance(context).clearLocalCache()
    }

    private fun extractErrorMessage(rawBody: String?): String? {
        if (rawBody.isNullOrBlank()) return null
        return try {
            val map = gson.fromJson(rawBody, Map::class.java)
            (map?.get("error") as? String) ?: (map?.get("message") as? String) ?: rawBody
        } catch (_: Exception) {
            rawBody
        }
    }

    private fun cleanErrorMessage(raw: String): String {
        return if (raw.contains("already registered", ignoreCase = true) || raw.contains("duplicate", ignoreCase = true)) {
            "An account with this email already exists. Please login instead."
        } else if (raw.contains("invalid login", ignoreCase = true) || raw.contains("invalid credentials", ignoreCase = true)) {
            "Invalid email or password. Please verify your credentials."
        } else {
            raw.replace("\"", "").take(180)
        }
    }
}
