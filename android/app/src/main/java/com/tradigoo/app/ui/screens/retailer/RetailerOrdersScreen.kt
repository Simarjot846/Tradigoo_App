package com.tradigoo.app.ui.screens.retailer

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tradigoo.app.domain.model.Order
import com.tradigoo.app.ui.components.StatusBadge
import com.tradigoo.app.ui.components.formatInr
import com.tradigoo.app.ui.components.formatIsoDate
import com.tradigoo.app.ui.theme.*

@Composable
fun RetailerOrdersScreen(
    orders: List<Order>,
    isLoading: Boolean,
    isActionLoading: Boolean,
    onRefresh: () -> Unit,
    onExploreMarketplace: () -> Unit,
    onVerifyOtp: (String, String) -> Unit,
    onConfirmQuality: (String) -> Unit,
    onRaiseDispute: (String, String, Uri?) -> Unit
) {
    var otpTargetOrder by remember { mutableStateOf<Order?>(null) }
    var otpInput by remember { mutableStateOf("") }

    var disputeTargetOrder by remember { mutableStateOf<Order?>(null) }
    var disputeReason by remember { mutableStateOf("") }
    var selectedEvidenceUri by remember { mutableStateOf<Uri?>(null) }

    val evidencePicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        selectedEvidenceUri = uri
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(TradigooBackground)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(start = 16.dp, end = 12.dp, top = 14.dp, bottom = 10.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
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
            IconButton(onClick = onRefresh) {
                Icon(Icons.Default.Refresh, contentDescription = "Refresh orders", tint = TradigooNavy)
            }
        }

        if (isLoading && orders.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = TradigooNavy)
            }
        } else if (orders.isEmpty()) {
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
                        tint = TradigooTextTertiary,
                        modifier = Modifier.size(48.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "No orders placed yet",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = TradigooTextPrimary
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Explore wholesale products directly from verified suppliers.",
                        fontSize = 13.sp,
                        color = TradigooTextSecondary
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = onExploreMarketplace,
                        colors = ButtonDefaults.buttonColors(containerColor = TradigooNavy)
                    ) {
                        Text("Browse Marketplace")
                    }
                }
            }
        } else {
            LazyColumn(
                contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 4.dp, bottom = 92.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(orders, key = { it.id }) { order ->
                    val status = order.normalizedStatus()
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
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = "#${order.id.take(8).uppercase()}",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = TradigooTextSecondary
                                    )
                                    Text(
                                        text = formatIsoDate(order.createdAt),
                                        fontSize = 11.5.sp,
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

                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "Supplier: ${order.sellerBusinessName ?: "Supplier"}",
                                    fontSize = 13.sp,
                                    color = TradigooTextSecondary
                                )
                                if (order.sellerGstVerified) {
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Icon(
                                        imageVector = Icons.Default.VerifiedUser,
                                        contentDescription = "GST Verified",
                                        tint = TradigooEmerald,
                                        modifier = Modifier.size(14.dp)
                                    )
                                }
                            }

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
                                        text = "${formatInr(order.unitPrice)}/${order.unit}",
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
                                        text = formatInr(order.totalAmount),
                                        fontSize = 18.sp,
                                        fontWeight = FontWeight.Black,
                                        color = TradigooNavy
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            when (status) {
                                "payment_in_escrow", "payment_pending" -> {
                                    OrderNoticeBox(
                                        bg = TradigooNavyBg,
                                        textColor = TradigooNavy,
                                        text = buildString {
                                            append("Funds held in Tradigoo Escrow awaiting dispatch.")
                                            if (!order.otp.isNullOrBlank()) {
                                                append(" Delivery OTP: ${order.otp}")
                                            }
                                        }
                                    )
                                }
                                "shipped", "courier_verified", "delivered" -> {
                                    OrderNoticeBox(
                                        bg = TradigooGoldBg,
                                        textColor = TradigooNavy,
                                        text = buildString {
                                            append("Shipment in transit / arrived. Verify 6-digit OTP to start 24h inspection.")
                                            if (!order.otp.isNullOrBlank()) {
                                                append(" Your OTP: ${order.otp}")
                                            }
                                        }
                                    )
                                    Spacer(modifier = Modifier.height(10.dp))
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        Button(
                                            enabled = !isActionLoading,
                                            onClick = {
                                                otpInput = order.otp ?: ""
                                                otpTargetOrder = order
                                            },
                                            modifier = Modifier.weight(1f),
                                            shape = RoundedCornerShape(10.dp),
                                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 8.dp),
                                            colors = ButtonDefaults.buttonColors(containerColor = TradigooNavy)
                                        ) {
                                            Text("Verify OTP", fontSize = 12.sp, fontWeight = FontWeight.Bold, maxLines = 1, softWrap = false, overflow = TextOverflow.Ellipsis)
                                        }
                                        OutlinedButton(
                                            enabled = !isActionLoading,
                                            onClick = {
                                                disputeReason = ""
                                                selectedEvidenceUri = null
                                                disputeTargetOrder = order
                                            },
                                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp),
                                            shape = RoundedCornerShape(10.dp)
                                        ) {
                                            Text("Dispute", fontSize = 12.sp, color = StatusError, maxLines = 1, softWrap = false)
                                        }
                                    }
                                }
                                "inspection" -> {
                                    OrderNoticeBox(
                                        bg = TradigooAmberBg,
                                        textColor = TradigooAmber,
                                        text = buildString {
                                            append("OTP verified — inspect goods carefully before confirming.")
                                            if (!order.inspectionDeadline.isNullOrBlank()) {
                                                append(" Window ends: ${formatIsoDate(order.inspectionDeadline)}")
                                            }
                                        }
                                    )
                                    Spacer(modifier = Modifier.height(10.dp))
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        Button(
                                            enabled = !isActionLoading,
                                            onClick = { onConfirmQuality(order.id) },
                                            modifier = Modifier.weight(1f),
                                            shape = RoundedCornerShape(10.dp),
                                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 8.dp),
                                            colors = ButtonDefaults.buttonColors(containerColor = TradigooEmerald)
                                        ) {
                                            Text("Confirm Quality", fontSize = 12.sp, fontWeight = FontWeight.Bold, maxLines = 1, softWrap = false, overflow = TextOverflow.Ellipsis)
                                        }
                                        OutlinedButton(
                                            enabled = !isActionLoading,
                                            onClick = {
                                                disputeReason = ""
                                                selectedEvidenceUri = null
                                                disputeTargetOrder = order
                                            },
                                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp),
                                            shape = RoundedCornerShape(10.dp)
                                        ) {
                                            Text("Dispute", fontSize = 12.sp, color = StatusError, maxLines = 1, softWrap = false)
                                        }
                                    }
                                }
                                "disputed" -> {
                                    OrderNoticeBox(
                                        bg = StatusErrorBg,
                                        textColor = StatusError,
                                        text = "Dispute under Operations Review" +
                                            (order.disputeReason?.let { ": $it" } ?: ".")
                                    )
                                }
                                "completed" -> {
                                    OrderNoticeBox(
                                        bg = TradigooEmeraldBg,
                                        textColor = TradigooEmeraldDark,
                                        text = "Quality approved and escrow payout released to supplier."
                                    )
                                }
                                else -> {
                                    OrderNoticeBox(
                                        bg = TradigooSurfaceElevated,
                                        textColor = TradigooTextSecondary,
                                        text = "Order status: ${order.status}"
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // OTP Verification Dialog
    if (otpTargetOrder != null) {
        val target = otpTargetOrder!!
        AlertDialog(
            onDismissRequest = { otpTargetOrder = null },
            title = { Text("Verify Delivery OTP", fontWeight = FontWeight.Bold) },
            text = {
                Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
                    Text(
                        text = "Enter the 6-digit delivery OTP for ${target.productName} to begin your 24-hour inspection window.",
                        fontSize = 13.sp,
                        color = TradigooTextSecondary
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    OutlinedTextField(
                        value = otpInput,
                        onValueChange = { if (it.length <= 6 && it.all(Char::isDigit)) otpInput = it },
                        label = { Text("6-Digit OTP") },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    enabled = otpInput.length == 6 && !isActionLoading,
                    onClick = {
                        onVerifyOtp(target.id, otpInput)
                        otpTargetOrder = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = TradigooNavy)
                ) {
                    Text("Verify OTP")
                }
            },
            dismissButton = {
                TextButton(onClick = { otpTargetOrder = null }) { Text("Cancel") }
            }
        )
    }

    // Raise Dispute + Evidence Upload Dialog
    if (disputeTargetOrder != null) {
        val target = disputeTargetOrder!!
        AlertDialog(
            onDismissRequest = { disputeTargetOrder = null },
            title = { Text("Raise Escrow Dispute", fontWeight = FontWeight.Bold, color = StatusError) },
            text = {
                Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
                    Text(
                        text = "Describe the quality or quantity issue for ${target.productName}. Escrow stays frozen until Tradigoo Operations resolves your claim.",
                        fontSize = 12.5.sp,
                        color = TradigooTextSecondary
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    OutlinedTextField(
                        value = disputeReason,
                        onValueChange = { disputeReason = it },
                        label = { Text("Issue Details (min 10 chars)") },
                        minLines = 3,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    OutlinedButton(
                        onClick = { evidencePicker.launch("image/*") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.AttachFile, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = if (selectedEvidenceUri != null) "Photo Attached ✓" else "Attach Photo Evidence (Optional)",
                            fontSize = 12.5.sp
                        )
                    }
                }
            },
            confirmButton = {
                Button(
                    enabled = disputeReason.trim().length >= 10 && !isActionLoading,
                    onClick = {
                        onRaiseDispute(target.id, disputeReason, selectedEvidenceUri)
                        disputeTargetOrder = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = StatusError)
                ) {
                    Text("Submit Dispute", color = Color.White)
                }
            },
            dismissButton = {
                TextButton(onClick = { disputeTargetOrder = null }) { Text("Cancel") }
            }
        )
    }
}

@Composable
private fun OrderNoticeBox(
    bg: Color,
    textColor: Color,
    text: String
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(10.dp))
            .background(bg)
            .padding(horizontal = 12.dp, vertical = 9.dp)
    ) {
        Text(
            text = text,
            fontSize = 12.sp,
            color = textColor,
            lineHeight = 16.sp,
            fontWeight = FontWeight.Medium
        )
    }
}
