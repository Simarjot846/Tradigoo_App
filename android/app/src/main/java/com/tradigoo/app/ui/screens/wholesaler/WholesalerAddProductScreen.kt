package com.tradigoo.app.ui.screens.wholesaler

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tradigoo.app.ui.components.TradigooGradientButton
import com.tradigoo.app.ui.components.TradigooTextField
import com.tradigoo.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WholesalerAddProductScreen(
    onProductPublished: (String, String, Double, String, Int, String) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("Grains") }
    var basePrice by remember { mutableStateOf("") }
    var selectedUnit by remember { mutableStateOf("kg") }
    var minOrderQuantity by remember { mutableStateOf("100") }
    var description by remember { mutableStateOf("") }

    var categoryDropdownExpanded by remember { mutableStateOf(false) }
    var unitDropdownExpanded by remember { mutableStateOf(false) }

    var successMessage by remember { mutableStateOf<String?>(null) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    val categories = listOf("Grains", "Pulses", "Oils", "Spices", "Sweeteners", "Flours", "Beverages")
    val units = listOf("kg", "ltr", "ton", "box", "quintal")

    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(TradigooBackground)
            .verticalScroll(scrollState)
            .padding(16.dp)
    ) {
        Text(
            text = "List New Wholesale Product",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = TradigooTextPrimary
        )

        Spacer(modifier = Modifier.height(4.dp))

        Text(
            text = "Publish bulk commodities to thousands of verified Indian retailers.",
            fontSize = 13.sp,
            color = TradigooTextSecondary
        )

        Spacer(modifier = Modifier.height(18.dp))

        if (successMessage != null) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(TradigooEmeraldBg)
                    .padding(14.dp)
            ) {
                Text(
                    text = "✅ $successMessage",
                    color = TradigooEmeraldDark,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold
                )
            }
            Spacer(modifier = Modifier.height(14.dp))
        }

        if (errorMessage != null) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(StatusErrorBg)
                    .padding(14.dp)
            ) {
                Text(
                    text = "⚠️ $errorMessage",
                    color = StatusError,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium
                )
            }
            Spacer(modifier = Modifier.height(14.dp))
        }

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(containerColor = TradigooSurface),
            border = androidx.compose.foundation.BorderStroke(1.dp, TradigooCardBorder)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                // Product Name
                TradigooTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = "PRODUCT NAME",
                    placeholder = "e.g., Premium Sortex Sharbati Wheat"
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Category Dropdown
                Text(
                    text = "CATEGORY",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = TradigooTextSecondary,
                    modifier = Modifier.padding(bottom = 6.dp)
                )

                ExposedDropdownMenuBox(
                    expanded = categoryDropdownExpanded,
                    onExpandedChange = { categoryDropdownExpanded = !categoryDropdownExpanded }
                ) {
                    OutlinedTextField(
                        value = selectedCategory,
                        onValueChange = {},
                        readOnly = true,
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = categoryDropdownExpanded) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor(),
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = TradigooSurface,
                            unfocusedContainerColor = TradigooSurface,
                            focusedBorderColor = TradigooEmerald,
                            unfocusedBorderColor = TradigooCardBorder
                        )
                    )

                    ExposedDropdownMenu(
                        expanded = categoryDropdownExpanded,
                        onDismissRequest = { categoryDropdownExpanded = false }
                    ) {
                        categories.forEach { cat ->
                            DropdownMenuItem(
                                text = { Text(cat) },
                                onClick = {
                                    selectedCategory = cat
                                    categoryDropdownExpanded = false
                                }
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Pricing and Unit row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Column(modifier = Modifier.weight(1.5f)) {
                        TradigooTextField(
                            value = basePrice,
                            onValueChange = { basePrice = it },
                            label = "BASE PRICE (₹)",
                            placeholder = "36.50",
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal)
                        )
                    }

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "UNIT",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = TradigooTextSecondary,
                            modifier = Modifier.padding(bottom = 6.dp)
                        )

                        ExposedDropdownMenuBox(
                            expanded = unitDropdownExpanded,
                            onExpandedChange = { unitDropdownExpanded = !unitDropdownExpanded }
                        ) {
                            OutlinedTextField(
                                value = selectedUnit,
                                onValueChange = {},
                                readOnly = true,
                                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = unitDropdownExpanded) },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .menuAnchor(),
                                shape = RoundedCornerShape(12.dp),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedContainerColor = TradigooSurface,
                                    unfocusedContainerColor = TradigooSurface,
                                    focusedBorderColor = TradigooEmerald,
                                    unfocusedBorderColor = TradigooCardBorder
                                )
                            )

                            ExposedDropdownMenu(
                                expanded = unitDropdownExpanded,
                                onDismissRequest = { unitDropdownExpanded = false }
                            ) {
                                units.forEach { u ->
                                    DropdownMenuItem(
                                        text = { Text(u) },
                                        onClick = {
                                            selectedUnit = u
                                            unitDropdownExpanded = false
                                        }
                                    )
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Minimum Order Quantity (MOQ)
                TradigooTextField(
                    value = minOrderQuantity,
                    onValueChange = { minOrderQuantity = it },
                    label = "MINIMUM ORDER QUANTITY (MOQ)",
                    placeholder = "100",
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Description
                TradigooTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = "SPECIFICATIONS & ORIGIN",
                    placeholder = "e.g., Farm fresh Madhya Pradesh harvest, double cleaned, airtight 50kg gunny bags.",
                    singleLine = false,
                    maxLines = 3
                )

                Spacer(modifier = Modifier.height(22.dp))

                // Publish CTA
                TradigooGradientButton(
                    text = "Publish Listing to Network",
                    gradient = TradigooEmeraldGradient,
                    onClick = {
                        val priceNum = basePrice.toDoubleOrNull()
                        val moqNum = minOrderQuantity.toIntOrNull()

                        if (name.isBlank() || priceNum == null || priceNum <= 0 || moqNum == null || moqNum <= 0) {
                            errorMessage = "Please enter a valid product name, price and MOQ."
                        } else {
                            errorMessage = null
                            onProductPublished(
                                name,
                                selectedCategory,
                                priceNum,
                                selectedUnit,
                                moqNum,
                                description.ifBlank { "Direct wholesale farm stock." }
                            )
                            successMessage = "Listing created! '$name' is now live on Tradigoo."
                            name = ""
                            basePrice = ""
                            description = ""
                        }
                    }
                )
            }
        }
    }
}
