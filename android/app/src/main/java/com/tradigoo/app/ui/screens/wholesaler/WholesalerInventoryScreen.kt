package com.tradigoo.app.ui.screens.wholesaler

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tradigoo.app.domain.model.Product
import com.tradigoo.app.ui.theme.*

@Composable
fun WholesalerInventoryScreen(
    inventory: List<Product>,
    onNavigateToAddProduct: () -> Unit,
    onDeleteProduct: (String) -> Unit
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
                    text = "Inventory Management",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = TradigooTextPrimary
                )
                Text(
                    text = "${inventory.size} active wholesale listings",
                    fontSize = 13.sp,
                    color = TradigooTextSecondary
                )
            }

            Button(
                onClick = onNavigateToAddProduct,
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(containerColor = TradigooEmerald)
            ) {
                Icon(imageVector = Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Add SKU", fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        if (inventory.isEmpty()) {
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
                        text = "No listings in catalog",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = TradigooTextPrimary
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Publish bulk commodities to make them discoverable to verified retailers nationwide.",
                        fontSize = 13.sp,
                        color = TradigooTextSecondary,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = onNavigateToAddProduct,
                        colors = ButtonDefaults.buttonColors(containerColor = TradigooEmerald)
                    ) {
                        Text("Add First SKU")
                    }
                }
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(inventory) { product ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = TradigooSurface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, TradigooCardBorder)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(modifier = Modifier.weight(1f), verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(44.dp)
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(TradigooEmeraldBg),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(text = "📦", fontSize = 20.sp)
                                }
                                Spacer(modifier = Modifier.width(12.dp))
                                Column {
                                    Text(
                                        text = product.name,
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = TradigooTextPrimary
                                    )
                                    Text(
                                        text = "${product.category} • MOQ: ${product.minOrderQuantity} ${product.unit}",
                                        fontSize = 12.sp,
                                        color = TradigooTextSecondary
                                    )
                                }
                            }

                            IconButton(
                                onClick = { onDeleteProduct(product.id) },
                                modifier = Modifier.size(32.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Delete,
                                    contentDescription = "Delete",
                                    tint = StatusError,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))
                        HorizontalDivider(color = TradigooCardBorder.copy(alpha = 0.5f))
                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Wholesale Price: ₹${product.basePrice}/${product.unit}",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = TradigooEmeraldDark
                            )

                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(TradigooEmeraldBg)
                                    .padding(horizontal = 8.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = "Active in Catalog",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold,
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
}
