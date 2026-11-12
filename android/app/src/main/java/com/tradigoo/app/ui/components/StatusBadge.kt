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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tradigoo.app.ui.theme.*

@Composable
fun StatusBadge(
    status: String,
    modifier: Modifier = Modifier
) {
    val normalized = status.uppercase()

    val (bgColor, textColor, borderColor) = when {
        normalized.contains("ESCROW") || normalized.contains("HELD") -> Triple(
            TradigooVioletBg,
            TradigooViolet,
            TradigooViolet.copy(alpha = 0.3f)
        )
        normalized.contains("SHIPPED") -> Triple(
            TradigooAmberBg,
            TradigooAmber,
            TradigooAmber.copy(alpha = 0.3f)
        )
        normalized.contains("DELIVERED") || normalized.contains("COMPLETED") || normalized.contains("RELEASED") -> Triple(
            TradigooEmeraldBg,
            TradigooEmerald,
            TradigooEmerald.copy(alpha = 0.3f)
        )
        normalized.contains("CANCEL") || normalized.contains("DISPUTE") -> Triple(
            StatusErrorBg,
            StatusError,
            StatusError.copy(alpha = 0.3f)
        )
        else -> Triple(
            TradigooBlueBg,
            TradigooBlue,
            TradigooBlue.copy(alpha = 0.3f)
        )
    }

    val displayLabel = status.replace("_", " ").lowercase().replaceFirstChar { it.uppercase() }

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
