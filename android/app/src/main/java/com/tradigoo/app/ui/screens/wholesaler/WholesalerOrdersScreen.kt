package com.tradigoo.app.ui.screens.wholesaler

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tradigoo.app.domain.model.Order
import com.tradigoo.app.ui.components.StatusBadge
import com.tradigoo.app.ui.components.formatInr
import com.tradigoo.app.ui.components.formatIsoDate
import com.tradigoo.app.ui.theme.*

@Composable
fun WholesalerOrdersScreen(
    orders: List<Order>,
    isActionLoading: Boolean = false,
    onRefresh: () -> Unit = {},
    onUpdateStatus: (String, String) -> Unit
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
                    text = "Received Purchase Orders",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = TradigooTextPrimary
                )
                Text(
                    text = "${orders.size} retailer bookings in fulfillment pipeline",
                    fontSize = 13.sp,
                    color = TradigooTextSecondary
                )
            }

            IconButton(onClick = onRefresh) {
                Icon(Icons.Default.Refresh, contentDescription = "Refresh orders", tint = TradigooNavy)
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        if (orders.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Default.ReceiptLong,
                        contentDescription = null,
                        tint = TradigooNavy.copy(alpha = 0.45f),
                        modifier = Modifier.size(52.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "No purchase orders yet",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = TradigooTextPrimary
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "When retailers book your wholesale listings, escrow-protected orders will appear here.",
                        fontSize = 13.sp,
                        color = TradigooTextSecondary,
                        textAlign = TextAlign.Center
                    )
                }
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(14.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(orders, key = { it.id }) { order ->
                    val status = order.normalizedStatus()
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(18.dp),
                        colors = CardDefaults.cardColors(containerColor = TradigooSurface),
                        border = BorderStroke(1.dp, TradigooCardBorder)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(
                                        text = "Order #${order.id.take(8).uppercase()}",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = TradigooNavy
                                    )
                                    Text(
                                        text = "Booked: ${formatIsoDate(order.createdAt)}",
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
                                text = "Buyer: ${order.buyerBusinessName?.takeIf { it.isNotBlank() } ?: "Registered Retailer"}" +
                                    (order.buyerLocation?.takeIf { it.isNotBlank() }?.let { " • $it" } ?: ""),
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
                                        text = "${order.quantity} ${order.unit} @ ${formatInr(order.unitPrice)}",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = TradigooTextPrimary
                                    )
                                }

                                Column(horizontalAlignment = Alignment.End) {
                                    Text(
                                        text = "Order Value",
                                        fontSize = 11.sp,
                                        color = TradigooTextSecondary
                                    )
                                    Text(
                                        text = formatInr(order.totalAmount),
                                        fontSize = 17.sp,
                                        fontWeight = FontWeight.Black,
                                        color = TradigooNavy
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            when (status) {
                                "payment_pending", "payment_in_escrow" -> {
                                    Button(
                                        enabled = !isActionLoading,
                                        onClick = { onUpdateStatus(order.id, "shipped") },
                                        modifier = Modifier.fillMaxWidth(),
                                        shape = RoundedCornerShape(10.dp),
                                        colors = ButtonDefaults.buttonColors(containerColor = TradigooNavy)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.LocalShipping,
                                            contentDescription = null,
                                            modifier = Modifier.size(16.dp)
                                        )
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text("Mark Dispatched", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                    }
                                }
                                "shipped", "courier_verified" -> {
                                    Button(
                                        enabled = !isActionLoading,
                                        onClick = { onUpdateStatus(order.id, "delivered") },
                                        modifier = Modifier.fillMaxWidth(),
                                        shape = RoundedCornerShape(10.dp),
                                        colors = ButtonDefaults.buttonColors(containerColor = TradigooEmeraldDark)
                                    ) {
                                        Text("Mark Delivered (Await Buyer OTP)", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                    }
                                }
                                "delivered" -> {
                                    Text(
                                        text = "Awaiting buyer delivery OTP verification to start 24h inspection.",
                                        fontSize = 12.sp,
                                        color = TradigooBlue,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                                "inspection" -> {
                                    Text(
                                        text = "Buyer 24h inspection window active. Payout releases automatically on quality confirmation.",
                                        fontSize = 12.sp,
                                        color = TradigooAmber,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                                "completed" -> {
                                    Text(
                                        text = "Escrow settled and order completed.",
                                        fontSize = 12.sp,
                                        color = TradigooEmeraldDark,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                }
                                "disputed" -> {
                                    Text(
                                        text = "Dispute under review${order.disputeReason?.let { ": $it" } ?: "."}",
                                        fontSize = 12.sp,
                                        color = StatusError,
                                        fontWeight = FontWeight.Medium
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
