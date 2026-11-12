package com.tradigoo.app.ui.screens.retailer

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tradigoo.app.domain.model.CartItem
import com.tradigoo.app.ui.components.TradigooGradientButton
import com.tradigoo.app.ui.theme.*

@Composable
fun RetailerCartScreen(
    cartItems: List<CartItem>,
    onUpdateQuantity: (String, Int) -> Unit,
    onRemoveItem: (String) -> Unit,
    onCheckout: () -> Unit,
    onExploreProducts: () -> Unit
) {
    val subtotal = cartItems.sumOf { it.totalPrice }
    val gst = subtotal * 0.18
    val total = subtotal + gst

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(TradigooBackground)
            .padding(16.dp)
    ) {
        Text(
            text = "Wholesale Purchase Cart",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = TradigooTextPrimary
        )
        Text(
            text = "${cartItems.size} items staged for escrow checkout",
            fontSize = 13.sp,
            color = TradigooTextSecondary
        )

        Spacer(modifier = Modifier.height(16.dp))

        if (cartItems.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(text = "🛒", fontSize = 48.sp)
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Your cart is empty",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = TradigooTextPrimary
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Browse wholesale products from certified suppliers across India.",
                        fontSize = 13.sp,
                        color = TradigooTextSecondary
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = onExploreProducts,
                        colors = ButtonDefaults.buttonColors(containerColor = TradigooBlue)
                    ) {
                        Text("Add Wholesale Stock")
                    }
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(cartItems) { item ->
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
                                Text(
                                    text = item.productName,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TradigooTextPrimary,
                                    modifier = Modifier.weight(1f)
                                )
                                IconButton(
                                    onClick = { onRemoveItem(item.id) },
                                    modifier = Modifier.size(28.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Delete,
                                        contentDescription = "Remove",
                                        tint = StatusError,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(6.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "₹${item.basePrice}/${item.unit}",
                                    fontSize = 13.sp,
                                    color = TradigooTextSecondary
                                )

                                // Quantity Stepper
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(TradigooBackground)
                                        .border(1.dp, TradigooCardBorder, RoundedCornerShape(8.dp))
                                        .padding(horizontal = 4.dp, vertical = 2.dp)
                                ) {
                                    TextButton(
                                        onClick = { onUpdateQuantity(item.id, item.quantity - 10) },
                                        contentPadding = PaddingValues(0.dp),
                                        modifier = Modifier.size(28.dp)
                                    ) {
                                        Text("-", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = TradigooTextPrimary)
                                    }

                                    Text(
                                        text = "${item.quantity} ${item.unit}",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = TradigooTextPrimary,
                                        modifier = Modifier.padding(horizontal = 8.dp)
                                    )

                                    TextButton(
                                        onClick = { onUpdateQuantity(item.id, item.quantity + 10) },
                                        contentPadding = PaddingValues(0.dp),
                                        modifier = Modifier.size(28.dp)
                                    ) {
                                        Text("+", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = TradigooTextPrimary)
                                    }
                                }

                                Text(
                                    text = "₹${item.totalPrice.toInt()}",
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TradigooBlue
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Pricing Summary & Escrow Box
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = TradigooSurface),
                border = androidx.compose.foundation.BorderStroke(1.dp, TradigooCardBorder)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Subtotal", fontSize = 13.sp, color = TradigooTextSecondary)
                        Text(text = "₹${subtotal.toInt()}", fontSize = 13.sp, color = TradigooTextPrimary, fontWeight = FontWeight.Medium)
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "GST (18% input credit)", fontSize = 13.sp, color = TradigooTextSecondary)
                        Text(text = "₹${gst.toInt()}", fontSize = 13.sp, color = TradigooTextPrimary, fontWeight = FontWeight.Medium)
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Buyer Platform Fee", fontSize = 13.sp, color = TradigooTextSecondary)
                        Text(text = "FREE (₹0)", fontSize = 13.sp, color = TradigooEmerald, fontWeight = FontWeight.Bold)
                    }

                    Spacer(modifier = Modifier.height(10.dp))
                    HorizontalDivider(color = TradigooCardBorder)
                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "Total Payable (Escrow)", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = TradigooTextPrimary)
                        Text(text = "₹${total.toInt()}", fontSize = 20.sp, fontWeight = FontWeight.Black, color = TradigooBlue)
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Escrow Safety Guarantee Box
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(TradigooEmeraldBg)
                    .padding(12.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Shield,
                        contentDescription = null,
                        tint = TradigooEmerald,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "100% Escrow Protection: Funds released to wholesaler only after you inspect and accept the consignment.",
                        fontSize = 11.5.sp,
                        color = TradigooEmeraldDark,
                        lineHeight = 16.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            TradigooGradientButton(
                text = "Place Order in Escrow (₹${total.toInt()})",
                onClick = onCheckout
            )
        }
    }
}
