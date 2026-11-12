package com.tradigoo.app.ui.screens.wholesaler

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
fun WholesalerOrdersScreen(
    orders: List<Order>,
    onUpdateStatus: (String, String) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(TradigooBackground)
            .padding(16.dp)
    ) {
        Text(
            text = "Received Purchase Orders",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = TradigooTextPrimary
        )
        Text(
            text = "${orders.size} retailer bookings awaiting dispatch or settlement",
            fontSize = 13.sp,
            color = TradigooTextSecondary
        )

        Spacer(modifier = Modifier.height(16.dp))

        if (orders.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(text = "📋", fontSize = 48.sp)
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "No purchase orders yet",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = TradigooTextPrimary
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "When verified retailers place orders for your wholesale listings, they will appear here with instant escrow protection.",
                        fontSize = 13.sp,
                        color = TradigooTextSecondary,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
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
                            Column {
                                Text(
                                    text = "Order #${order.id}",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TradigooTextSecondary
                                )
                                Text(
                                    text = "Booked on: ${order.createdAt}",
                                    fontSize = 11.sp,
                                    color = TradigooTextTertiary
                                )
                            }

                            StatusBadge(status = order.status)
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(
                            text = order.productName,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = TradigooTextPrimary
                        )

                        Text(
                            text = "Buyer: ${order.buyerBusinessName ?: "Gupta Kirana Store"}",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium,
                            color = TradigooTextSecondary
                        )

                        Spacer(modifier = Modifier.height(10.dp))
                        HorizontalDivider(color = TradigooCardBorder.copy(alpha = 0.5f))
                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "Consignment Size",
                                    fontSize = 11.sp,
                                    color = TradigooTextSecondary
                                )
                                Text(
                                    text = "${order.quantity} ${order.unit} @ ₹${order.unitPrice}",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = TradigooTextPrimary
                                )
                            }

                            Column(horizontalAlignment = Alignment.End) {
                                Text(
                                    text = "Settlement Payout",
                                    fontSize = 11.sp,
                                    color = TradigooTextSecondary
                                )
                                Text(
                                    text = "₹${order.totalAmount.toInt()}",
                                    fontSize = 17.sp,
                                    fontWeight = FontWeight.Black,
                                    color = TradigooEmeraldDark
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        // Dispatch Actions
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            if (order.status != "SHIPPED" && order.status != "DELIVERED") {
                                Button(
                                    onClick = { onUpdateStatus(order.id, "SHIPPED") },
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(10.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = TradigooBlue)
                                ) {
                                    Text("Dispatch Consignment", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                            }

                            if (order.status == "SHIPPED") {
                                Button(
                                    onClick = { onUpdateStatus(order.id, "DELIVERED") },
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(10.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = TradigooEmerald)
                                ) {
                                    Text("Mark Delivered (Verify QR)", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
}
