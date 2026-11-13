package com.tradigoo.app.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tradigoo.app.R
import com.tradigoo.app.domain.model.UserRole
import com.tradigoo.app.ui.theme.*

@Composable
fun TradigooTopBar(
    title: String? = null,
    canNavigateBack: Boolean = false,
    onNavigateBack: () -> Unit = {},
    userRole: UserRole? = null,
    cartCount: Int = 0,
    onCartClick: (() -> Unit)? = null,
    userInitials: String = "T",
    onProfileClick: (() -> Unit)? = null,
    applyStatusBarInsets: Boolean = true
) {
    Surface(
        color = TradigooSurface,
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .then(if (applyStatusBarInsets) Modifier.statusBarsPadding() else Modifier)
                    .heightIn(min = 52.dp)
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Left side: Back / Brand Logo + Role Badge
                Row(
                    modifier = Modifier.weight(1f),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    if (canNavigateBack) {
                        IconButton(
                            onClick = onNavigateBack,
                            modifier = Modifier.size(38.dp)
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Back",
                                tint = TradigooTextPrimary
                            )
                        }
                        Spacer(modifier = Modifier.width(4.dp))
                    }

                    if (title != null) {
                        Text(
                            text = title,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = TradigooTextPrimary,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    } else {
                        Image(
                            painter = painterResource(id = R.drawable.logo_tradigoo),
                            contentDescription = "Tradigoo",
                            modifier = Modifier
                                .height(26.dp)
                                .widthIn(min = 84.dp, max = 108.dp),
                            contentScale = ContentScale.Fit
                        )

                        if (userRole != null) {
                            Spacer(modifier = Modifier.width(8.dp))
                            val isWholesaler = userRole == UserRole.WHOLESALER
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(if (isWholesaler) TradigooEmeraldBg else TradigooGoldBg)
                                    .border(
                                        1.dp,
                                        if (isWholesaler) TradigooEmerald.copy(alpha = 0.3f) else TradigooGold.copy(alpha = 0.4f),
                                        RoundedCornerShape(6.dp)
                                    )
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = userRole.displayName.uppercase(),
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isWholesaler) TradigooEmeraldDark else TradigooNavy,
                                    maxLines = 1,
                                    softWrap = false,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                        }
                    }
                }

                // Right actions: Cart + Profile Avatar
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    if (onCartClick != null) {
                        BadgedBox(
                            badge = {
                                if (cartCount > 0) {
                                    Badge(
                                        containerColor = TradigooGoldDark,
                                        contentColor = Color.White
                                    ) {
                                        Text(
                                            text = if (cartCount > 99) "99+" else cartCount.toString(),
                                            fontSize = 10.sp
                                        )
                                    }
                                }
                            }
                        ) {
                            IconButton(
                                onClick = onCartClick,
                                modifier = Modifier.size(38.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.ShoppingCart,
                                    contentDescription = "Cart",
                                    tint = TradigooNavy,
                                    modifier = Modifier.size(21.dp)
                                )
                            }
                        }
                    }

                    if (onProfileClick != null) {
                        Box(
                            modifier = Modifier
                                .size(34.dp)
                                .clip(CircleShape)
                                .background(TradigooNavy)
                                .border(1.5.dp, TradigooGold, CircleShape)
                                .clickable { onProfileClick() },
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = userInitials.trim().take(2).ifBlank { "T" }.uppercase(),
                                color = TradigooGoldLight,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                maxLines = 1
                            )
                        }
                    }
                }
            }
            HorizontalDivider(color = TradigooCardBorder, thickness = 1.dp)
        }
    }
}
