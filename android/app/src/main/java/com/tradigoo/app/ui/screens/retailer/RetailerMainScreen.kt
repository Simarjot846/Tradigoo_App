package com.tradigoo.app.ui.screens.retailer

import androidx.compose.foundation.BorderStroke
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
import androidx.compose.ui.text.style.TextOverflow
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

    val snackbarHostState = remember { SnackbarHostState() }
    val cartCount = uiState.cartItems.size

    LaunchedEffect(uiState.error, uiState.actionMessage) {
        val msg = uiState.error ?: uiState.actionMessage
        if (!msg.isNullOrBlank()) {
            snackbarHostState.showSnackbar(msg)
            viewModel.clearFeedback()
        }
    }

    Scaffold(
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) },
        topBar = {
            Column {
                if (isPreview) {
                    Surface(
                        color = TradigooGoldBg,
                        border = BorderStroke(1.dp, TradigooGold.copy(alpha = 0.4f)),
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
                                text = "ADMIN PREVIEW MODE (FOUNDER)",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = TradigooNavy,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            if (onExitPreview != null) {
                                TextButton(onClick = onExitPreview) {
                                    Text("Exit Preview", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TradigooNavy)
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
                    onProfileClick = { selectedTab = RetailerTab.Profile },
                    applyStatusBarInsets = !isPreview
                )
            }
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAiAssistant = true },
                containerColor = TradigooNavy,
                contentColor = TradigooGoldLight,
                shape = CircleShape,
                modifier = Modifier.size(50.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.AutoAwesome,
                    contentDescription = "Tradigoo Trade Assistant",
                    modifier = Modifier.size(22.dp)
                )
            }
        },
        bottomBar = {
            Column {
                HorizontalDivider(color = TradigooCardBorder, thickness = 1.dp)
                NavigationBar(
                    containerColor = TradigooSurface,
                    tonalElevation = 0.dp,
                    windowInsets = NavigationBarDefaults.windowInsets
                ) {
                    val navColors = NavigationBarItemDefaults.colors(
                        selectedIconColor = TradigooNavy,
                        selectedTextColor = TradigooNavy,
                        indicatorColor = TradigooGoldBg,
                        unselectedIconColor = TradigooTextTertiary,
                        unselectedTextColor = TradigooTextTertiary
                    )

                    NavigationBarItem(
                        selected = selectedTab == RetailerTab.Home,
                        onClick = { selectedTab = RetailerTab.Home },
                        icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
                        label = {
                            Text("Home", fontSize = 10.5.sp, fontWeight = FontWeight.SemiBold, maxLines = 1, softWrap = false, overflow = TextOverflow.Ellipsis)
                        },
                        colors = navColors
                    )

                    NavigationBarItem(
                        selected = selectedTab == RetailerTab.Discover,
                        onClick = { selectedTab = RetailerTab.Discover },
                        icon = { Icon(Icons.Default.Storefront, contentDescription = "Market") },
                        label = {
                            Text("Market", fontSize = 10.5.sp, fontWeight = FontWeight.SemiBold, maxLines = 1, softWrap = false, overflow = TextOverflow.Ellipsis)
                        },
                        colors = navColors
                    )

                    NavigationBarItem(
                        selected = selectedTab == RetailerTab.Orders,
                        onClick = { selectedTab = RetailerTab.Orders },
                        icon = { Icon(Icons.Default.ReceiptLong, contentDescription = "Orders") },
                        label = {
                            Text("Orders", fontSize = 10.5.sp, fontWeight = FontWeight.SemiBold, maxLines = 1, softWrap = false, overflow = TextOverflow.Ellipsis)
                        },
                        colors = navColors
                    )

                    NavigationBarItem(
                        selected = selectedTab == RetailerTab.Cart,
                        onClick = { selectedTab = RetailerTab.Cart },
                        icon = {
                            BadgedBox(
                                badge = {
                                    if (cartCount > 0) {
                                        Badge(
                                            containerColor = TradigooGoldDark,
                                            contentColor = Color.White
                                        ) {
                                            Text(text = if (cartCount > 99) "99+" else cartCount.toString())
                                        }
                                    }
                                }
                            ) {
                                Icon(Icons.Default.ShoppingCart, contentDescription = "Cart")
                            }
                        },
                        label = {
                            Text("Cart", fontSize = 10.5.sp, fontWeight = FontWeight.SemiBold, maxLines = 1, softWrap = false, overflow = TextOverflow.Ellipsis)
                        },
                        colors = navColors
                    )

                    NavigationBarItem(
                        selected = selectedTab == RetailerTab.Profile,
                        onClick = { selectedTab = RetailerTab.Profile },
                        icon = { Icon(Icons.Default.Person, contentDescription = "Profile") },
                        label = {
                            Text("Profile", fontSize = 10.5.sp, fontWeight = FontWeight.SemiBold, maxLines = 1, softWrap = false, overflow = TextOverflow.Ellipsis)
                        },
                        colors = navColors
                    )
                }
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
                        trustScore = uiState.trustScore,
                        products = uiState.products,
                        orders = uiState.orders,
                        isLoading = uiState.isLoading,
                        onRefresh = { viewModel.loadData() },
                        onCategorySelected = { cat ->
                            viewModel.selectCategory(cat)
                            selectedTab = RetailerTab.Discover
                        },
                        onNavigateToDiscover = { selectedTab = RetailerTab.Discover },
                        onNavigateToOrders = { selectedTab = RetailerTab.Orders },
                        onAddToCart = { product ->
                            viewModel.addToCart(product) {
                                selectedTab = RetailerTab.Cart
                            }
                        }
                    )
                }
                RetailerTab.Discover -> {
                    RetailerMarketplaceScreen(
                        products = uiState.filteredProducts,
                        selectedCategory = uiState.selectedCategory,
                        searchQuery = uiState.searchQuery,
                        sortOption = uiState.sortOption,
                        verifiedOnly = uiState.verifiedOnly,
                        isLoading = uiState.isLoading,
                        onRefresh = { viewModel.loadData() },
                        onCategorySelected = { viewModel.selectCategory(it) },
                        onSearchChanged = { viewModel.searchProducts(it) },
                        onSortChanged = { viewModel.setSortOption(it) },
                        onVerifiedOnlyChanged = { viewModel.toggleVerifiedOnly(it) },
                        onAddToCart = { product, quantity ->
                            viewModel.addToCart(product, quantity)
                        }
                    )
                }
                RetailerTab.Orders -> {
                    RetailerOrdersScreen(
                        orders = uiState.orders,
                        isLoading = uiState.isLoading,
                        isActionLoading = uiState.isActionLoading,
                        onRefresh = { viewModel.loadData() },
                        onExploreMarketplace = { selectedTab = RetailerTab.Discover },
                        onVerifyOtp = { orderId, code -> viewModel.verifyOrderOtp(orderId, code) },
                        onConfirmQuality = { orderId -> viewModel.confirmOrderQuality(orderId) },
                        onRaiseDispute = { orderId, reason, uri -> viewModel.raiseDispute(orderId, reason, uri) }
                    )
                }
                RetailerTab.Cart -> {
                    RetailerCartScreen(
                        cartItems = uiState.cartItems,
                        isActionLoading = uiState.isActionLoading,
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
                        trustScore = uiState.trustScore,
                        isSavingProfile = uiState.isActionLoading,
                        onUpdateProfile = { name, phone, businessName, location, gst, addr, pin, done ->
                            viewModel.updateProfile(name, phone, businessName, location, gst, addr, pin, done)
                        },
                        onLogout = {
                            viewModel.logout()
                            onLogout()
                        }
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
