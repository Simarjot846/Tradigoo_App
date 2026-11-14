package com.tradigoo.app.data.local

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import com.tradigoo.app.domain.model.User
import com.tradigoo.app.domain.model.UserRole

class SessionManager(context: Context) {

    private val prefs: SharedPreferences = try {
        val masterKeyAlias = androidx.security.crypto.MasterKeys.getOrCreate(
            androidx.security.crypto.MasterKeys.AES256_GCM_SPEC
        )
        androidx.security.crypto.EncryptedSharedPreferences.create(
            PREFS_NAME,
            masterKeyAlias,
            context,
            androidx.security.crypto.EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            androidx.security.crypto.EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    } catch (_: Exception) {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    private val gson = Gson()

    fun saveAuthToken(token: String) {
        if (token.isNotBlank()) {
            val inferredExp = JwtUtils.extractExpiryEpochSeconds(token)
            prefs.edit().apply {
                putString(KEY_AUTH_TOKEN, token)
                if (inferredExp != null) {
                    putLong(KEY_TOKEN_EXPIRES_AT, inferredExp)
                }
            }.apply()
        }
    }

    fun saveSessionTokens(
        accessToken: String,
        refreshToken: String? = null,
        expiresAtSec: Long? = null
    ) {
        prefs.edit().apply {
            if (accessToken.isNotBlank()) {
                putString(KEY_AUTH_TOKEN, accessToken)
            }
            if (!refreshToken.isNullOrBlank()) {
                putString(KEY_REFRESH_TOKEN, refreshToken)
            }
            val effectiveExp = expiresAtSec ?: JwtUtils.extractExpiryEpochSeconds(accessToken)
            if (effectiveExp != null && effectiveExp > 0L) {
                putLong(KEY_TOKEN_EXPIRES_AT, effectiveExp)
            }
        }.apply()
    }

    fun getAuthToken(): String? {
        return prefs.getString(KEY_AUTH_TOKEN, null)?.takeIf { it.isNotBlank() }
    }

    fun getRefreshToken(): String? {
        return prefs.getString(KEY_REFRESH_TOKEN, null)?.takeIf { it.isNotBlank() }
    }

    fun getTokenExpiresAt(): Long? {
        val value = prefs.getLong(KEY_TOKEN_EXPIRES_AT, 0L)
        return if (value > 0L) value else null
    }

    fun isAccessTokenExpiringSoon(bufferSeconds: Long = 90L): Boolean {
        val token = getAuthToken() ?: return !getRefreshToken().isNullOrBlank()
        return JwtUtils.isExpiringSoon(
            jwt = token,
            explicitExpiresAtSec = getTokenExpiresAt(),
            bufferSeconds = bufferSeconds
        )
    }

    fun clearAuthToken() {
        prefs.edit()
            .remove(KEY_AUTH_TOKEN)
            .remove(KEY_REFRESH_TOKEN)
            .remove(KEY_TOKEN_EXPIRES_AT)
            .apply()
    }

    fun hasValidToken(): Boolean {
        return !getAuthToken().isNullOrBlank()
    }

    fun hasRefreshableSession(): Boolean {
        return !getAuthToken().isNullOrBlank() || !getRefreshToken().isNullOrBlank()
    }

    fun saveUser(user: User) {
        val userJson = gson.toJson(user)
        prefs.edit()
            .putString(KEY_USER, userJson)
            .putString(KEY_USER_ROLE, user.role.value)
            .apply()
    }

    fun getUser(): User? {
        val userJson = prefs.getString(KEY_USER, null) ?: return null
        return try {
            gson.fromJson(userJson, User::class.java)
        } catch (_: Exception) {
            null
        }
    }

    fun getUserRole(): UserRole {
        val roleStr = prefs.getString(KEY_USER_ROLE, null)
        return UserRole.fromString(roleStr)
    }

    fun saveSelectedRole(role: UserRole) {
        prefs.edit().putString(KEY_SELECTED_ROLE, role.value).apply()
    }

    fun getSelectedRole(): UserRole {
        val roleStr = prefs.getString(KEY_SELECTED_ROLE, null)
        return UserRole.fromString(roleStr)
    }

    fun isLoggedIn(): Boolean {
        return getUser() != null && hasRefreshableSession()
    }

    fun saveFcmToken(token: String) {
        prefs.edit().putString(KEY_FCM_TOKEN, token).apply()
    }

    fun getFcmToken(): String? {
        return prefs.getString(KEY_FCM_TOKEN, null)
    }

    fun savePendingOAuthRole(role: UserRole) {
        prefs.edit().putString(KEY_PENDING_OAUTH_ROLE, role.value).apply()
    }

    fun getPendingOAuthRole(): UserRole {
        val roleStr = prefs.getString(KEY_PENDING_OAUTH_ROLE, null)
        return UserRole.fromString(roleStr ?: getSelectedRole().value)
    }

    fun clearSession() {
        val fcmToken = getFcmToken()
        prefs.edit().clear().apply()
        if (!fcmToken.isNullOrBlank()) {
            prefs.edit().putString(KEY_FCM_TOKEN, fcmToken).apply()
        }
    }

    companion object {
        private const val PREFS_NAME = "tradigoo_secure_session"
        private const val KEY_AUTH_TOKEN = "key_auth_token"
        private const val KEY_REFRESH_TOKEN = "key_refresh_token"
        private const val KEY_TOKEN_EXPIRES_AT = "key_token_expires_at"
        private const val KEY_USER = "key_user"
        private const val KEY_USER_ROLE = "key_user_role"
        private const val KEY_SELECTED_ROLE = "key_selected_role"
        private const val KEY_PENDING_OAUTH_ROLE = "key_pending_oauth_role"
        private const val KEY_FCM_TOKEN = "key_fcm_token"

        @Volatile
        private var instance: SessionManager? = null

        fun getInstance(context: Context): SessionManager {
            return instance ?: synchronized(this) {
                instance ?: SessionManager(context.applicationContext).also { instance = it }
            }
        }
    }
}
