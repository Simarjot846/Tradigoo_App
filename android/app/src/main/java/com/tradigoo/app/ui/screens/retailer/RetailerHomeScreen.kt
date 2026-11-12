package com.tradigoo.app.ui.screens.retailer

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
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
import com.tradigoo.app.domain.model.Product
import com.tradigoo.app.domain.model.User
import com.tradigoo.app.ui.components.GreenScoreMeter
import com.tradigoo.app.ui.components.StatusBadge
import com.tradigoo.app.ui.theme.*

@Composable
fun RetailerHomeScreen(
    user: User?,
    products: List<Product>,
    onNavigateToDiscover: () -> Unit,
    onNavigateToOrders: () -> Unit,
    onAddToCart: (Product) -> Unit
) {
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(TradigooBackground)
            .verticalScroll(scrollState)
            .padding(16.dp)
    ) {
        // Welcome Card
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
                            listOf(Color(0xFF1E3A8A), Color(0xFF3B82F6))
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
                            text = "STORE DASHBOARD",
                            color = Color.White.copy(alpha = 0.8f),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp
                        )

                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(Color.White.copy(alpha = 0.2f))
                                .padding(horizontal = 8.dp, vertical = 3.dp)
                        ) {
                            Text(
                                text = "Zero Buyer Fees",
                                color = Color.White,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = user?.businessName ?: "Gupta Kirana Store",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = "📍 ${user?.location ?: "Jaipur, Rajasthan"} • Verified Retailer",
                        fontSize = 13.sp,
                        color = Color.White.copy(alpha = 0.9f)
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // Quick Stats Bar
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color.Black.copy(alpha = 0.25f))
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(text = "Escrow Orders", fontSize = 11.sp, color = Color.White.copy(alpha = 0.7f))
                            Text(text = "3 Active", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        }
                        Column {
                            Text(text = "Avg Margins", fontSize = 11.sp, color = Color.White.copy(alpha = 0.7f))
                            Text(text = "18.4%", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = TradigooEmeraldLight)
                        }
                        Column {
                            Text(text = "Disputes", fontSize = 11.sp, color = Color.White.copy(alpha = 0.7f))
                            Text(text = "0 Defaults", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Live Market Ticker Card
        Card(
            modifier = Modifier.fillMaxWidth(),
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
                Box(
                    modifier = Modifier
                        .size(10.dp)
                        .clip(CircleShape)
                        .background(TradigooEmerald)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "LIVE COMMODITY INDEX: ",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = TradigooTextPrimary
                )
                Text(
                    text = "Wheat ₹36.50 (+1.2%) • Toor Dal ₹145 (-0.8%) • Mustard Oil ₹138 (Stable)",
                    fontSize = 11.sp,
                    color = TradigooTextSecondary,
                    maxLines = 1
                )
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Green Score Widget
        GreenScoreMeter(
            score = user?.trustScore ?: 520,
            label = "Retailer Trust & Reliability Rating"
        )

        Spacer(modifier = Modifier.height(22.dp))

        // Section: Top Sourcing Categories
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
                color = TradigooBlue,
                modifier = Modifier.clickable { onNavigateToDiscover() }
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        val categories = listOf("Grains", "Pulses", "Oils", "Spices", "Sweeteners", "Flours", "Beverages")
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(categories) { cat ->
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(TradigooSurface)
                        .border(1.dp, TradigooCardBorder, RoundedCornerShape(12.dp))
                        .clickable { onNavigateToDiscover() }
                        .padding(horizontal = 16.dp, vertical = 10.dp)
                ) {
                    Text(
                        text = cat,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = TradigooTextPrimary
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Section: High Margin Recommendations
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "High-Margin Recommendations",
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                color = TradigooTextPrimary
            )
            Text(
                text = "Marketplace",
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                color = TradigooBlue,
                modifier = Modifier.clickable { onNavigateToDiscover() }
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        if (products.isEmpty()) {
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
                    Text(text = "🌾", fontSize = 32.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Connecting to Wholesale Catalog",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = TradigooTextPrimary
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Wholesale commodities are loaded live from verified suppliers.",
                        fontSize = 12.sp,
                        color = TradigooTextSecondary,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(
                        onClick = onNavigateToDiscover,
                        colors = ButtonDefaults.buttonColors(containerColor = TradigooBlue)
                    ) {
                        Text("Explore Marketplace")
                    }
                }
            }
        } else {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                products.take(4).forEach { product ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
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
                        Box(
                            modifier = Modifier
                                .size(50.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(TradigooBlueBg),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = when (product.category) {
                                    "Grains" -> "🌾"
                                    "Pulses" -> "🫘"
                                    "Oils" -> "🛢️"
                                    "Spices" -> "🌶️"
                                    "Sweeteners" -> "🍯"
                                    "Flours" -> "🥣"
                                    else -> "📦"
                                },
                                fontSize = 24.sp
                            )
                        }

                        Spacer(modifier = Modifier.width(14.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = product.name,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = TradigooTextPrimary,
                                maxLines = 1
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "₹${product.basePrice}/${product.unit}",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TradigooBlue
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "MOQ: ${product.minOrderQuantity} ${product.unit}",
                                    fontSize = 12.sp,
                                    color = TradigooTextSecondary
                                )
                            }
                            Text(
                                text = "Est. Margin: +${product.expectedMargin}%",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = TradigooEmerald
                            )
                        }

                        Button(
                            onClick = { onAddToCart(product) },
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = TradigooBlue),
                            contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                        ) {
                            Text(text = "Source", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}
}
