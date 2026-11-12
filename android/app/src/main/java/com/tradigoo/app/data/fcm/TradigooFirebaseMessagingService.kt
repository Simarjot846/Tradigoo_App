package com.tradigoo.app.data.fcm

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.tradigoo.app.MainActivity
import com.tradigoo.app.R
import com.tradigoo.app.data.api.RegisterTokenRequest
import com.tradigoo.app.data.api.RetrofitClient
import com.tradigoo.app.data.local.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlin.random.Random

class TradigooFirebaseMessagingService : FirebaseMessagingService() {

    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "New FCM Token received: $token")

        val sessionManager = SessionManager.getInstance(applicationContext)
        sessionManager.saveFcmToken(token)

        // Sync token with Tradigoo Backend
        sendRegistrationToServer(token)
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        Log.d(TAG, "From: ${remoteMessage.from}")

        // 1. Extract payload data
        val data = remoteMessage.data
        val notification = remoteMessage.notification

        val title = data["title"]
            ?: notification?.title
            ?: getString(R.string.app_name)

        val body = data["body"]
            ?: notification?.body
            ?: "New update on Tradigoo B2B marketplace"

        val type = data["type"] ?: data["notification_type"] ?: TYPE_ORDER_UPDATE
        val orderId = data["order_id"] ?: data["id"]
        val category = data["category"] ?: "general"

        Log.d(TAG, "Message received - type: $type, orderId: $orderId, title: $title")

        // 2. Dispatch system notification
        showNotification(
            title = title,
            body = body,
            type = type,
            orderId = orderId,
            category = category
        )
    }

    private fun showNotification(
        title: String,
        body: String,
        type: String,
        orderId: String?,
        category: String
    ) {
        // Choose appropriate channel based on alert type
        val channelId = when (type.lowercase()) {
            TYPE_MARKETPLACE_ALERT, "demand", "trending", "rfq" -> {
                NotificationHelper.CHANNEL_MARKETPLACE_ID
            }
            else -> {
                // Default to orders & escrow channel
                NotificationHelper.CHANNEL_ORDERS_ID
            }
        }

        // Setup Intent for user click
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra(NotificationHelper.EXTRA_NOTIFICATION_TYPE, type)
            putExtra(NotificationHelper.EXTRA_TARGET_SCREEN, if (channelId == NotificationHelper.CHANNEL_MARKETPLACE_ID) "marketplace" else "orders")
            if (!orderId.isNullOrBlank()) {
                putExtra(NotificationHelper.EXTRA_ORDER_ID, orderId)
            }
        }

        val requestCode = (orderId?.hashCode() ?: Random.nextInt(1000, 99999))
        val pendingIntent = PendingIntent.getActivity(
            this,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)

        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setAutoCancel(true)
            .setSound(defaultSoundUri)
            .setColor(0xFF2563EB.toInt()) // Tradigoo Royal Blue
            .setContentIntent(pendingIntent)

        if (channelId == NotificationHelper.CHANNEL_ORDERS_ID) {
            notificationBuilder.setPriority(NotificationCompat.PRIORITY_HIGH)
            notificationBuilder.setCategory(NotificationCompat.CATEGORY_STATUS)
        } else {
            notificationBuilder.setPriority(NotificationCompat.PRIORITY_DEFAULT)
            notificationBuilder.setCategory(NotificationCompat.CATEGORY_PROMO)
        }

        val notificationManager = NotificationManagerCompat.from(this)
        val notificationId = orderId?.hashCode() ?: System.currentTimeMillis().toInt()

        try {
            if (NotificationHelper.hasNotificationPermission(this)) {
                notificationManager.notify(notificationId, notificationBuilder.build())
            }
        } catch (e: SecurityException) {
            Log.e(TAG, "Notification permission not granted to display: ${e.message}")
        }
    }

    private fun sendRegistrationToServer(token: String) {
        serviceScope.launch {
            try {
                val sessionManager = SessionManager.getInstance(applicationContext)
                val user = sessionManager.getUser()
                val role = sessionManager.getUserRole().value

                val request = RegisterTokenRequest(
                    userId = user?.id,
                    token = token,
                    role = role,
                    platform = "android"
                )

                val response = RetrofitClient.getApiService(applicationContext).registerFcmToken(request)
                if (response.isSuccessful) {
                    Log.d(TAG, "FCM token registered with server successfully")
                } else {
                    Log.w(TAG, "Failed to register FCM token with server: ${response.code()}")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error syncing FCM token with backend", e)
            }
        }
    }

    companion object {
        private const val TAG = "TradigooFCM"
        const val TYPE_ORDER_UPDATE = "order_update"
        const val TYPE_ESCROW_UPDATE = "escrow_update"
        const val TYPE_MARKETPLACE_ALERT = "marketplace_alert"
        const val TYPE_DISPUTE_ALERT = "dispute_alert"
    }
}
