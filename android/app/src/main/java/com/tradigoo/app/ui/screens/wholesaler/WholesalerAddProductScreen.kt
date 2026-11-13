package com.tradigoo.app.ui.screens.wholesaler

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddPhotoAlternate
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.SubcomposeAsyncImage
import com.tradigoo.app.ui.components.TradigooGradientButton
import com.tradigoo.app.ui.components.TradigooTextField
import com.tradigoo.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WholesalerAddProductScreen(
    isSubmitting: Boolean = false,
    onProductPublished: (
        name: String,
        category: String,
        basePrice: Double,
        unit: String,
        minOrderQuantity: Int,
        description: String,
        imageUri: Uri?,
        batchNumber: String?,
        onSuccess: () -> Unit
    ) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("Grains") }
    var basePrice by remember { mutableStateOf("") }
    var selectedUnit by remember { mutableStateOf("kg") }
    var minOrderQuantity by remember { mutableStateOf("100") }
    var batchNumber by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var selectedImageUri by remember { mutableStateOf<Uri?>(null) }

    var categoryDropdownExpanded by remember { mutableStateOf(false) }
    var unitDropdownExpanded by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    val imagePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            selectedImageUri = uri
        }
    }

    val categories = listOf("Grains", "Pulses", "Oils", "Spices", "Sweeteners", "Flours", "Beverages", "Electronics", "Home & Kitchen")
    val units = listOf("kg", "ltr", "ton", "box", "quintal", "pcs")

    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(TradigooBackground)
            .imePadding()
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
            text = "Publish bulk commodities to verified retailers across India.",
            fontSize = 13.sp,
            color = TradigooTextSecondary
        )

        Spacer(modifier = Modifier.height(16.dp))

        if (errorMessage != null) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(StatusErrorBg)
                    .padding(14.dp)
            ) {
                Text(
                    text = errorMessage!!,
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
            border = BorderStroke(1.dp, TradigooCardBorder)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                // Optional Product Photo Picker
                Text(
                    text = "PRODUCT PHOTO (OPTIONAL)",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = TradigooTextSecondary,
                    modifier = Modifier.padding(bottom = 6.dp)
                )

                if (selectedImageUri != null) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(150.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .border(1.dp, TradigooCardBorder, RoundedCornerShape(12.dp))
                    ) {
                        SubcomposeAsyncImage(
                            model = selectedImageUri,
                            contentDescription = "Selected product photo",
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.fillMaxSize()
                        )
                        IconButton(
                            onClick = { selectedImageUri = null },
                            modifier = Modifier
                                .align(Alignment.TopEnd)
                                .padding(6.dp)
                                .clip(RoundedCornerShape(50))
                                .background(TradigooNavy.copy(alpha = 0.75f))
                                .size(30.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Remove photo",
                                tint = TradigooSurface,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                } else {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(84.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(TradigooNavyBg)
                            .border(1.dp, TradigooCardBorder, RoundedCornerShape(12.dp))
                            .clickable(enabled = !isSubmitting) { imagePickerLauncher.launch("image/*") },
                        contentAlignment = Alignment.Center
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.AddPhotoAlternate,
                                contentDescription = null,
                                tint = TradigooNavy,
                                modifier = Modifier.size(22.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Select product photo from gallery (Max 5 MB)",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = TradigooNavy
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                TradigooTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = "PRODUCT NAME",
                    placeholder = "e.g., Premium Sortex Sharbati Wheat"
                )

                Spacer(modifier = Modifier.height(14.dp))

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
                            focusedBorderColor = TradigooNavy,
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
                                    focusedBorderColor = TradigooNavy,
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

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        TradigooTextField(
                            value = minOrderQuantity,
                            onValueChange = { minOrderQuantity = it.filter(Char::isDigit) },
                            label = "MIN ORDER QTY (MOQ)",
                            placeholder = "100",
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                        )
                    }
                    Column(modifier = Modifier.weight(1f)) {
                        TradigooTextField(
                            value = batchNumber,
                            onValueChange = { batchNumber = it },
                            label = "BATCH NO. (OPTIONAL)",
                            placeholder = "LOT-2025A"
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                TradigooTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = "SPECIFICATIONS & ORIGIN",
                    placeholder = "e.g., Farm fresh harvest, double cleaned, 50kg gunny bags.",
                    singleLine = false,
                    maxLines = 3
                )

                Spacer(modifier = Modifier.height(22.dp))

                TradigooGradientButton(
                    text = if (isSubmitting) "Publishing..." else "Publish Listing to Network",
                    gradient = TradigooBrandGradient,
                    isLoading = isSubmitting,
                    enabled = !isSubmitting,
                    onClick = {
                        val priceNum = basePrice.toDoubleOrNull()
                        val moqNum = minOrderQuantity.toIntOrNull()

                        if (name.isBlank() || priceNum == null || priceNum <= 0 || moqNum == null || moqNum <= 0) {
                            errorMessage = "Please enter a valid product name, base price, and MOQ."
                        } else {
                            errorMessage = null
                            onProductPublished(
                                name,
                                selectedCategory,
                                priceNum,
                                selectedUnit,
                                moqNum,
                                description.ifBlank { "Direct wholesale stock." },
                                selectedImageUri,
                                batchNumber.takeIf { it.isNotBlank() }
                            ) {
                                name = ""
                                basePrice = ""
                                batchNumber = ""
                                description = ""
                                selectedImageUri = null
                            }
                        }
                    }
                )
            }
        }
    }
}
