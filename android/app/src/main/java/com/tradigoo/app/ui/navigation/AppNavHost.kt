package com.tradigoo.app.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.tradigoo.app.domain.model.UserRole
import com.tradigoo.app.ui.screens.auth.ForgotPasswordScreen
import com.tradigoo.app.ui.screens.auth.LoginScreen
import com.tradigoo.app.ui.screens.auth.RegisterScreen
import com.tradigoo.app.ui.screens.employee.EmployeePortalScreen
import com.tradigoo.app.ui.screens.founder.FounderDashboardScreen
import com.tradigoo.app.ui.screens.onboarding.WelcomeScreen
import com.tradigoo.app.ui.screens.retailer.RetailerMainScreen
import com.tradigoo.app.ui.screens.role.RoleSelectionScreen
import com.tradigoo.app.ui.screens.splash.SplashScreen
import com.tradigoo.app.ui.screens.wholesaler.WholesalerMainScreen

@Composable
fun AppNavHost(
    modifier: Modifier = Modifier,
    navController: NavHostController = rememberNavController()
) {
    fun getDestinationForRole(role: UserRole): String {
        return when (role) {
            UserRole.FOUNDER -> Screen.FounderMain.route
            UserRole.EMPLOYEE -> Screen.EmployeeMain.route
            UserRole.WHOLESALER -> Screen.WholesalerMain.route
            else -> Screen.RetailerMain.route
        }
    }

    NavHost(
        navController = navController,
        startDestination = Screen.Splash.route,
        modifier = modifier
    ) {
        composable(Screen.Splash.route) {
            SplashScreen(
                onNavigateToWelcome = {
                    navController.navigate(Screen.Welcome.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                },
                onNavigateToRetailer = {
                    navController.navigate(Screen.RetailerMain.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                },
                onNavigateToWholesaler = {
                    navController.navigate(Screen.WholesalerMain.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                },
                onNavigateToEmployee = {
                    navController.navigate(Screen.EmployeeMain.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                },
                onNavigateToFounder = {
                    navController.navigate(Screen.FounderMain.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.Welcome.route) {
            WelcomeScreen(
                onNavigateToRoleSelection = {
                    navController.navigate(Screen.RoleSelection.route)
                },
                onNavigateToLogin = {
                    navController.navigate(Screen.Login.route)
                },
                onGoogleSignInSuccess = { role ->
                    val destination = getDestinationForRole(role)
                    navController.navigate(destination) {
                        popUpTo(Screen.Welcome.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.RoleSelection.route) {
            RoleSelectionScreen(
                onNavigateBack = { navController.popBackStack() },
                onRoleSelected = { role ->
                    navController.navigate(Screen.Register.createRoute(role.value))
                }
            )
        }

        composable(Screen.Login.route) {
            LoginScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToRegister = {
                    navController.navigate(Screen.RoleSelection.route)
                },
                onNavigateToForgotPassword = {
                    navController.navigate(Screen.ForgotPassword.route)
                },
                onLoginSuccess = { role ->
                    val destination = getDestinationForRole(role)
                    navController.navigate(destination) {
                        popUpTo(Screen.Welcome.route) { inclusive = true }
                    }
                }
            )
        }

        composable(
            route = Screen.Register.route,
            arguments = listOf(navArgument("role") { type = NavType.StringType; defaultValue = "retailer" })
        ) { backStackEntry ->
            val roleStr = backStackEntry.arguments?.getString("role") ?: "retailer"
            val role = UserRole.fromString(roleStr)

            RegisterScreen(
                initialRole = role,
                onNavigateBack = { navController.popBackStack() },
                onNavigateToLogin = {
                    navController.navigate(Screen.Login.route)
                },
                onRegisterSuccess = { userRole ->
                    val destination = getDestinationForRole(userRole)
                    navController.navigate(destination) {
                        popUpTo(Screen.Welcome.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.ForgotPassword.route) {
            ForgotPasswordScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // Retailer Main View
        composable(Screen.RetailerMain.route) {
            RetailerMainScreen(
                onLogout = {
                    navController.navigate(Screen.Welcome.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        // Wholesaler Main View
        composable(Screen.WholesalerMain.route) {
            WholesalerMainScreen(
                onLogout = {
                    navController.navigate(Screen.Welcome.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        // Employee Operations Portal
        composable(Screen.EmployeeMain.route) {
            EmployeePortalScreen(
                onLogout = {
                    navController.navigate(Screen.Welcome.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        // Founder Console
        composable(Screen.FounderMain.route) {
            FounderDashboardScreen(
                onPreviewRetailer = {
                    navController.navigate("retailer_preview")
                },
                onPreviewWholesaler = {
                    navController.navigate("wholesaler_preview")
                },
                onOpenEmployeePortal = {
                    navController.navigate(Screen.EmployeeMain.route)
                },
                onLogout = {
                    navController.navigate(Screen.Welcome.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        // Administrative Previews for Founder
        composable("retailer_preview") {
            RetailerMainScreen(
                isPreview = true,
                onExitPreview = { navController.popBackStack() },
                onLogout = {
                    navController.navigate(Screen.Welcome.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        composable("wholesaler_preview") {
            WholesalerMainScreen(
                isPreview = true,
                onExitPreview = { navController.popBackStack() },
                onLogout = {
                    navController.navigate(Screen.Welcome.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }
    }
}
