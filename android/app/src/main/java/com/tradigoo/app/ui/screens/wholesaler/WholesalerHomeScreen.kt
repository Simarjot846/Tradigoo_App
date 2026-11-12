package com.tradigoo.app.ui.screens.wholesaler

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tradigoo.app.domain.model.Order
import com.tradigoo.app.domain.model.Product
import com.tradigoo.app.domain.model.User
import com.tradigoo.app.ui.components.GreenScoreMeter
import com.tradigoo.app.ui.components.StatusBadge
import com.tradigoo.app.ui.theme.*

@Composable
fun WholesalerHomeScreen(
    user: User?,
    inventory: List<Product>,
    orders: List<Order>,
    onNavigateToAddProduct: () -> Unit,
    onNavigateToOrders: () -> Unit
) {
    val scrollState = rememberScrollState()

    val totalRevenue = orders.sumOf { it.totalAmount }
    val pendingShipments = orders.count { it.status == "ORDER_CREATED" || it.status.contains("ESCROW") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(TradigooBackground)
            .verticalScroll(scrollState)
            .padding(16.dp)
    ) {
        // Wholesaler Banner Card (Emerald Theme)
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(20.dp)),
            colors = CardDefaults.cardColors(containerColor = Color.Transparent)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.horizontalGradient(
                            listOf(Color(0xFF065F46), Color(0xFF10B981))
                        )
                    )
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
                            color = Color.White.copy(alpha = 0.85f),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp
                        )

                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(Color.White.copy(alpha = 0.25f))
                                .padding(horizontal = 8.dp, vertical = 3.dp)
                        ) {
                            Text(
                                text = "Verified Seller Mill",
                                color = Color.White,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = user?.businessName ?: "Bharat Agro Processing Ltd",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = "📍 ${user?.location ?: "MIDC Industrial Estate, Nagpur"}",
                        fontSize = 13.sp,
                        color = Color.White.copy(alpha = 0.9f)
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // Metrics Bar
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color.Black.copy(alpha = 0.25f))
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(text = "Total Volume", fontSize = 11.sp, color = Color.White.copy(alpha = 0.7f))
                            Text(text = "₹${(totalRevenue / 1000).toInt()}k", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        }
                        Column {
                            Text(text = "Pending Dispatch", fontSize = 11.sp, color = Color.White.copy(alpha = 0.7f))
                            Text(text = "$pendingShipments Orders", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = TradigooAmber)
                        }
                        Column {
                            Text(text = "Active SKUs", fontSize = 11.sp, color = Color.White.copy(alpha = 0.7f))
                            Text(text = "${inventory.size} Products", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Wholesaler Settlement Terms Card (As shown in user screenshots: 1.5% settlement fee, guaranteed payouts)
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = TradigooSurface),
            border = androidx.compose.foundation.BorderStroke(1.dp, TradigooEmerald.copy(alpha = 0.3f))
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "1.5% Settlement Fee Terms",
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
                            text = "Zero Default Risk",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = TradigooEmeraldDark
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "Expand your retail reach across India with guaranteed payouts upon verified delivery via Tradigoo Escrow.",
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
                        colors = ButtonDefaults.buttonColors(containerColor = TradigooEmerald)
                    ) {
                        Icon(imageVector = Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("List Product", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }

                    OutlinedButton(
                        onClick = onNavigateToOrders,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("View Orders (${orders.size})", fontSize = 12.sp)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Wholesaler Trust & Reliability Score
        GreenScoreMeter(
            score = user?.trustScore ?: 780,
            label = "Wholesaler Supply Credibility & Reliability"
        )

        Spacer(modifier = Modifier.height(20.dp))

        // Recent Inbound Orders Section
        Text(
            text = "Recent Retail Inbound Orders",
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
                border = androidx.compose.foundation.BorderStroke(1.dp, TradigooCardBorder)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(text = "📬", fontSize = 32.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "No Inbound Orders Yet",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = TradigooTextPrimary
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "When retailers purchase your products, consignment details and delivery OTP codes will appear here.",
                        fontSize = 12.sp,
                        color = TradigooTextSecondary,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                }
            }
        } else {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                orders.take(3).forEach { order ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = TradigooSurface),
                        border = androidx.compose.foundation.BorderStroke(1.dp, TradigooCardBorder)
                    ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "#${order.id}",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TradigooTextSecondary
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(text = "• ${order.createdAt}", fontSize = 11.sp, color = TradigooTextTertiary)
                            }
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = order.productName,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = TradigooTextPrimary,
                                maxLines = 1
                            )
                            Text(
                                text = "Buyer: ${order.buyerBusinessName ?: "Verified Kirana Store"}",
                                fontSize = 12.sp,
                                color = TradigooTextSecondary
                            )
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            StatusBadge(status = order.status)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "₹${order.totalAmount.toInt()}",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = TradigooEmeraldDark
                            )
                        }
                    }
                }
            }
        }
    }
}
}
