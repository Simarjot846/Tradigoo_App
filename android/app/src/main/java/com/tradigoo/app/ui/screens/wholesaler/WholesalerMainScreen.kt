package com.tradigoo.app.ui.screens.wholesaler

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
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
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(uiState.error, uiState.actionMessage) {
        val message = uiState.error ?: uiState.actionMessage
        if (!message.isNullOrBlank()) {
            snackbarHostState.showSnackbar(message)
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
                        border = BorderStroke(1.dp, TradigooGold.copy(alpha = 0.45f)),
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
                                    Text(
                                        text = "Exit Preview",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = TradigooNavy
                                    )
                                }
                            }
                        }
                    }
                }

                TradigooTopBar(
                    userRole = UserRole.WHOLESALER,
                    userInitials = uiState.user?.name ?: "WP",
                    onProfileClick = { selectedTab = WholesalerTab.Profile },
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
                        selected = selectedTab == WholesalerTab.Home,
                        onClick = { selectedTab = WholesalerTab.Home },
                        icon = { Icon(Icons.Default.Dashboard, contentDescription = "Home") },
                        label = {
                            Text("Home", fontSize = 10.sp, fontWeight = FontWeight.SemiBold, maxLines = 1, softWrap = false, overflow = TextOverflow.Ellipsis)
                        },
                        colors = navColors
                    )

                    NavigationBarItem(
                        selected = selectedTab == WholesalerTab.Inventory,
                        onClick = { selectedTab = WholesalerTab.Inventory },
                        icon = { Icon(Icons.Default.Inventory2, contentDescription = "Inventory") },
                        label = {
                            Text("Inventory", fontSize = 10.sp, fontWeight = FontWeight.SemiBold, maxLines = 1, softWrap = false, overflow = TextOverflow.Ellipsis)
                        },
                        colors = navColors
                    )

                    NavigationBarItem(
                        selected = selectedTab == WholesalerTab.AddProduct,
                        onClick = { selectedTab = WholesalerTab.AddProduct },
                        icon = { Icon(Icons.Default.AddCircle, contentDescription = "Add SKU") },
                        label = {
                            Text("Add SKU", fontSize = 10.sp, fontWeight = FontWeight.SemiBold, maxLines = 1, softWrap = false, overflow = TextOverflow.Ellipsis)
                        },
                        colors = navColors
                    )

                    NavigationBarItem(
                        selected = selectedTab == WholesalerTab.Orders,
                        onClick = { selectedTab = WholesalerTab.Orders },
                        icon = { Icon(Icons.Default.LocalShipping, contentDescription = "Orders") },
                        label = {
                            Text("Orders", fontSize = 10.sp, fontWeight = FontWeight.SemiBold, maxLines = 1, softWrap = false, overflow = TextOverflow.Ellipsis)
                        },
                        colors = navColors
                    )

                    NavigationBarItem(
                        selected = selectedTab == WholesalerTab.Profile,
                        onClick = { selectedTab = WholesalerTab.Profile },
                        icon = { Icon(Icons.Default.Business, contentDescription = "Business") },
                        label = {
                            Text("Business", fontSize = 10.sp, fontWeight = FontWeight.SemiBold, maxLines = 1, softWrap = false, overflow = TextOverflow.Ellipsis)
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
                WholesalerTab.Home -> {
                    WholesalerHomeScreen(
                        user = uiState.user,
                        trustScore = uiState.trustScore,
                        inventory = uiState.inventory,
                        orders = uiState.receivedOrders,
                        isLoading = uiState.isLoading,
                        onRefresh = { viewModel.loadData() },
                        onNavigateToAddProduct = { selectedTab = WholesalerTab.AddProduct },
                        onNavigateToOrders = { selectedTab = WholesalerTab.Orders }
                    )
                }
                WholesalerTab.Inventory -> {
                    WholesalerInventoryScreen(
                        inventory = uiState.inventory,
                        isActionLoading = uiState.isActionLoading,
                        onNavigateToAddProduct = { selectedTab = WholesalerTab.AddProduct },
                        onUpdateProduct = { id, name, cat, price, unit, moq, desc, active, onDone ->
                            viewModel.updateProduct(id, name, cat, price, unit, moq, desc, active, onDone)
                        },
                        onDeleteProduct = { viewModel.deleteProduct(it) }
                    )
                }
                WholesalerTab.AddProduct -> {
                    WholesalerAddProductScreen(
                        isSubmitting = uiState.isActionLoading,
                        onProductPublished = { name, cat, price, unit, moq, desc, imageUri, batch, onSuccess ->
                            viewModel.addProduct(name, cat, price, unit, moq, desc, imageUri, batch) {
                                onSuccess()
                                selectedTab = WholesalerTab.Inventory
                            }
                        }
                    )
                }
                WholesalerTab.Orders -> {
                    WholesalerOrdersScreen(
                        orders = uiState.receivedOrders,
                        isActionLoading = uiState.isActionLoading,
                        onRefresh = { viewModel.loadData() },
                        onUpdateStatus = { id, status -> viewModel.updateOrderStatus(id, status) }
                    )
                }
                WholesalerTab.Profile -> {
                    WholesalerProfileScreen(
                        user = uiState.user,
                        trustScore = uiState.trustScore,
                        isSavingProfile = uiState.isActionLoading,
                        onUpdateProfile = { name, phone, business, location, gst, address, pin, onSaved ->
                            viewModel.updateProfile(name, phone, business, location, gst, address, pin, onSaved)
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
            role = UserRole.WHOLESALER,
            onDismiss = { showAiAssistant = false }
        )
    }
}
