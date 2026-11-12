package com.tradigoo.app.ui.screens.retailer

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tradigoo.app.domain.model.Product
import com.tradigoo.app.ui.components.TradigooTextField
import com.tradigoo.app.ui.theme.*

@Composable
fun RetailerMarketplaceScreen(
    products: List<Product>,
    selectedCategory: String,
    searchQuery: String,
    onCategorySelected: (String) -> Unit,
    onSearchChanged: (String) -> Unit,
    onAddToCart: (Product, Int) -> Unit
) {
    val categories = listOf("All", "Grains", "Pulses", "Oils", "Spices", "Sweeteners", "Flours", "Beverages")

    var selectedProductForOrder by remember { mutableStateOf<Product?>(null) }
    var orderQuantity by remember { mutableStateOf(50) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(TradigooBackground)
            .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        // Search bar
        TradigooTextField(
            value = searchQuery,
            onValueChange = onSearchChanged,
            label = "SEARCH PRODUCTS & SUPPLIERS",
            placeholder = "Search wheat, rice, mustard oil, spices...",
            leadingIcon = Icons.Default.Search
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Categories chip row
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            items(categories) { category ->
                val isSelected = selectedCategory.equals(category, ignoreCase = true)
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(if (isSelected) TradigooBlue else TradigooSurface)
                        .border(
                            1.dp,
                            if (isSelected) TradigooBlue else TradigooCardBorder,
                            RoundedCornerShape(20.dp)
                        )
                        .clickable { onCategorySelected(category) }
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    Text(
                        text = category,
                        fontSize = 13.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        color = if (isSelected) Color.White else TradigooTextPrimary
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Results count
        Text(
            text = "${products.size} Wholesale Products Available",
            fontSize = 13.sp,
            fontWeight = FontWeight.SemiBold,
            color = TradigooTextSecondary,
            modifier = Modifier.padding(start = 2.dp, bottom = 8.dp)
        )

        if (products.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(text = "🔍", fontSize = 48.sp)
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "No Products Found",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = TradigooTextPrimary
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = if (searchQuery.isNotBlank()) "No matching wholesale commodities for \"$searchQuery\"." else "No wholesale listings in this category yet.",
                        fontSize = 13.sp,
                        color = TradigooTextSecondary,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                }
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(products) { product ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = TradigooSurface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, TradigooCardBorder)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.Top,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(modifier = Modifier.weight(1f)) {
                                Box(
                                    modifier = Modifier
                                        .size(54.dp)
                                        .clip(RoundedCornerShape(14.dp))
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
                                        fontSize = 26.sp
                                    )
                                }

                                Spacer(modifier = Modifier.width(12.dp))

                                Column {
                                    Text(
                                        text = product.name,
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = TradigooTextPrimary
                                    )
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(
                                        text = "Category: ${product.category}",
                                        fontSize = 12.sp,
                                        color = TradigooTextSecondary
                                    )
                                }
                            }

                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(TradigooEmeraldBg)
                                    .padding(horizontal = 8.dp, vertical = 3.dp)
                            ) {
                                Text(
                                    text = "Margin: +${product.expectedMargin}%",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TradigooEmeraldDark
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(
                            text = product.description,
                            fontSize = 13.sp,
                            lineHeight = 18.sp,
                            color = TradigooTextSecondary
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        HorizontalDivider(color = TradigooCardBorder.copy(alpha = 0.6f))

                        Spacer(modifier = Modifier.height(12.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Row(verticalAlignment = Alignment.Bottom) {
                                    Text(
                                        text = "₹${product.basePrice}",
                                        fontSize = 20.sp,
                                        fontWeight = FontWeight.Black,
                                        color = TradigooTextPrimary
                                    )
                                    Text(
                                        text = "/${product.unit}",
                                        fontSize = 13.sp,
                                        color = TradigooTextSecondary,
                                        modifier = Modifier.padding(bottom = 2.dp, start = 2.dp)
                                    )
                                }
                                Text(
                                    text = "Min Order Quantity: ${product.minOrderQuantity} ${product.unit}",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = TradigooTextSecondary
                                )
                            }

                            Button(
                                onClick = {
                                    selectedProductForOrder = product
                                    orderQuantity = product.minOrderQuantity
                                },
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = TradigooBlue)
                            ) {
                                Icon(imageVector = Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(text = "Add to Cart", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}

    // Add to Cart Modal Dialog
    if (selectedProductForOrder != null) {
        val prod = selectedProductForOrder!!
        AlertDialog(
            onDismissRequest = { selectedProductForOrder = null },
            title = {
                Text(text = "Source ${prod.name}", fontWeight = FontWeight.Bold, fontSize = 17.sp)
            },
            text = {
                Column {
                    Text(
                        text = "Wholesale Base Price: ₹${prod.basePrice}/${prod.unit}",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = TradigooBlue
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(text = "Select Quantity (${prod.unit}):", fontSize = 13.sp, color = TradigooTextSecondary)
                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        OutlinedButton(
                            onClick = {
                                if (orderQuantity > prod.minOrderQuantity) orderQuantity -= 10
                            },
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("-10")
                        }

                        Spacer(modifier = Modifier.width(16.dp))

                        Text(
                            text = "$orderQuantity ${prod.unit}",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = TradigooTextPrimary
                        )

                        Spacer(modifier = Modifier.width(16.dp))

                        OutlinedButton(
                            onClick = { orderQuantity += 10 },
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("+10")
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .background(TradigooBackground)
                            .padding(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(text = "Estimated Cost:", fontSize = 13.sp, color = TradigooTextSecondary)
                            Text(
                                text = "₹${(orderQuantity * prod.basePrice).toInt()}",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = TradigooTextPrimary
                            )
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        onAddToCart(prod, orderQuantity)
                        selectedProductForOrder = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = TradigooBlue)
                ) {
                    Text("Confirm & Add")
                }
            },
            dismissButton = {
                TextButton(onClick = { selectedProductForOrder = null }) {
                    Text("Cancel")
                }
            }
        )
    }
}
