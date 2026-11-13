package com.tradigoo.app.ui.screens.wholesaler

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Inbox
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tradigoo.app.data.api.ApiTrustScoreResponse
import com.tradigoo.app.domain.model.Order
import com.tradigoo.app.domain.model.Product
import com.tradigoo.app.domain.model.User
import com.tradigoo.app.ui.components.GreenScoreMeter
import com.tradigoo.app.ui.components.StatusBadge
import com.tradigoo.app.ui.components.formatInr
import com.tradigoo.app.ui.components.formatIsoDate
import com.tradigoo.app.ui.theme.*

@Composable
fun WholesalerHomeScreen(
    user: User?,
    trustScore: ApiTrustScoreResponse?,
    inventory: List<Product>,
    orders: List<Order>,
    isLoading: Boolean = false,
    onRefresh: () -> Unit = {},
    onNavigateToAddProduct: () -> Unit,
    onNavigateToOrders: () -> Unit
) {
    val scrollState = rememberScrollState()

    val totalRevenue = orders
        .filter { it.normalizedStatus() !in setOf("cancelled", "refunded") }
        .sumOf { it.totalAmount }
    val pendingShipments = orders.count {
        val status = it.normalizedStatus()
        status == "payment_in_escrow" || status == "payment_pending"
    }
    val activeSkuCount = inventory.count { it.isActive }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(TradigooBackground)
            .verticalScroll(scrollState)
            .padding(16.dp)
    ) {
        // Supplier Hub Banner Card (Deep Navy & Gold Identity)
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(20.dp)),
            colors = CardDefaults.cardColors(containerColor = Color.Transparent)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(TradigooBrandGradient)
                    .padding(20.dp)
            ) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "SUPPLIER HUB",
                            color = TradigooGoldLight,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp
                        )

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(Color.White.copy(alpha = 0.14f))
                                    .padding(horizontal = 8.dp, vertical = 3.dp)
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    if (user?.gstVerified == true) {
                                        Icon(
                                            imageVector = Icons.Default.Verified,
                                            contentDescription = null,
                                            tint = TradigooEmeraldLight,
                                            modifier = Modifier.size(12.dp)
                                        )
                                        Spacer(modifier = Modifier.width(4.dp))
                                    }
                                    Text(
                                        text = if (user?.gstVerified == true) "GST Verified" else "Supplier Account",
                                        color = Color.White,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }

                            IconButton(
                                onClick = onRefresh,
                                modifier = Modifier.size(28.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Refresh,
                                    contentDescription = "Refresh dashboard",
                                    tint = Color.White.copy(alpha = 0.85f),
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = user?.businessName?.takeIf { it.isNotBlank() }
                            ?: user?.name?.takeIf { it.isNotBlank() }
                            ?: "Wholesale Partner",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = null,
                            tint = TradigooGoldLight,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = user?.location?.takeIf { it.isNotBlank() } ?: "India",
                            fontSize = 13.sp,
                            color = Color.White.copy(alpha = 0.85f)
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color.White.copy(alpha = 0.08f))
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(text = "Order Volume", fontSize = 10.5.sp, color = Color.White.copy(alpha = 0.7f), maxLines = 1, overflow = TextOverflow.Ellipsis)
                            Text(
                                text = formatInr(totalRevenue),
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                        Column(modifier = Modifier.weight(1f)) {
                            Text(text = "To Dispatch", fontSize = 10.5.sp, color = Color.White.copy(alpha = 0.7f), maxLines = 1, overflow = TextOverflow.Ellipsis)
                            Text(
                                text = "$pendingShipments Orders",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = TradigooGoldLight,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                        Column(modifier = Modifier.weight(1f)) {
                            Text(text = "Active SKUs", fontSize = 10.5.sp, color = Color.White.copy(alpha = 0.7f), maxLines = 1, overflow = TextOverflow.Ellipsis)
                            Text(
                                text = "$activeSkuCount / ${inventory.size}",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }
                }
            }
        }

        if (isLoading) {
            Spacer(modifier = Modifier.height(10.dp))
            LinearProgressIndicator(
                modifier = Modifier.fillMaxWidth(),
                color = TradigooGold,
                trackColor = TradigooCardBorder
            )
        }

        Spacer(modifier = Modifier.height(18.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = TradigooSurface),
            border = BorderStroke(1.dp, TradigooCardBorder)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Escrow Settlement Terms",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = TradigooTextPrimary
                    )

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(TradigooEmeraldBg)
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text(
                            text = "1.5% Platform Fee",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = TradigooEmeraldDark
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "Buyer funds are held securely in Tradigoo Escrow upon checkout and released after delivery OTP & 24-hour inspection clearance.",
                    fontSize = 13.sp,
                    color = TradigooTextSecondary,
                    lineHeight = 18.sp
                )

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Button(
                        onClick = onNavigateToAddProduct,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 8.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = TradigooNavy)
                    ) {
                        Icon(imageVector = Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("List Product", fontSize = 12.sp, fontWeight = FontWeight.Bold, maxLines = 1, softWrap = false)
                    }

                    OutlinedButton(
                        onClick = onNavigateToOrders,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 8.dp),
                        border = BorderStroke(1.dp, TradigooNavy.copy(alpha = 0.25f))
                    ) {
                        Text("Orders (${orders.size})", fontSize = 12.sp, color = TradigooNavy, maxLines = 1, softWrap = false, overflow = TextOverflow.Ellipsis)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        val hasTrustData = trustScore?.hasEnoughData ?: ((user?.totalOrders ?: 0) >= 3)
        GreenScoreMeter(
            score = trustScore?.score ?: if (hasTrustData) user?.trustScore else null,
            hasEnoughData = hasTrustData,
            badgeText = trustScore?.label,
            subtitleText = trustScore?.explanation,
            label = "Wholesaler Supply Credibility"
        )

        Spacer(modifier = Modifier.height(20.dp))

        Text(
            text = "Recent Inbound Orders",
            fontSize = 17.sp,
            fontWeight = FontWeight.Bold,
            color = TradigooTextPrimary
        )

        Spacer(modifier = Modifier.height(12.dp))

        if (orders.isEmpty()) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = TradigooSurface),
                border = BorderStroke(1.dp, TradigooCardBorder)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.Inbox,
                        contentDescription = null,
                        tint = TradigooNavy.copy(alpha = 0.55f),
                        modifier = Modifier.size(36.dp)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "No Inbound Orders Yet",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = TradigooTextPrimary
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "When retailers book your catalog listings, escrow orders and dispatch details will appear here.",
                        fontSize = 12.sp,
                        color = TradigooTextSecondary,
                        textAlign = TextAlign.Center
                    )
                }
            }
        } else {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                orders.take(4).forEach { order ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = TradigooSurface),
                        border = BorderStroke(1.dp, TradigooCardBorder)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "#${order.id.take(8).uppercase()} • ${formatIsoDate(order.createdAt)}",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = TradigooTextTertiary
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = order.productName,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TradigooTextPrimary,
                                    maxLines = 1
                                )
                                Text(
                                    text = "Buyer: ${order.buyerBusinessName?.takeIf { it.isNotBlank() } ?: "Registered Retailer"}",
                                    fontSize = 12.sp,
                                    color = TradigooTextSecondary
                                )
                            }

                            Spacer(modifier = Modifier.width(8.dp))

                            Column(horizontalAlignment = Alignment.End) {
                                StatusBadge(status = order.status)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = formatInr(order.totalAmount),
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TradigooNavy
                                )
                            }
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(88.dp))
    }
}
