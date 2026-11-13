package com.tradigoo.app.ui.screens.retailer

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.VerifiedUser
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
import com.tradigoo.app.ui.components.ProductThumbnail
import com.tradigoo.app.ui.components.formatInr
import com.tradigoo.app.ui.theme.*

@Composable
fun RetailerHomeScreen(
    user: User?,
    trustScore: ApiTrustScoreResponse?,
    products: List<Product>,
    orders: List<Order>,
    isLoading: Boolean,
    onRefresh: () -> Unit,
    onCategorySelected: (String) -> Unit,
    onNavigateToDiscover: () -> Unit,
    onNavigateToOrders: () -> Unit,
    onAddToCart: (Product) -> Unit
) {
    val scrollState = rememberScrollState()

    val activeEscrowOrders = orders.count {
        val s = it.normalizedStatus()
        s == "payment_in_escrow" || s == "shipped" || s == "courier_verified" || s == "delivered" || s == "inspection"
    }
    val completedOrdersCount = orders.count { it.normalizedStatus() == "completed" }
    val disputedOrdersCount = orders.count { it.normalizedStatus() == "disputed" }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(TradigooBackground)
            .verticalScroll(scrollState)
            .padding(16.dp)
    ) {
        // Store Dashboard Banner (Deep Navy & Gold)
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
                            text = "RETAIL SOURCING DESK",
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
                                Text(
                                    text = "Escrow Protected",
                                    color = Color.White,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                            Spacer(modifier = Modifier.width(6.dp))
                            IconButton(
                                onClick = onRefresh,
                                modifier = Modifier.size(28.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Refresh,
                                    contentDescription = "Refresh",
                                    tint = TradigooGoldLight,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = user?.businessName?.takeIf { it.isNotBlank() }
                            ?: user?.name?.takeIf { it.isNotBlank() }
                            ?: "Retail Partner",
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
                            text = "${user?.location?.takeIf { it.isNotBlank() } ?: "India"} • Registered Retailer",
                            fontSize = 13.sp,
                            color = Color.White.copy(alpha = 0.88f)
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color.Black.copy(alpha = 0.25f))
                            .clickable { onNavigateToOrders() }
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(text = "Active Escrow", fontSize = 10.5.sp, color = Color.White.copy(alpha = 0.7f), maxLines = 1, overflow = TextOverflow.Ellipsis)
                            Text(
                                text = "$activeEscrowOrders Orders",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                        Column(modifier = Modifier.weight(1f)) {
                            Text(text = "Completed", fontSize = 10.5.sp, color = Color.White.copy(alpha = 0.7f), maxLines = 1, overflow = TextOverflow.Ellipsis)
                            Text(
                                text = "$completedOrdersCount",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = TradigooEmeraldLight,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                        Column(modifier = Modifier.weight(1f)) {
                            Text(text = "Disputes", fontSize = 10.5.sp, color = Color.White.copy(alpha = 0.7f), maxLines = 1, overflow = TextOverflow.Ellipsis)
                            Text(
                                text = "$disputedOrdersCount",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (disputedOrdersCount > 0) Color(0xFFFCA5A5) else Color.White,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Live Trust Rating Card
        val hasTrustData = trustScore?.hasEnoughData ?: ((user?.totalOrders ?: 0) >= 3)
        GreenScoreMeter(
            score = trustScore?.score ?: if (hasTrustData) user?.trustScore else null,
            hasEnoughData = hasTrustData,
            badgeText = trustScore?.label,
            subtitleText = trustScore?.explanation,
            label = "Retailer Trust & Reliability Rating"
        )

        Spacer(modifier = Modifier.height(22.dp))

        // Categories Section
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Wholesale Categories",
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                color = TradigooTextPrimary
            )
            Text(
                text = "View All →",
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                color = TradigooGoldDark,
                modifier = Modifier.clickable { onNavigateToDiscover() }
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        val categories = listOf("Grains", "Pulses", "Oils", "Spices", "Sweeteners", "Flours", "Beverages", "Electronics", "Fashion")
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(categories) { cat ->
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(TradigooSurface)
                        .border(1.dp, TradigooCardBorder, RoundedCornerShape(12.dp))
                        .clickable { onCategorySelected(cat) }
                        .padding(horizontal = 16.dp, vertical = 10.dp)
                ) {
                    Text(
                        text = cat,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = TradigooNavy
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Live Catalog Picks
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Featured Wholesale Listings",
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                color = TradigooTextPrimary
            )
            Text(
                text = "Marketplace",
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                color = TradigooGoldDark,
                modifier = Modifier.clickable { onNavigateToDiscover() }
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        if (isLoading && products.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = TradigooNavy)
            }
        } else if (products.isEmpty()) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = TradigooSurface),
                border = androidx.compose.foundation.BorderStroke(1.dp, TradigooCardBorder)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "No Active Listings Available",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = TradigooTextPrimary
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Refresh or browse the marketplace to check newly added supplier listings.",
                        fontSize = 12.sp,
                        color = TradigooTextSecondary,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(
                        onClick = onRefresh,
                        colors = ButtonDefaults.buttonColors(containerColor = TradigooNavy)
                    ) {
                        Text("Refresh Catalog")
                    }
                }
            }
        } else {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                products.take(5).forEach { product ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onNavigateToDiscover() },
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = TradigooSurface),
                        border = androidx.compose.foundation.BorderStroke(1.dp, TradigooCardBorder)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            ProductThumbnail(
                                imageUrl = product.imageUrl,
                                contentDescription = product.name,
                                size = 56.dp
                            )

                            Spacer(modifier = Modifier.width(12.dp))

                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = product.name,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TradigooTextPrimary,
                                    maxLines = 1
                                )
                                if (!product.sellerBusinessName.isNullOrBlank()) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(
                                            text = product.sellerBusinessName,
                                            fontSize = 11.5.sp,
                                            color = TradigooTextSecondary,
                                            maxLines = 1
                                        )
                                        if (product.sellerGstVerified) {
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Icon(
                                                imageVector = Icons.Default.VerifiedUser,
                                                contentDescription = "GST Verified",
                                                tint = TradigooEmerald,
                                                modifier = Modifier.size(13.dp)
                                            )
                                        }
                                    }
                                }
                                Spacer(modifier = Modifier.height(3.dp))
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = "${formatInr(product.basePrice)}/${product.unit}",
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = TradigooNavy
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "MOQ: ${product.minOrderQuantity} ${product.unit}",
                                        fontSize = 11.5.sp,
                                        color = TradigooTextSecondary
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.width(8.dp))

                            Button(
                                onClick = { onAddToCart(product) },
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = TradigooNavy),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                            ) {
                                Text(text = "Source", fontSize = 12.sp, fontWeight = FontWeight.Bold, maxLines = 1, softWrap = false)
                            }
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(88.dp))
    }
}
