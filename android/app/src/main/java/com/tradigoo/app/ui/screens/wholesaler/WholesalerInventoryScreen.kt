package com.tradigoo.app.ui.screens.wholesaler

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Inventory2
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tradigoo.app.domain.model.Product
import com.tradigoo.app.ui.components.ProductThumbnail
import com.tradigoo.app.ui.components.formatInr
import com.tradigoo.app.ui.theme.*

@Composable
fun WholesalerInventoryScreen(
    inventory: List<Product>,
    isActionLoading: Boolean = false,
    onNavigateToAddProduct: () -> Unit,
    onUpdateProduct: (
        productId: String,
        name: String,
        category: String,
        basePrice: Double,
        unit: String,
        minOrderQuantity: Int,
        description: String,
        isActive: Boolean,
        onSuccess: () -> Unit
    ) -> Unit,
    onDeleteProduct: (String) -> Unit
) {
    var editingProduct by remember { mutableStateOf<Product?>(null) }
    var deletingProduct by remember { mutableStateOf<Product?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(TradigooBackground)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(start = 16.dp, end = 16.dp, top = 14.dp, bottom = 10.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Inventory Management",
                    fontSize = 19.sp,
                    fontWeight = FontWeight.Bold,
                    color = TradigooTextPrimary,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = "${inventory.count { it.isActive }} active • ${inventory.size} total SKUs",
                    fontSize = 13.sp,
                    color = TradigooTextSecondary
                )
            }

            Spacer(modifier = Modifier.width(8.dp))

            Button(
                onClick = onNavigateToAddProduct,
                shape = RoundedCornerShape(10.dp),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp),
                colors = ButtonDefaults.buttonColors(containerColor = TradigooNavy)
            ) {
                Icon(imageVector = Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Add SKU", fontSize = 12.sp, fontWeight = FontWeight.Bold, maxLines = 1, softWrap = false)
            }
        }

        if (inventory.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Default.Inventory2,
                        contentDescription = null,
                        tint = TradigooNavy.copy(alpha = 0.45f),
                        modifier = Modifier.size(52.dp)
                    )
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
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = onNavigateToAddProduct,
                        colors = ButtonDefaults.buttonColors(containerColor = TradigooNavy)
                    ) {
                        Text("Add First SKU")
                    }
                }
            }
        } else {
            LazyColumn(
                contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 4.dp, bottom = 92.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(inventory, key = { it.id }) { product ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = TradigooSurface),
                        border = BorderStroke(1.dp, TradigooCardBorder)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(
                                    modifier = Modifier.weight(1f),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    ProductThumbnail(
                                        imageUrl = product.imageUrl,
                                        contentDescription = product.name,
                                        size = 52.dp,
                                        cornerRadius = 12.dp
                                    )
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

                                Row {
                                    IconButton(
                                        onClick = { editingProduct = product },
                                        enabled = !isActionLoading,
                                        modifier = Modifier.size(34.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Edit,
                                            contentDescription = "Edit SKU",
                                            tint = TradigooNavy,
                                            modifier = Modifier.size(18.dp)
                                        )
                                    }
                                    IconButton(
                                        onClick = { deletingProduct = product },
                                        enabled = !isActionLoading,
                                        modifier = Modifier.size(34.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Delete,
                                            contentDescription = "Delete SKU",
                                            tint = StatusError,
                                            modifier = Modifier.size(18.dp)
                                        )
                                    }
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
                                    text = "${formatInr(product.basePrice)} / ${product.unit}",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TradigooNavy
                                )

                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(if (product.isActive) TradigooEmeraldBg else TradigooAmberBg)
                                        .padding(horizontal = 8.dp, vertical = 3.dp)
                                ) {
                                    Text(
                                        text = if (product.isActive) "Active in Catalog" else "Paused",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = if (product.isActive) TradigooEmeraldDark else TradigooAmber
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (editingProduct != null) {
        val target = editingProduct!!
        var editName by remember(target.id) { mutableStateOf(target.name) }
        var editCategory by remember(target.id) { mutableStateOf(target.category) }
        var editPrice by remember(target.id) { mutableStateOf(target.basePrice.toString()) }
        var editUnit by remember(target.id) { mutableStateOf(target.unit) }
        var editMoq by remember(target.id) { mutableStateOf(target.minOrderQuantity.toString()) }
        var editDesc by remember(target.id) { mutableStateOf(target.description) }
        var editActive by remember(target.id) { mutableStateOf(target.isActive) }

        AlertDialog(
            onDismissRequest = { editingProduct = null },
            title = { Text("Edit Wholesale SKU", fontWeight = FontWeight.Bold) },
            text = {
                Column(
                    modifier = Modifier.verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = editName,
                        onValueChange = { editName = it },
                        label = { Text("Product Name") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = editCategory,
                        onValueChange = { editCategory = it },
                        label = { Text("Category") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = editPrice,
                            onValueChange = { editPrice = it },
                            label = { Text("Price (₹)") },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                            modifier = Modifier.weight(1f)
                        )
                        OutlinedTextField(
                            value = editUnit,
                            onValueChange = { editUnit = it },
                            label = { Text("Unit") },
                            singleLine = true,
                            modifier = Modifier.weight(0.8f)
                        )
                    }
                    OutlinedTextField(
                        value = editMoq,
                        onValueChange = { editMoq = it.filter(Char::isDigit) },
                        label = { Text("MOQ") },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = editDesc,
                        onValueChange = { editDesc = it },
                        label = { Text("Description") },
                        maxLines = 3,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Visible in Marketplace", fontSize = 13.sp, fontWeight = FontWeight.Medium)
                        Switch(
                            checked = editActive,
                            onCheckedChange = { editActive = it }
                        )
                    }
                }
            },
            confirmButton = {
                val parsedPrice = editPrice.toDoubleOrNull()
                val parsedMoq = editMoq.toIntOrNull()
                Button(
                    enabled = !isActionLoading &&
                        editName.isNotBlank() &&
                        parsedPrice != null && parsedPrice > 0 &&
                        parsedMoq != null && parsedMoq > 0,
                    onClick = {
                        onUpdateProduct(
                            target.id,
                            editName,
                            editCategory,
                            parsedPrice!!,
                            editUnit.ifBlank { "kg" },
                            parsedMoq!!,
                            editDesc,
                            editActive
                        ) {
                            editingProduct = null
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = TradigooNavy)
                ) {
                    Text(if (isActionLoading) "Saving..." else "Save SKU")
                }
            },
            dismissButton = {
                TextButton(onClick = { editingProduct = null }) { Text("Cancel") }
            }
        )
    }

    if (deletingProduct != null) {
        val target = deletingProduct!!
        AlertDialog(
            onDismissRequest = { deletingProduct = null },
            title = { Text("Delete Listing?", fontWeight = FontWeight.Bold) },
            text = {
                Text(
                    text = "Remove '${target.name}' from your wholesale catalog? Existing orders remain unaffected.",
                    fontSize = 13.sp,
                    color = TradigooTextSecondary
                )
            },
            confirmButton = {
                Button(
                    enabled = !isActionLoading,
                    onClick = {
                        onDeleteProduct(target.id)
                        deletingProduct = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = StatusError)
                ) {
                    Text("Delete")
                }
            },
            dismissButton = {
                TextButton(onClick = { deletingProduct = null }) { Text("Cancel") }
            }
        )
    }
}
