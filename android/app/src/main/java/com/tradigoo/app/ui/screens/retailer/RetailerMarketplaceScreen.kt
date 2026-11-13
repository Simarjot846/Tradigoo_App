package com.tradigoo.app.ui.screens.retailer

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tradigoo.app.domain.model.Product
import com.tradigoo.app.domain.model.TaxCalculator
import com.tradigoo.app.ui.components.ProductThumbnail
import com.tradigoo.app.ui.components.formatInr
import com.tradigoo.app.ui.theme.*

@Composable
fun RetailerMarketplaceScreen(
    products: List<Product>,
    selectedCategory: String,
    searchQuery: String,
    sortOption: String,
    verifiedOnly: Boolean,
    isLoading: Boolean,
    onRefresh: () -> Unit,
    onCategorySelected: (String) -> Unit,
    onSearchChanged: (String) -> Unit,
    onSortChanged: (String) -> Unit,
    onVerifiedOnlyChanged: (Boolean) -> Unit,
    onAddToCart: (Product, Int) -> Unit
) {
    val categories = listOf("All", "Grains", "Pulses", "Oils", "Spices", "Sweeteners", "Flours", "Beverages", "Electronics", "Fashion")
    val sortOptions = listOf(
        "relevance" to "Featured",
        "price-low" to "Price: Low-High",
        "price-high" to "Price: High-Low",
        "moq-low" to "Lowest MOQ",
        "trust" to "Supplier Trust"
    )

    var selectedProductForOrder by remember { mutableStateOf<Product?>(null) }
    var orderQuantity by remember { mutableStateOf(1) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(TradigooBackground)
    ) {
        // Compact pinned search bar; categories, filters, and listings scroll seamlessly below
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 10.dp)
        ) {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = onSearchChanged,
                placeholder = {
                    Text(
                        text = "Search wheat, pulses, oils, supplier...",
                        fontSize = 13.5.sp,
                        color = TradigooTextTertiary,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "Search",
                        tint = TradigooNavy,
                        modifier = Modifier.size(19.dp)
                    )
                },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { onSearchChanged("") }) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Clear search",
                                tint = TradigooTextSecondary,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                },
                singleLine = true,
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = TradigooSurface,
                    unfocusedContainerColor = TradigooSurface,
                    focusedBorderColor = TradigooNavy,
                    unfocusedBorderColor = TradigooCardBorder,
                    focusedTextColor = TradigooTextPrimary,
                    unfocusedTextColor = TradigooTextPrimary
                ),
                modifier = Modifier.fillMaxWidth()
            )
        }

        LazyColumn(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            contentPadding = PaddingValues(start = 14.dp, end = 14.dp, top = 2.dp, bottom = 92.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item(key = "categories_row") {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(categories) { category ->
                        val isSelected = selectedCategory.equals(category, ignoreCase = true)
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (isSelected) TradigooNavy else TradigooSurface)
                                .border(
                                    1.dp,
                                    if (isSelected) TradigooNavy else TradigooCardBorder,
                                    RoundedCornerShape(10.dp)
                                )
                                .clickable { onCategorySelected(category) }
                                .padding(horizontal = 13.dp, vertical = 7.dp)
                        ) {
                            Text(
                                text = category,
                                fontSize = 12.5.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSelected) Color.White else TradigooTextPrimary,
                                maxLines = 1,
                                softWrap = false
                            )
                        }
                    }
                }
            }

            item(key = "filters_row") {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    item {
                        FilterChip(
                            selected = verifiedOnly,
                            onClick = { onVerifiedOnlyChanged(!verifiedOnly) },
                            label = { Text("GST Verified", fontSize = 12.sp, maxLines = 1, softWrap = false) },
                            leadingIcon = {
                                Icon(
                                    imageVector = Icons.Default.VerifiedUser,
                                    contentDescription = null,
                                    modifier = Modifier.size(15.dp)
                                )
                            },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = TradigooEmeraldBg,
                                selectedLabelColor = TradigooEmeraldDark,
                                selectedLeadingIconColor = TradigooEmerald
                            )
                        )
                    }

                    items(sortOptions) { (key, label) ->
                        val isSortActive = sortOption == key
                        FilterChip(
                            selected = isSortActive,
                            onClick = { onSortChanged(key) },
                            label = { Text(label, fontSize = 12.sp, maxLines = 1, softWrap = false) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = TradigooGoldBg,
                                selectedLabelColor = TradigooNavy
                            )
                        )
                    }
                }
            }

            item(key = "listing_count_row") {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "${products.size} Wholesale Listings",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = TradigooTextSecondary,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f)
                    )
                    TextButton(
                        onClick = onRefresh,
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                    ) {
                        Icon(
                            Icons.Default.Refresh,
                            contentDescription = "Refresh",
                            modifier = Modifier.size(16.dp),
                            tint = TradigooNavy
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "Refresh",
                            fontSize = 12.sp,
                            color = TradigooNavy,
                            maxLines = 1,
                            softWrap = false
                        )
                    }
                }
            }

            if (isLoading && products.isEmpty()) {
                item(key = "loading_state") {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 48.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = TradigooNavy)
                    }
                }
            } else if (products.isEmpty()) {
                item(key = "empty_state") {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 40.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                imageVector = Icons.Default.Inventory2,
                                contentDescription = null,
                                tint = TradigooTextTertiary,
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = "No Products Found",
                                fontSize = 17.sp,
                                fontWeight = FontWeight.Bold,
                                color = TradigooTextPrimary
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = if (searchQuery.isNotBlank()) {
                                    "No matching wholesale commodities for \"$searchQuery\"."
                                } else {
                                    "No active wholesale listings match the selected filters."
                                },
                                fontSize = 13.sp,
                                color = TradigooTextSecondary,
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }
            } else {
                items(products, key = { it.id }) { product ->
                    val gstSlab = TaxCalculator.getGstRateForCategory(product.category)
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                selectedProductForOrder = product
                                orderQuantity = product.minOrderQuantity.coerceAtLeast(1)
                            },
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = TradigooSurface),
                        border = androidx.compose.foundation.BorderStroke(1.dp, TradigooCardBorder)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.Top,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Row(modifier = Modifier.weight(1f)) {
                                    ProductThumbnail(
                                        imageUrl = product.imageUrl,
                                        contentDescription = product.name,
                                        size = 56.dp
                                    )

                                    Spacer(modifier = Modifier.width(12.dp))

                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = product.name,
                                            fontSize = 15.5.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = TradigooTextPrimary,
                                            maxLines = 2,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                        Spacer(modifier = Modifier.height(2.dp))
                                        Text(
                                            text = "${product.category} • $gstSlab% GST",
                                            fontSize = 12.sp,
                                            color = TradigooTextSecondary,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                        if (!product.sellerBusinessName.isNullOrBlank()) {
                                            Spacer(modifier = Modifier.height(2.dp))
                                            Row(verticalAlignment = Alignment.CenterVertically) {
                                                Text(
                                                    text = product.sellerBusinessName,
                                                    fontSize = 12.sp,
                                                    fontWeight = FontWeight.Medium,
                                                    color = TradigooNavy,
                                                    maxLines = 1,
                                                    overflow = TextOverflow.Ellipsis,
                                                    modifier = Modifier.weight(1f, fill = false)
                                                )
                                                if (product.sellerGstVerified) {
                                                    Spacer(modifier = Modifier.width(4.dp))
                                                    Icon(
                                                        imageVector = Icons.Default.VerifiedUser,
                                                        contentDescription = "GST Verified",
                                                        tint = TradigooEmerald,
                                                        modifier = Modifier.size(14.dp)
                                                    )
                                                }
                                            }
                                        }
                                    }
                                }

                                if (product.sellerTrustScore != null && product.sellerTrustScore > 0) {
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(TradigooGoldBg)
                                            .padding(horizontal = 7.dp, vertical = 3.dp)
                                    ) {
                                        Text(
                                            text = "Trust ${product.sellerTrustScore}",
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = TradigooNavy,
                                            maxLines = 1,
                                            softWrap = false
                                        )
                                    }
                                }
                            }

                            if (product.description.isNotBlank()) {
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = product.description,
                                    fontSize = 12.5.sp,
                                    lineHeight = 17.sp,
                                    color = TradigooTextSecondary,
                                    maxLines = 2,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }

                            Spacer(modifier = Modifier.height(10.dp))
                            HorizontalDivider(color = TradigooCardBorder.copy(alpha = 0.6f))
                            Spacer(modifier = Modifier.height(10.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Row(verticalAlignment = Alignment.Bottom) {
                                        Text(
                                            text = formatInr(product.basePrice),
                                            fontSize = 18.sp,
                                            fontWeight = FontWeight.Black,
                                            color = TradigooTextPrimary,
                                            maxLines = 1
                                        )
                                        Text(
                                            text = "/${product.unit}",
                                            fontSize = 12.5.sp,
                                            color = TradigooTextSecondary,
                                            maxLines = 1,
                                            modifier = Modifier.padding(bottom = 2.dp, start = 2.dp)
                                        )
                                    }
                                    Text(
                                        text = "MOQ: ${product.minOrderQuantity} ${product.unit}",
                                        fontSize = 11.5.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = TradigooTextSecondary,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }

                                Spacer(modifier = Modifier.width(8.dp))

                                Button(
                                    onClick = {
                                        selectedProductForOrder = product
                                        orderQuantity = product.minOrderQuantity.coerceAtLeast(1)
                                    },
                                    shape = RoundedCornerShape(10.dp),
                                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 8.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = TradigooNavy)
                                ) {
                                    Icon(imageVector = Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        text = "Order",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        maxLines = 1,
                                        softWrap = false
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Product Detail & Add to Cart Modal
    if (selectedProductForOrder != null) {
        val prod = selectedProductForOrder!!
        val moq = prod.minOrderQuantity.coerceAtLeast(1)
        val pricing = TaxCalculator.calculateItemPricing(prod.basePrice, orderQuantity, prod.category)

        AlertDialog(
            onDismissRequest = { selectedProductForOrder = null },
            title = {
                Text(
                    text = prod.name,
                    fontWeight = FontWeight.Bold,
                    fontSize = 17.sp,
                    color = TradigooTextPrimary
                )
            },
            text = {
                Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
                    if (!prod.sellerBusinessName.isNullOrBlank()) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "Supplier: ${prod.sellerBusinessName}",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = TradigooNavy,
                                modifier = Modifier.weight(1f, fill = false)
                            )
                            if (prod.sellerGstVerified) {
                                Spacer(modifier = Modifier.width(6.dp))
                                Icon(
                                    imageVector = Icons.Default.VerifiedUser,
                                    contentDescription = "Verified",
                                    tint = TradigooEmerald,
                                    modifier = Modifier.size(15.dp)
                                )
                            }
                        }
                        if (!prod.sellerLocation.isNullOrBlank()) {
                            Text(text = "Location: ${prod.sellerLocation}", fontSize = 12.sp, color = TradigooTextSecondary)
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                    }

                    if (prod.description.isNotBlank()) {
                        Text(text = prod.description, fontSize = 12.5.sp, color = TradigooTextSecondary, lineHeight = 17.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                    }

                    if (!prod.batchNumber.isNullOrBlank() || !prod.expiryDate.isNullOrBlank()) {
                        Text(
                            text = listOfNotNull(
                                prod.batchNumber?.let { "Batch: $it" },
                                prod.expiryDate?.let { "Expiry: $it" }
                            ).joinToString(" • "),
                            fontSize = 11.5.sp,
                            color = TradigooTextTertiary
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                    }

                    Text(
                        text = "Unit Price: ${formatInr(prod.basePrice)}/${prod.unit} • MOQ: $moq ${prod.unit}",
                        fontSize = 13.5.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = TradigooNavy
                    )

                    Spacer(modifier = Modifier.height(12.dp))
                    Text(text = "Select Quantity (${prod.unit}):", fontSize = 13.sp, color = TradigooTextSecondary)
                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp, Alignment.CenterHorizontally),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        OutlinedButton(
                            onClick = { orderQuantity = (orderQuantity - 10).coerceAtLeast(moq) },
                            contentPadding = PaddingValues(horizontal = 6.dp),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.weight(1f)
                        ) { Text("-10", fontSize = 11.5.sp, maxLines = 1, softWrap = false) }

                        OutlinedButton(
                            onClick = { orderQuantity = (orderQuantity - 1).coerceAtLeast(moq) },
                            contentPadding = PaddingValues(horizontal = 6.dp),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.weight(1f)
                        ) { Text("-1", fontSize = 11.5.sp, maxLines = 1, softWrap = false) }

                        Text(
                            text = "$orderQuantity ${prod.unit}",
                            fontSize = 13.5.sp,
                            fontWeight = FontWeight.Bold,
                            color = TradigooTextPrimary,
                            textAlign = TextAlign.Center,
                            maxLines = 1,
                            modifier = Modifier.padding(horizontal = 4.dp)
                        )

                        OutlinedButton(
                            onClick = { orderQuantity += 1 },
                            contentPadding = PaddingValues(horizontal = 6.dp),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.weight(1f)
                        ) { Text("+1", fontSize = 11.5.sp, maxLines = 1, softWrap = false) }

                        OutlinedButton(
                            onClick = { orderQuantity += 10 },
                            contentPadding = PaddingValues(horizontal = 6.dp),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.weight(1f)
                        ) { Text("+10", fontSize = 11.5.sp, maxLines = 1, softWrap = false) }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .background(TradigooBackground)
                            .padding(12.dp)
                    ) {
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Subtotal", fontSize = 12.sp, color = TradigooTextSecondary)
                                Text(formatInr(pricing.taxableAmount), fontSize = 12.sp, fontWeight = FontWeight.Medium)
                            }
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("GST (${pricing.gstRate}%)", fontSize = 12.sp, color = TradigooTextSecondary)
                                Text(formatInr(pricing.gstAmount), fontSize = 12.sp, fontWeight = FontWeight.Medium)
                            }
                            HorizontalDivider(color = TradigooCardBorder, modifier = Modifier.padding(vertical = 4.dp))
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Total Payable", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = TradigooTextPrimary)
                                Text(formatInr(pricing.totalAmount), fontSize = 15.sp, fontWeight = FontWeight.Bold, color = TradigooNavy)
                            }
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
                    colors = ButtonDefaults.buttonColors(containerColor = TradigooNavy)
                ) {
                    Text("Add to Cart", maxLines = 1, softWrap = false)
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
