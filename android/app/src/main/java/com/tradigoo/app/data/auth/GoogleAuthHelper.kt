package com.tradigoo.app.data.auth

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log
import androidx.browser.customtabs.CustomTabsIntent
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.tradigoo.app.R
import com.tradigoo.app.data.local.SessionManager
import com.tradigoo.app.domain.model.UserRole
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow

sealed class GoogleAuthEvent {
    data class Success(
        val idToken: String?,
        val accessToken: String?,
        val email: String?,
        val name: String?,
        val role: UserRole,
        val refreshToken: String? = null,
        val expiresAt: Long? = null
    ) : GoogleAuthEvent()
    data class Error(val message: String) : GoogleAuthEvent()
    object Cancelled : GoogleAuthEvent()
}

object GoogleAuthHelper {

    private const val TAG = "TradigooGoogleAuth"
    private const val DEFAULT_SUPABASE_AUTH_URL =
        "https://skcbzqbtjdctpxtgglbv.supabase.co/auth/v1/authorize?provider=google&redirect_to=com.tradigoo.app://auth/callback"

    private val _events = MutableSharedFlow<GoogleAuthEvent>(extraBufferCapacity = 5)
    val events: SharedFlow<GoogleAuthEvent> = _events.asSharedFlow()

    fun getGoogleSignInClient(context: Context): GoogleSignInClient? {
        val clientId = try {
            context.getString(R.string.default_web_client_id)
        } catch (_: Exception) {
            null
        }

        if (!clientId.isNullOrBlank() && !clientId.contains("YOUR_GOOGLE_WEB_CLIENT_ID")) {
            val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken(clientId)
                .requestEmail()
                .requestProfile()
                .build()
            return GoogleSignIn.getClient(context, gso)
        }
        return null
    }

    /**
     * Initiates Google Sign-In / Registration via Supabase Google OAuth in Custom Tabs
     * (with ActivityResultLauncher recommended when Play Services clientId is configured).
     */
    fun launchGoogleSignIn(context: Context, role: UserRole) {
        val sessionManager = SessionManager.getInstance(context)
        sessionManager.savePendingOAuthRole(role)
        sessionManager.saveSelectedRole(role)
        launchCustomTabOAuth(context)
    }

    fun launchCustomTabOAuth(context: Context) {
        try {
            val authUri = Uri.parse(DEFAULT_SUPABASE_AUTH_URL)
            val customTabsIntent = CustomTabsIntent.Builder()
                .setShowTitle(true)
                .build()
            customTabsIntent.intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            customTabsIntent.launchUrl(context, authUri)
        } catch (e: Exception) {
            Log.w(TAG, "CustomTabs failed, falling back to system browser", e)
            try {
                val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(DEFAULT_SUPABASE_AUTH_URL)).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                context.startActivity(browserIntent)
            } catch (err: Exception) {
                Log.e(TAG, "No browser found to handle Google OAuth", err)
                _events.tryEmit(GoogleAuthEvent.Error("No web browser available to complete Google Sign-In."))
            }
        }
    }

    fun handleSignInResult(data: Intent?, context: Context) {
        val sessionManager = SessionManager.getInstance(context)
        val role = sessionManager.getPendingOAuthRole()

        try {
            val task = GoogleSignIn.getSignedInAccountFromIntent(data)
            val account: GoogleSignInAccount = task.getResult(ApiException::class.java)

            _events.tryEmit(
                GoogleAuthEvent.Success(
                    idToken = account.idToken,
                    accessToken = null,
                    email = account.email,
                    name = account.displayName,
                    role = role
                )
            )
        } catch (e: ApiException) {
            Log.w(TAG, "Google Play Services SignIn failed: statusCode=${e.statusCode}")
            when (e.statusCode) {
                12501, 16 -> _events.tryEmit(GoogleAuthEvent.Cancelled)
                10 -> {
                    _events.tryEmit(
                        GoogleAuthEvent.Error("Google OAuth configuration error. Switching to browser sign-in...")
                    )
                    launchCustomTabOAuth(context)
                }
                else -> _events.tryEmit(
                    GoogleAuthEvent.Error("Google Sign-In failed: ${e.localizedMessage ?: "Unknown error"}")
                )
            }
        } catch (e: Exception) {
            _events.tryEmit(GoogleAuthEvent.Error("Authentication error: ${e.localizedMessage ?: "Unknown"}"))
        }
    }

    fun handleDeepLink(uri: Uri?, context: Context): Boolean {
        if (uri == null) return false
        val scheme = uri.scheme ?: return false
        if (scheme != "com.tradigoo.app" && scheme != "tradigoo") return false

        val host = uri.host ?: ""
        val path = uri.path ?: ""
        if (!host.contains("auth") && !path.contains("callback") && !host.contains("callback")) {
            return false
        }

        val sessionManager = SessionManager.getInstance(context)
        val role = sessionManager.getPendingOAuthRole()

        var accessToken: String? = uri.getQueryParameter("access_token")
        var refreshToken: String? = uri.getQueryParameter("refresh_token")
        var expiresAt: Long? = uri.getQueryParameter("expires_at")?.toLongOrNull()
        var expiresIn: Long? = uri.getQueryParameter("expires_in")?.toLongOrNull()

        val fragment = uri.fragment
        if (fragment != null) {
            val params = fragment.split("&")
            for (param in params) {
                val eqIndex = param.indexOf('=')
                if (eqIndex > 0) {
                    val key = param.substring(0, eqIndex)
                    val value = Uri.decode(param.substring(eqIndex + 1))
                    when (key) {
                        "access_token" -> accessToken = value
                        "refresh_token" -> refreshToken = value
                        "expires_at" -> expiresAt = value.toLongOrNull()
                        "expires_in" -> expiresIn = value.toLongOrNull()
                    }
                }
            }
        }

        val resolvedExpiresAt = expiresAt ?: expiresIn?.let { (System.currentTimeMillis() / 1000L) + it }

        if (!accessToken.isNullOrBlank()) {
            _events.tryEmit(
                GoogleAuthEvent.Success(
                    idToken = null,
                    accessToken = accessToken,
                    email = null,
                    name = null,
                    role = role,
                    refreshToken = refreshToken,
                    expiresAt = resolvedExpiresAt
                )
            )
            return true
        }

        val error = uri.getQueryParameter("error_description") ?: uri.getQueryParameter("error")
        if (!error.isNullOrBlank()) {
            _events.tryEmit(GoogleAuthEvent.Error(error))
            return true
        }

        return false
    }
}
