package com.tradigoo.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tradigoo.app.ui.theme.*

@Composable
fun GreenScoreMeter(
    score: Int?,
    label: String = "Tradigoo Trust Score",
    hasEnoughData: Boolean = true,
    badgeText: String? = null,
    subtitleText: String? = null,
    modifier: Modifier = Modifier
) {
    val safeScore = score?.coerceIn(0, 1000) ?: 0
    val progress = if (hasEnoughData && score != null) (safeScore / 1000f) else 0f

    val resolvedBadge = badgeText ?: when {
        !hasEnoughData || score == null -> "New Account"
        safeScore >= 750 -> "Elite Verified"
        safeScore >= 550 -> "Trusted Partner"
        safeScore >= 350 -> "Standard Partner"
        else -> "Review Required"
    }

    val badgeColor = when {
        !hasEnoughData || score == null -> TradigooGoldLight
        safeScore >= 550 -> TradigooEmeraldLight
        safeScore >= 350 -> TradigooGoldLight
        else -> Color(0xFFFCA5A5)
    }

    val resolvedSubtitle = subtitleText ?: if (!hasEnoughData || score == null) {
        "Complete at least 3 verified orders to unlock your live Tradigoo Trust Score."
    } else {
        "Calculated from completed orders, zero unresolved disputes & GST verification."
    }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(TradigooNavy)
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = label,
                    fontSize = 12.sp,
                    color = Color.White.copy(alpha = 0.72f),
                    fontWeight = FontWeight.Medium
                )
                Text(
                    text = if (hasEnoughData && score != null) "$safeScore / 1000" else "Insufficient Data",
                    fontSize = 21.sp,
                    color = if (hasEnoughData && score != null) TradigooGoldLight else Color.White,
                    fontWeight = FontWeight.Bold
                )
            }

            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color.White.copy(alpha = 0.12f))
                    .padding(horizontal = 10.dp, vertical = 5.dp)
            ) {
                Text(
                    text = resolvedBadge,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = badgeColor
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(8.dp)
                .clip(CircleShape)
                .background(Color.White.copy(alpha = 0.12f))
        ) {
            if (progress > 0f) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth(fraction = progress)
                        .fillMaxHeight()
                        .clip(CircleShape)
                        .background(if (safeScore >= 550) TradigooEmerald else TradigooGold)
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = resolvedSubtitle,
            fontSize = 11.sp,
            color = Color.White.copy(alpha = 0.65f),
            lineHeight = 15.sp
        )
    }
}
