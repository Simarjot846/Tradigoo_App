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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tradigoo.app.R
import com.tradigoo.app.domain.model.UserRole
import com.tradigoo.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TradigooTopBar(
    title: String? = null,
    canNavigateBack: Boolean = false,
    onNavigateBack: () -> Unit = {},
    userRole: UserRole? = null,
    cartCount: Int = 0,
    onCartClick: (() -> Unit)? = null,
    userInitials: String = "T",
    onProfileClick: (() -> Unit)? = null
) {
    TopAppBar(
        title = {
            if (title != null) {
                Text(
                    text = title,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = TradigooTextPrimary
                )
            } else {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Image(
                        painter = painterResource(id = R.drawable.logo_tradigoo),
                        contentDescription = "Tradigoo",
                        modifier = Modifier
                            .height(30.dp)
                            .width(128.dp),
                        contentScale = ContentScale.Fit
                    )

                    if (userRole != null) {
                        Spacer(modifier = Modifier.width(10.dp))
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
                                .padding(horizontal = 7.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = userRole.displayName.uppercase(),
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isWholesaler) TradigooEmeraldDark else TradigooNavy
                            )
                        }
                    }
                }
            }
        },
        navigationIcon = {
            if (canNavigateBack) {
                IconButton(onClick = onNavigateBack) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint = TradigooTextPrimary
                    )
                }
            }
        },
        actions = {
            if (onCartClick != null) {
                BadgedBox(
                    badge = {
                        if (cartCount > 0) {
                            Badge(
                                containerColor = TradigooGoldDark,
                                contentColor = Color.White
                            ) {
                                Text(text = cartCount.toString())
                            }
                        }
                    },
                    modifier = Modifier.padding(end = 6.dp)
                ) {
                    IconButton(onClick = onCartClick) {
                        Icon(
                            imageVector = Icons.Default.ShoppingCart,
                            contentDescription = "Cart",
                            tint = TradigooNavy
                        )
                    }
                }
            }

            if (onProfileClick != null) {
                Box(
                    modifier = Modifier
                        .padding(end = 12.dp)
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(TradigooNavy)
                        .border(1.5.dp, TradigooGold, CircleShape)
                        .clickable { onProfileClick() },
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = userInitials.take(2).uppercase(),
                        color = TradigooGoldLight,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = TradigooSurface
        )
    )
}
