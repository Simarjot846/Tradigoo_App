package com.tradigoo.app.ui.screens.wholesaler

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.tradigoo.app.domain.model.UserRole
import com.tradigoo.app.ui.components.TradigooAiAssistantDialog
import com.tradigoo.app.ui.components.TradigooTopBar
import com.tradigoo.app.ui.navigation.WholesalerTab
import com.tradigoo.app.ui.theme.*

@Composable
fun WholesalerMainScreen(
    onLogout: () -> Unit,
    isPreview: Boolean = false,
    onExitPreview: (() -> Unit)? = null,
    viewModel: WholesalerViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var selectedTab by remember { mutableStateOf<WholesalerTab>(WholesalerTab.Home) }
    var showAiAssistant by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            Column {
                if (isPreview) {
                    Surface(
                        color = TradigooEmeraldBg,
                        border = androidx.compose.foundation.BorderStroke(1.dp, TradigooEmerald.copy(alpha = 0.4f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .statusBarsPadding()
                                .padding(horizontal = 16.dp, vertical = 6.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "👀 ADMINISTRATIVE PREVIEW MODE (FOUNDER)",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = TradigooEmeraldDark
                            )
                            if (onExitPreview != null) {
                                TextButton(onClick = onExitPreview) {
                                    Text("Exit Preview", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TradigooEmeraldDark)
                                }
                            }
                        }
                    }
                }

                TradigooTopBar(
                    userRole = UserRole.WHOLESALER,
                    userInitials = uiState.user?.name ?: "WP",
                    onProfileClick = { selectedTab = WholesalerTab.Profile }
                )
            }
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAiAssistant = true },
                containerColor = TradigooEmeraldDark,
                contentColor = Color.White,
                shape = CircleShape,
                modifier = Modifier.padding(bottom = 8.dp)
            ) {
                Icon(Icons.Default.AutoAwesome, contentDescription = "Tradigoo AI Assistant")
            }
        },
        bottomBar = {
            NavigationBar(
                containerColor = TradigooSurface,
                tonalElevation = 8.dp
            ) {
                NavigationBarItem(
                    selected = selectedTab == WholesalerTab.Home,
                    onClick = { selectedTab = WholesalerTab.Home },
                    icon = { Icon(Icons.Default.Dashboard, contentDescription = "Dashboard") },
                    label = { Text("Home", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = TradigooEmerald,
                        selectedTextColor = TradigooEmerald,
                        indicatorColor = TradigooEmeraldBg
                    )
                )

                NavigationBarItem(
                    selected = selectedTab == WholesalerTab.Inventory,
                    onClick = { selectedTab = WholesalerTab.Inventory },
                    icon = { Icon(Icons.Default.Inventory, contentDescription = "Inventory") },
                    label = { Text("Inventory", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = TradigooEmerald,
                        selectedTextColor = TradigooEmerald,
                        indicatorColor = TradigooEmeraldBg
                    )
                )

                NavigationBarItem(
                    selected = selectedTab == WholesalerTab.AddProduct,
                    onClick = { selectedTab = WholesalerTab.AddProduct },
                    icon = { Icon(Icons.Default.AddCircle, contentDescription = "Add Product") },
                    label = { Text("Add SKU", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = TradigooEmerald,
                        selectedTextColor = TradigooEmerald,
                        indicatorColor = TradigooEmeraldBg
                    )
                )

                NavigationBarItem(
                    selected = selectedTab == WholesalerTab.Orders,
                    onClick = { selectedTab = WholesalerTab.Orders },
                    icon = { Icon(Icons.Default.LocalShipping, contentDescription = "Orders") },
                    label = { Text("Orders", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = TradigooEmerald,
                        selectedTextColor = TradigooEmerald,
                        indicatorColor = TradigooEmeraldBg
                    )
                )

                NavigationBarItem(
                    selected = selectedTab == WholesalerTab.Profile,
                    onClick = { selectedTab = WholesalerTab.Profile },
                    icon = { Icon(Icons.Default.Business, contentDescription = "Business") },
                    label = { Text("Business", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = TradigooEmerald,
                        selectedTextColor = TradigooEmerald,
                        indicatorColor = TradigooEmeraldBg
                    )
                )
            }
        },
        containerColor = TradigooBackground
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when (selectedTab) {
                WholesalerTab.Home -> {
                    WholesalerHomeScreen(
                        user = uiState.user,
                        inventory = uiState.inventory,
                        orders = uiState.receivedOrders,
                        onNavigateToAddProduct = { selectedTab = WholesalerTab.AddProduct },
                        onNavigateToOrders = { selectedTab = WholesalerTab.Orders }
                    )
                }
                WholesalerTab.Inventory -> {
                    WholesalerInventoryScreen(
                        inventory = uiState.inventory,
                        onNavigateToAddProduct = { selectedTab = WholesalerTab.AddProduct },
                        onDeleteProduct = { viewModel.deleteProduct(it) }
                    )
                }
                WholesalerTab.AddProduct -> {
                    WholesalerAddProductScreen(
                        onProductPublished = { name, cat, price, unit, moq, desc ->
                            viewModel.addProduct(name, cat, price, unit, moq, desc) {
                                selectedTab = WholesalerTab.Inventory
                            }
                        }
                    )
                }
                WholesalerTab.Orders -> {
                    WholesalerOrdersScreen(
                        orders = uiState.receivedOrders,
                        onUpdateStatus = { id, status -> viewModel.updateOrderStatus(id, status) }
                    )
                }
                WholesalerTab.Profile -> {
                    WholesalerProfileScreen(
                        user = uiState.user,
                        onLogout = onLogout
                    )
                }
            }
        }
    }

    if (showAiAssistant) {
        TradigooAiAssistantDialog(
            role = UserRole.WHOLESALER,
            onDismiss = { showAiAssistant = false }
        )
    }
}
