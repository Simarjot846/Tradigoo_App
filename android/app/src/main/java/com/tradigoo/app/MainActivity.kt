package com.tradigoo.app

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.lifecycle.lifecycleScope
import android.content.Intent
import com.google.firebase.messaging.FirebaseMessaging
import com.tradigoo.app.data.api.RegisterTokenRequest
import com.tradigoo.app.data.api.RetrofitClient
import com.tradigoo.app.data.auth.GoogleAuthHelper
import com.tradigoo.app.data.fcm.NotificationHelper
import com.tradigoo.app.data.local.SessionManager
import com.tradigoo.app.domain.model.UserRole
import com.tradigoo.app.ui.navigation.AppNavHost
import com.tradigoo.app.ui.theme.TradigooBackground
import com.tradigoo.app.ui.theme.TradigooTheme
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // 1. Handle incoming OAuth deep link (Google Sign-In callback)
        handleIncomingIntent(intent)

        // 2. Initialize notification channels for Android 8.0+
        NotificationHelper.createNotificationChannels(this)

        // 3. Initialize FCM & Topic Subscriptions
        initializeFirebaseMessaging()

        setContent {
            TradigooTheme {
                // Request Notification Permission on Android 13+ (API 33+)
                val permissionLauncher = rememberLauncherForActivityResult(
                    contract = ActivityResultContracts.RequestPermission(),
                    onResult = { isGranted: Boolean ->
                        Log.d(TAG, "POST_NOTIFICATIONS permission granted: $isGranted")
                    }
                )

                LaunchedEffect(Unit) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        val hasPermission = ContextCompat.checkSelfPermission(
                            this@MainActivity,
                            Manifest.permission.POST_NOTIFICATIONS
                        ) == PackageManager.PERMISSION_GRANTED

                        if (!hasPermission) {
                            permissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                        }
                    }
                }

                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = TradigooBackground
                ) {
                    AppNavHost()
                }
            }
        }
    }

    private fun initializeFirebaseMessaging() {
        try {
            FirebaseMessaging.getInstance().token.addOnCompleteListener { task: com.google.android.gms.tasks.Task<String> ->
                if (!task.isSuccessful) {
                    Log.w(TAG, "Fetching FCM registration token failed", task.exception)
                    return@addOnCompleteListener
                }

                // Get new FCM registration token
                val token = task.result
                Log.d(TAG, "Current FCM Token: $token")

                val sessionManager = SessionManager.getInstance(applicationContext)
                sessionManager.saveFcmToken(token)

                // Subscribe to universal broadcast topic
                FirebaseMessaging.getInstance().subscribeToTopic("all_users")
                FirebaseMessaging.getInstance().subscribeToTopic("orders")

                // Subscribe to role-based topic
                val role = sessionManager.getUserRole()
                if (role == UserRole.WHOLESALER) {
                    FirebaseMessaging.getInstance().subscribeToTopic("wholesalers")
                    FirebaseMessaging.getInstance().subscribeToTopic("wholesaler_demand_alerts")
                } else {
                    FirebaseMessaging.getInstance().subscribeToTopic("retailers")
                    FirebaseMessaging.getInstance().subscribeToTopic("retailer_marketplace_alerts")
                }

                // Register token with backend API
                lifecycleScope.launch(Dispatchers.IO) {
                    try {
                        val user = sessionManager.getUser()
                        val request = RegisterTokenRequest(
                            userId = user?.id,
                            token = token,
                            role = role.value,
                            platform = "android"
                        )
                        RetrofitClient.getApiService(this@MainActivity).registerFcmToken(request)
                    } catch (e: Exception) {
                        Log.e(TAG, "Failed to register FCM token with server", e)
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing Firebase Messaging: ${e.message}")
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleIncomingIntent(intent)
    }

    private fun handleIncomingIntent(intent: Intent?) {
        intent?.data?.let { uri ->
            Log.d(TAG, "Received deep link: $uri")
            GoogleAuthHelper.handleDeepLink(uri, this)
        }
    }

    companion object {
        private const val TAG = "TradigooMainActivity"
    }
}
