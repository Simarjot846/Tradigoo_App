package com.tradigoo.app.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tradigoo.app.domain.model.UserRole
import com.tradigoo.app.ui.theme.*

@Composable
fun RoleCard(
    role: UserRole,
    isSelected: Boolean,
    onSelect: () -> Unit,
    modifier: Modifier = Modifier
) {
    val isRetailer = role == UserRole.RETAILER

    val primaryColor = if (isRetailer) TradigooBlue else TradigooEmerald
    val lightBgColor = if (isRetailer) TradigooBlueBg else TradigooEmeraldBg

    val borderColor by animateColorAsState(
        targetValue = if (isSelected) primaryColor else TradigooCardBorder,
        label = "border_color"
    )

    val scale by animateFloatAsState(
        targetValue = if (isSelected) 1.02f else 1.0f,
        label = "card_scale"
    )

    val title = if (isRetailer) "Join as a Retailer" else "Join as a Wholesaler"
    val subtitle = if (isRetailer) "Buy for your business" else "Sell wholesale inventory"
    val description = if (isRetailer) {
        "Discover products, compare suppliers and source stock for your retail business with escrow safety."
    } else {
        "Connect with verified retailers, showcase your product catalog and manage wholesale supply orders."
    }

    val features = if (isRetailer) {
        listOf(
            "Direct sourcing from verified wholesale suppliers",
            "Escrow protection until delivery is verified",
            "QR-based parcel inspection & OTP confirmation",
            "Transparent wholesale pricing & order tracking",
            "Dedicated dispute resolution support"
        )
    } else {
        listOf(
            "Direct access to registered retail buyers",
            "Automated escrow release upon delivery verification",
            "Manage catalog, inventory & minimum order quantities",
            "Digital order management & dispatch tracking",
            "Build buyer credibility with Tradigoo Trust Score"
        )
    }

    val ctaText = if (isRetailer) "Continue as Retailer" else "Continue as Wholesaler"

    Card(
        modifier = modifier
            .fillMaxWidth()
            .scale(scale)
            .clip(RoundedCornerShape(22.dp))
            .border(
                width = if (isSelected) 2.5.dp else 1.5.dp,
                color = borderColor,
                shape = RoundedCornerShape(22.dp)
            )
            .clickable { onSelect() },
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) lightBgColor.copy(alpha = 0.5f) else TradigooSurface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = if (isSelected) 4.dp else 1.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(18.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(RoundedCornerShape(13.dp))
                            .background(lightBgColor),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = if (isRetailer) "🏪" else "🏭",
                            fontSize = 22.sp
                        )
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Column {
                        Text(
                            text = title,
                            fontSize = 16.5.sp,
                            fontWeight = FontWeight.Bold,
                            color = TradigooTextPrimary
                        )
                        Text(
                            text = subtitle,
                            fontSize = 12.5.sp,
                            color = primaryColor,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }

                Box(
                    modifier = Modifier
                        .size(24.dp)
                        .clip(CircleShape)
                        .border(
                            width = 2.dp,
                            color = if (isSelected) primaryColor else TradigooCardBorder,
                            shape = CircleShape
                        )
                        .background(if (isSelected) primaryColor else Color.Transparent),
                    contentAlignment = Alignment.Center
                ) {
                    if (isSelected) {
                        Icon(
                            imageVector = Icons.Default.Check,
                            contentDescription = "Selected",
                            tint = Color.White,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = description,
                fontSize = 13.sp,
                lineHeight = 18.sp,
                color = TradigooTextSecondary
            )

            Spacer(modifier = Modifier.height(14.dp))

            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                features.forEach { feature ->
                    Row(
                        verticalAlignment = Alignment.Top,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Box(
                            modifier = Modifier
                                .size(18.dp)
                                .clip(CircleShape)
                                .background(primaryColor.copy(alpha = 0.15f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Check,
                                contentDescription = null,
                                tint = primaryColor,
                                modifier = Modifier.size(12.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = feature,
                            fontSize = 12.5.sp,
                            color = TradigooTextPrimary,
                            fontWeight = FontWeight.Normal,
                            lineHeight = 17.sp,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Non-nested visual indicator (Card is clickable)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(44.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(if (isSelected) primaryColor else lightBgColor),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = ctaText,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isSelected) Color.White else primaryColor
                )
            }
        }
    }
}
