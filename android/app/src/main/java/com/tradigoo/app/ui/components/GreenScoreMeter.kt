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
    score: Int,
    label: String = "Green & Trust Score",
    modifier: Modifier = Modifier
) {
    val progress = (score.coerceIn(0, 1000) / 1000f)

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
                    color = Color.White.copy(alpha = 0.7f),
                    fontWeight = FontWeight.Medium
                )
                Text(
                    text = "$score / 1000",
                    fontSize = 22.sp,
                    color = TradigooEmeraldLight,
                    fontWeight = FontWeight.Bold
                )
            }

            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(TradigooEmerald.copy(alpha = 0.2f))
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text(
                    text = "🌱 Top 5% Verified",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = TradigooEmeraldLight
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Progress bar
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(8.dp)
                .clip(CircleShape)
                .background(Color.White.copy(alpha = 0.1f))
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(fraction = progress)
                    .fillMaxHeight()
                    .clip(CircleShape)
                    .background(TradigooEmerald)
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "Calculated from zero payment disputes, punctual dispatch & high delivery success.",
            fontSize = 11.sp,
            color = Color.White.copy(alpha = 0.6f),
            lineHeight = 15.sp
        )
    }
}
