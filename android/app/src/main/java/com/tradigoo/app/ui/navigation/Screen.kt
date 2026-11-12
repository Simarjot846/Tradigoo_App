package com.tradigoo.app.ui.navigation

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Welcome : Screen("welcome")
    object RoleSelection : Screen("role_selection")
    object Login : Screen("login")
    object Register : Screen("register/{role}") {
        fun createRoute(role: String) = "register/$role"
    }
    object ForgotPassword : Screen("forgot_password")
    object RetailerMain : Screen("retailer_main")
    object WholesalerMain : Screen("wholesaler_main")
    object EmployeeMain : Screen("employee_main")
    object FounderMain : Screen("founder_main")
}

sealed class RetailerTab(val route: String, val title: String, val iconName: String) {
    object Home : RetailerTab("retailer_home", "Home", "home")
    object Discover : RetailerTab("retailer_discover", "Marketplace", "search")
    object Orders : RetailerTab("retailer_orders", "My Orders", "package")
    object Cart : RetailerTab("retailer_cart", "Cart", "cart")
    object Profile : RetailerTab("retailer_profile", "Profile", "profile")
}

sealed class WholesalerTab(val route: String, val title: String, val iconName: String) {
    object Home : WholesalerTab("wholesaler_home", "Dashboard", "dashboard")
    object Inventory : WholesalerTab("wholesaler_inventory", "Inventory", "inventory")
    object AddProduct : WholesalerTab("wholesaler_add_product", "Add Product", "add")
    object Orders : WholesalerTab("wholesaler_orders", "Orders", "orders")
    object Profile : WholesalerTab("wholesaler_profile", "Business", "business")
}
