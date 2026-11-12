package com.tradigoo.app.data.fcm

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.pm.PackageManager
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build
import androidx.core.content.ContextCompat

object NotificationHelper {

    const val CHANNEL_ORDERS_ID = "channel_orders"
    const val CHANNEL_ORDERS_NAME = "Order & Escrow Updates"
    const val CHANNEL_ORDERS_DESC = "Notifications regarding order placement, tracking, dispatch, delivery confirmation, and escrow fund releases."

    const val CHANNEL_MARKETPLACE_ID = "channel_marketplace"
    const val CHANNEL_MARKETPLACE_NAME = "Marketplace & Demand Alerts"
    const val CHANNEL_MARKETPLACE_DESC = "AI-powered wholesale demand alerts, trending SKU notifications, and factory price discounts."

    const val EXTRA_TARGET_SCREEN = "extra_target_screen"
    const val EXTRA_ORDER_ID = "extra_order_id"
    const val EXTRA_NOTIFICATION_TYPE = "extra_notification_type"

    /**
     * Creates notification channels for Android 8.0 (API 26) and above.
     */
    fun createNotificationChannels(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
                ?: return

            val defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
            val audioAttributes = AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                .build()

            // 1. Order Status & Escrow Updates Channel (High Importance)
            val orderChannel = NotificationChannel(
                CHANNEL_ORDERS_ID,
                CHANNEL_ORDERS_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = CHANNEL_ORDERS_DESC
                enableLights(true)
                lightColor = 0xFF2563EB.toInt() // Tradigoo Primary Blue
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 250, 150, 250)
                setSound(defaultSoundUri, audioAttributes)
                setShowBadge(true)
            }

            // 2. Marketplace & Demand Alerts Channel (Default Importance)
            val marketplaceChannel = NotificationChannel(
                CHANNEL_MARKETPLACE_ID,
                CHANNEL_MARKETPLACE_NAME,
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = CHANNEL_MARKETPLACE_DESC
                enableLights(true)
                lightColor = 0xFF7C3AED.toInt() // Tradigoo Violet
                enableVibration(true)
                setShowBadge(true)
            }

            notificationManager.createNotificationChannel(orderChannel)
            notificationManager.createNotificationChannel(marketplaceChannel)
        }
    }

    /**
     * Checks if notification permission is granted (required for Android 13+ / API 33+).
     */
    fun hasNotificationPermission(context: Context): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.checkSelfPermission(
                context,
                android.Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
        } else {
            true
        }
    }
}
