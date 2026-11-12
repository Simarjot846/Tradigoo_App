package com.tradigoo.app.ui.screens.founder

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tradigoo.app.data.api.ApiFounderStats
import com.tradigoo.app.data.local.SessionManager
import com.tradigoo.app.data.repository.AdminRepository
import com.tradigoo.app.domain.model.Resource
import com.tradigoo.app.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FounderDashboardScreen(
    onPreviewRetailer: () -> Unit,
    onPreviewWholesaler: () -> Unit,
    onOpenEmployeePortal: () -> Unit,
    onLogout: () -> Unit
) {
    val context = LocalContext.current
    val repository = remember { AdminRepository(context) }
    val sessionManager = remember { SessionManager.getInstance(context) }
    val currentUser = sessionManager.getUser()
    val coroutineScope = rememberCoroutineScope()

    var stats by remember { mutableStateOf<ApiFounderStats?>(null) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMsg by remember { mutableStateOf<String?>(null) }
    var selectedSection by remember { mutableStateOf("Overview") }

    fun loadStats() {
        isLoading = true
        errorMsg = null
        coroutineScope.launch {
            when (val res = repository.getFounderStats()) {
                is Resource.Success -> {
                    stats = res.data
                }
                is Resource.Error -> {
                    errorMsg = res.message
                }
                else -> {}
            }
            isLoading = false
        }
    }

    LaunchedEffect(Unit) {
        loadStats()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "Tradigoo Founder Console",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = TradigooTextPrimary
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(TradigooEmeraldBg)
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = "FOUNDER",
                                    color = TradigooEmeraldDark,
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                        Text(
                            text = "simarjotkaur514@gmail.com • System Oversight",
                            fontSize = 11.sp,
                            color = TradigooTextSecondary
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { loadStats() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh", tint = TradigooBlue)
                    }
                    IconButton(onClick = onLogout) {
                        Icon(Icons.Default.ExitToApp, contentDescription = "Sign Out", tint = TradigooError)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = TradigooSurface)
            )
        },
        containerColor = TradigooBackground
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Administrative Preview Banner
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = TradigooSurfaceElevated),
                    border = androidx.compose.foundation.BorderStroke(1.dp, TradigooBlue.copy(alpha = 0.3f))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Visibility, contentDescription = null, tint = TradigooBlue, modifier = Modifier.size(20.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Secure Administrative Previews",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = TradigooTextPrimary
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Inspect marketplace views with persistent Founder authorization and full audit logging.",
                            fontSize = 12.sp,
                            color = TradigooTextSecondary
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(
                                onClick = onPreviewRetailer,
                                colors = ButtonDefaults.buttonColors(containerColor = TradigooBlue),
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("Retailer View", fontSize = 12.sp)
                            }
                            Button(
                                onClick = onPreviewWholesaler,
                                colors = ButtonDefaults.buttonColors(containerColor = TradigooEmeraldDark),
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("Wholesaler View", fontSize = 12.sp)
                            }
                            Button(
                                onClick = onOpenEmployeePortal,
                                colors = ButtonDefaults.buttonColors(containerColor = TradigooWarning),
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("Ops Portal", fontSize = 12.sp)
                            }
                        }
                    }
                }
            }

            // Platform Health Bar
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(TradigooSurface)
                        .border(1.dp, TradigooCardBorder, RoundedCornerShape(12.dp))
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(10.dp)
                                .clip(CircleShape)
                                .background(TradigooEmerald)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Live Backend Services",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = TradigooTextPrimary
                        )
                    }
                    Text(
                        text = "TLS 1.3 • Supabase PostgreSQL • Gemini 2.5 Flash",
                        fontSize = 11.sp,
                        color = TradigooTextSecondary
                    )
                }
            }

            // Live Metrics Cards
            if (isLoading) {
                item {
                    Box(modifier = Modifier.fillMaxWidth().height(150.dp), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = TradigooBlue)
                    }
                }
            } else if (stats != null) {
                val s = stats!!
                item {
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text(
                            text = "Genuine Database Metrics",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = TradigooTextPrimary
                        )

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            FounderMetricCard(
                                title = "Gross GMV Volume",
                                value = "₹${s.platformTransactionVolume.toLong()}",
                                subtitle = "Total orders aggregate",
                                iconColor = TradigooEmeraldDark,
                                modifier = Modifier.weight(1f)
                            )
                            FounderMetricCard(
                                title = "Total Orders",
                                value = "${s.totalOrders}",
                                subtitle = "${s.pendingOrders} pending • ${s.completedOrders} completed",
                                iconColor = TradigooBlue,
                                modifier = Modifier.weight(1f)
                            )
                        }

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            FounderMetricCard(
                                title = "Registered Retailers",
                                value = "${s.totalRetailers}",
                                subtitle = "Active buyers in network",
                                iconColor = TradigooBlue,
                                modifier = Modifier.weight(1f)
                            )
                            FounderMetricCard(
                                title = "Registered Wholesalers",
                                value = "${s.totalWholesalers}",
                                subtitle = "${s.pendingSupplierVerification} pending GST verify",
                                iconColor = TradigooWarning,
                                modifier = Modifier.weight(1f)
                            )
                        }

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            FounderMetricCard(
                                title = "Active Products",
                                value = "${s.totalActiveProducts}",
                                subtitle = "Live wholesale catalog",
                                iconColor = TradigooEmeraldDark,
                                modifier = Modifier.weight(1f)
                            )
                            FounderMetricCard(
                                title = "Active Disputes",
                                value = "${s.pendingDisputes}",
                                subtitle = "Requiring investigation",
                                iconColor = if (s.pendingDisputes > 0) TradigooError else TradigooEmeraldDark,
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                }
            } else if (errorMsg != null) {
                item {
                    Text(
                        text = "Notice: $errorMsg",
                        color = TradigooError,
                        fontSize = 13.sp
                    )
                }
            }

            // Quick Platform Management Links
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = TradigooSurface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, TradigooCardBorder)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Platform Audit & Compliance",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = TradigooTextPrimary
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        AuditLogRow(label = "Primary Admin", value = "simarjotkaur514@gmail.com")
                        HorizontalDivider(modifier = Modifier.padding(vertical = 6.dp), color = TradigooCardBorder.copy(alpha = 0.5f))
                        AuditLogRow(label = "Operations Employee", value = "tradigoobackendemployee@gmail.com")
                        HorizontalDivider(modifier = Modifier.padding(vertical = 6.dp), color = TradigooCardBorder.copy(alpha = 0.5f))
                        AuditLogRow(label = "Database Host", value = "skcbzqbtjdctpxtgglbv.supabase.co")
                        HorizontalDivider(modifier = Modifier.padding(vertical = 6.dp), color = TradigooCardBorder.copy(alpha = 0.5f))
                        AuditLogRow(label = "Payment Gateway", value = "Razorpay Production / Test")
                    }
                }
            }
        }
    }
}

@Composable
private fun FounderMetricCard(
    title: String,
    value: String,
    subtitle: String,
    iconColor: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = TradigooSurface),
        border = androidx.compose.foundation.BorderStroke(1.dp, TradigooCardBorder)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(text = title, fontSize = 12.sp, color = TradigooTextSecondary)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = value, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = iconColor)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = subtitle, fontSize = 11.sp, color = TradigooTextTertiary)
        }
    }
}

@Composable
private fun AuditLogRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = label, fontSize = 12.sp, color = TradigooTextSecondary)
        Text(text = value, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TradigooTextPrimary)
    }
}
