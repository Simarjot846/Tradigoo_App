package com.tradigoo.app.ui.screens.retailer

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tradigoo.app.domain.model.Order
import com.tradigoo.app.ui.components.StatusBadge
import com.tradigoo.app.ui.theme.*

@Composable
fun RetailerOrdersScreen(
    orders: List<Order>,
    onExploreMarketplace: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(TradigooBackground)
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "My Wholesale Orders",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = TradigooTextPrimary
                )
                Text(
                    text = "${orders.size} active escrow & past shipments",
                    fontSize = 13.sp,
                    color = TradigooTextSecondary
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        if (orders.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(text = "📦", fontSize = 48.sp)
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "No orders placed yet",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = TradigooTextPrimary
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Explore wholesale products directly from verified manufacturers.",
                        fontSize = 13.sp,
                        color = TradigooTextSecondary
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = onExploreMarketplace,
                        colors = ButtonDefaults.buttonColors(containerColor = TradigooBlue)
                    ) {
                        Text("Browse Marketplace")
                    }
                }
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(14.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(orders) { order ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(18.dp),
                        colors = CardDefaults.cardColors(containerColor = TradigooSurface),
                        border = androidx.compose.foundation.BorderStroke(1.dp, TradigooCardBorder)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = "#${order.id}",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = TradigooTextSecondary
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "• ${order.createdAt}",
                                        fontSize = 12.sp,
                                        color = TradigooTextTertiary
                                    )
                                }

                                StatusBadge(status = order.status)
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            Text(
                                text = order.productName,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = TradigooTextPrimary
                            )

                            Spacer(modifier = Modifier.height(4.dp))

                            Text(
                                text = "Supplier: ${order.sellerBusinessName ?: "Verified Mill Consortium"}",
                                fontSize = 13.sp,
                                color = TradigooTextSecondary
                            )

                            Spacer(modifier = Modifier.height(12.dp))

                            HorizontalDivider(color = TradigooCardBorder.copy(alpha = 0.6f))

                            Spacer(modifier = Modifier.height(12.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(
                                        text = "Quantity: ${order.quantity} ${order.unit}",
                                        fontSize = 12.sp,
                                        color = TradigooTextSecondary
                                    )
                                    Text(
                                        text = "₹${order.unitPrice}/${order.unit}",
                                        fontSize = 12.sp,
                                        color = TradigooTextSecondary
                                    )
                                }

                                Column(horizontalAlignment = Alignment.End) {
                                    Text(
                                        text = "Total Settlement",
                                        fontSize = 11.sp,
                                        color = TradigooTextSecondary
                                    )
                                    Text(
                                        text = "₹${order.totalAmount.toInt()}",
                                        fontSize = 18.sp,
                                        fontWeight = FontWeight.Black,
                                        color = TradigooBlue
                                    )
                                }
                            }

                            // Escrow notice bar
                            Spacer(modifier = Modifier.height(12.dp))
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(TradigooBlueBg)
                                    .padding(horizontal = 12.dp, vertical = 8.dp)
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(text = "🔒", fontSize = 14.sp)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = if (order.status.contains("ESCROW")) {
                                            "Funds held safely in Tradigoo Escrow until goods arrive & inspected."
                                        } else {
                                            "Physical delivery verified with automated GST invoice generation."
                                        },
                                        fontSize = 11.5.sp,
                                        color = TradigooBlue,
                                        lineHeight = 15.sp
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
