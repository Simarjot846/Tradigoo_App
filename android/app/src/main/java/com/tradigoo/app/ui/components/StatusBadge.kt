package com.tradigoo.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tradigoo.app.ui.theme.*

@Composable
fun StatusBadge(
    status: String,
    modifier: Modifier = Modifier
) {
    val normalized = status.trim().lowercase()

    val (bgColor, textColor, borderColor, displayLabel) = when {
        normalized == "payment_in_escrow" || normalized == "payment_held" ->
            Quad(TradigooNavyBg, TradigooNavy, TradigooNavy.copy(alpha = 0.25f), "In Escrow")
        normalized == "payment_pending" || normalized == "order_created" ->
            Quad(TradigooAmberBg, TradigooAmber, TradigooAmber.copy(alpha = 0.3f), "Payment Pending")
        normalized == "shipped" || normalized == "courier_verified" ->
            Quad(TradigooGoldBg, TradigooGoldDark, TradigooGold.copy(alpha = 0.35f), if (normalized == "courier_verified") "Courier Verified" else "Shipped")
        normalized == "delivered" ->
            Quad(TradigooBlueBg, TradigooBlue, TradigooBlue.copy(alpha = 0.3f), "Delivered (Verify OTP)")
        normalized == "inspection" || normalized == "inspection_pending" ->
            Quad(TradigooAmberBg, TradigooAmber, TradigooAmber.copy(alpha = 0.3f), "24h Inspection")
        normalized == "completed" || normalized == "payment_released" ->
            Quad(TradigooEmeraldBg, TradigooEmeraldDark, TradigooEmerald.copy(alpha = 0.3f), "Completed")
        normalized == "disputed" ->
            Quad(StatusErrorBg, StatusError, StatusError.copy(alpha = 0.3f), "Disputed")
        normalized == "refunded" ->
            Quad(TradigooSurfaceElevated, TradigooTextSecondary, TradigooCardBorder, "Refunded")
        normalized == "cancelled" ->
            Quad(StatusErrorBg, StatusError, StatusError.copy(alpha = 0.3f), "Cancelled")
        else ->
            Quad(
                TradigooNavyBg,
                TradigooNavy,
                TradigooNavy.copy(alpha = 0.25f),
                normalized.replace("_", " ").replaceFirstChar { it.uppercase() }
            )
    }

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(8.dp))
            .background(bgColor)
            .border(1.dp, borderColor, RoundedCornerShape(8.dp))
            .padding(horizontal = 10.dp, vertical = 4.dp)
    ) {
        Text(
            text = displayLabel,
            color = textColor,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

private data class Quad<A, B, C, D>(val first: A, val second: B, val third: C, val fourth: D)
