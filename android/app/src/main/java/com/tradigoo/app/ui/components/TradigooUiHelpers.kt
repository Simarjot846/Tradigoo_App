package com.tradigoo.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Inventory2
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import coil.compose.SubcomposeAsyncImage
import com.tradigoo.app.ui.theme.TradigooNavy
import com.tradigoo.app.ui.theme.TradigooNavyBg
import java.text.NumberFormat
import java.time.Instant
import java.time.OffsetDateTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

@Composable
fun ProductThumbnail(
    imageUrl: String?,
    contentDescription: String,
    size: Dp = 56.dp,
    cornerRadius: Dp = 14.dp,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .size(size)
            .clip(RoundedCornerShape(cornerRadius))
            .background(TradigooNavyBg),
        contentAlignment = Alignment.Center
    ) {
        if (!imageUrl.isNullOrBlank()) {
            SubcomposeAsyncImage(
                model = imageUrl,
                contentDescription = contentDescription,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize(),
                loading = {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = Icons.Default.Inventory2,
                            contentDescription = null,
                            tint = TradigooNavy.copy(alpha = 0.45f),
                            modifier = Modifier.size(size * 0.45f)
                        )
                    }
                },
                error = {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = Icons.Default.Inventory2,
                            contentDescription = null,
                            tint = TradigooNavy.copy(alpha = 0.55f),
                            modifier = Modifier.size(size * 0.45f)
                        )
                    }
                }
            )
        } else {
            Icon(
                imageVector = Icons.Default.Inventory2,
                contentDescription = contentDescription,
                tint = TradigooNavy.copy(alpha = 0.6f),
                modifier = Modifier.size(size * 0.45f)
            )
        }
    }
}

fun formatInr(amount: Double): String {
    return try {
        val formatter = NumberFormat.getCurrencyInstance(Locale("en", "IN"))
        formatter.maximumFractionDigits = if (amount % 1.0 == 0.0) 0 else 2
        formatter.format(amount)
    } catch (_: Exception) {
        "₹${amount.toInt()}"
    }
}

fun formatIsoDate(isoString: String?): String {
    if (isoString.isNullOrBlank()) return ""
    return try {
        val instant = try {
            Instant.parse(isoString)
        } catch (_: Exception) {
            OffsetDateTime.parse(isoString).toInstant()
        }
        val local = instant.atZone(ZoneId.systemDefault())
        DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a", Locale.ENGLISH).format(local)
    } catch (_: Exception) {
        isoString.take(16).replace("T", " ")
    }
}
