package com.tradigoo.app.ui.screens.retailer

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
import com.tradigoo.app.ui.navigation.RetailerTab
import com.tradigoo.app.ui.theme.*

@Composable
fun RetailerMainScreen(
    onLogout: () -> Unit,
    isPreview: Boolean = false,
    onExitPreview: (() -> Unit)? = null,
    viewModel: RetailerViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var selectedTab by remember { mutableStateOf<RetailerTab>(RetailerTab.Home) }
    var showAiAssistant by remember { mutableStateOf(false) }

    val cartCount = uiState.cartItems.sumOf { it.quantity }

    Scaffold(
        topBar = {
            Column {
                if (isPreview) {
                    Surface(
                        color = TradigooBlueBg,
                        border = androidx.compose.foundation.BorderStroke(1.dp, TradigooBlue.copy(alpha = 0.4f)),
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
                                color = TradigooBlue
                            )
                            if (onExitPreview != null) {
                                TextButton(onClick = onExitPreview) {
                                    Text("Exit Preview", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }

                TradigooTopBar(
                    userRole = UserRole.RETAILER,
                    cartCount = cartCount,
                    onCartClick = { selectedTab = RetailerTab.Cart },
                    userInitials = uiState.user?.name ?: "RP",
                    onProfileClick = { selectedTab = RetailerTab.Profile }
                )
            }
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAiAssistant = true },
                containerColor = TradigooBlue,
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
                    selected = selectedTab == RetailerTab.Home,
                    onClick = { selectedTab = RetailerTab.Home },
                    icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
                    label = { Text("Home", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = TradigooBlue,
                        selectedTextColor = TradigooBlue,
                        indicatorColor = TradigooBlueBg
                    )
                )

                NavigationBarItem(
                    selected = selectedTab == RetailerTab.Discover,
                    onClick = { selectedTab = RetailerTab.Discover },
                    icon = { Icon(Icons.Default.Storefront, contentDescription = "Discover") },
                    label = { Text("Market", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = TradigooBlue,
                        selectedTextColor = TradigooBlue,
                        indicatorColor = TradigooBlueBg
                    )
                )

                NavigationBarItem(
                    selected = selectedTab == RetailerTab.Orders,
                    onClick = { selectedTab = RetailerTab.Orders },
                    icon = { Icon(Icons.Default.ReceiptLong, contentDescription = "Orders") },
                    label = { Text("Orders", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = TradigooBlue,
                        selectedTextColor = TradigooBlue,
                        indicatorColor = TradigooBlueBg
                    )
                )

                NavigationBarItem(
                    selected = selectedTab == RetailerTab.Cart,
                    onClick = { selectedTab = RetailerTab.Cart },
                    icon = {
                        BadgedBox(
                            badge = {
                                if (cartCount > 0) {
                                    Badge(
                                        containerColor = TradigooBlue,
                                        contentColor = Color.White
                                    ) {
                                        Text(text = cartCount.toString())
                                    }
                                }
                            }
                        ) {
                            Icon(Icons.Default.ShoppingCart, contentDescription = "Cart")
                        }
                    },
                    label = { Text("Cart", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = TradigooBlue,
                        selectedTextColor = TradigooBlue,
                        indicatorColor = TradigooBlueBg
                    )
                )

                NavigationBarItem(
                    selected = selectedTab == RetailerTab.Profile,
                    onClick = { selectedTab = RetailerTab.Profile },
                    icon = { Icon(Icons.Default.Person, contentDescription = "Profile") },
                    label = { Text("Profile", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = TradigooBlue,
                        selectedTextColor = TradigooBlue,
                        indicatorColor = TradigooBlueBg
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
                RetailerTab.Home -> {
                    RetailerHomeScreen(
                        user = uiState.user,
                        products = uiState.products,
                        onNavigateToDiscover = { selectedTab = RetailerTab.Discover },
                        onNavigateToOrders = { selectedTab = RetailerTab.Orders },
                        onAddToCart = { product ->
                            viewModel.addToCart(product)
                            selectedTab = RetailerTab.Cart
                        }
                    )
                }
                RetailerTab.Discover -> {
                    RetailerMarketplaceScreen(
                        products = uiState.filteredProducts,
                        selectedCategory = uiState.selectedCategory,
                        searchQuery = uiState.searchQuery,
                        onCategorySelected = { viewModel.selectCategory(it) },
                        onSearchChanged = { viewModel.searchProducts(it) },
                        onAddToCart = { product, quantity ->
                            viewModel.addToCart(product, quantity)
                        }
                    )
                }
                RetailerTab.Orders -> {
                    RetailerOrdersScreen(
                        orders = uiState.orders,
                        onExploreMarketplace = { selectedTab = RetailerTab.Discover }
                    )
                }
                RetailerTab.Cart -> {
                    RetailerCartScreen(
                        cartItems = uiState.cartItems,
                        onUpdateQuantity = { id, qty -> viewModel.updateCartQuantity(id, qty) },
                        onRemoveItem = { id -> viewModel.removeFromCart(id) },
                        onCheckout = {
                            viewModel.checkout {
                                selectedTab = RetailerTab.Orders
                            }
                        },
                        onExploreProducts = { selectedTab = RetailerTab.Discover }
                    )
                }
                RetailerTab.Profile -> {
                    RetailerProfileScreen(
                        user = uiState.user,
                        onLogout = onLogout
                    )
                }
            }
        }
    }

    if (showAiAssistant) {
        TradigooAiAssistantDialog(
            role = UserRole.RETAILER,
            onDismiss = { showAiAssistant = false }
        )
    }
}
