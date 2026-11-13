package com.tradigoo.app.ui.screens.role

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tradigoo.app.data.local.SessionManager
import com.tradigoo.app.domain.model.UserRole
import com.tradigoo.app.ui.components.RoleCard
import com.tradigoo.app.ui.components.TradigooGradientButton
import com.tradigoo.app.ui.components.TradigooTopBar
import com.tradigoo.app.ui.theme.*

@Composable
fun RoleSelectionScreen(
    onNavigateBack: () -> Unit,
    onRoleSelected: (UserRole) -> Unit
) {
    val context = LocalContext.current
    val sessionManager = remember { SessionManager.getInstance(context) }
    var selectedRole by remember { mutableStateOf(sessionManager.getSelectedRole()) }

    val scrollState = rememberScrollState()

    Scaffold(
        topBar = {
            TradigooTopBar(
                title = "Select Business Profile",
                canNavigateBack = true,
                onNavigateBack = onNavigateBack
            )
        },
        contentWindowInsets = WindowInsets.safeDrawing,
        bottomBar = {
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .navigationBarsPadding(),
                color = TradigooSurface,
                shadowElevation = 8.dp
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 14.dp)
                ) {
                    TradigooGradientButton(
                        text = if (selectedRole == UserRole.RETAILER) "Register as Retailer →" else "Register as Wholesaler →",
                        gradient = if (selectedRole == UserRole.RETAILER) TradigooBrandGradient else TradigooEmeraldGradient,
                        onClick = {
                            sessionManager.saveSelectedRole(selectedRole)
                            onRoleSelected(selectedRole)
                        }
                    )
                }
            }
        },
        containerColor = TradigooBackground
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(scrollState)
                .padding(20.dp)
        ) {
            Text(
                text = "How would you like to use Tradigoo?",
                style = MaterialTheme.typography.displayMedium,
                color = TradigooTextPrimary,
                fontSize = 24.sp
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "Choose your operating model. Your dashboard, pricing features and order workflow will be customized for your role.",
                fontSize = 14.sp,
                color = TradigooTextSecondary,
                lineHeight = 20.sp
            )

            Spacer(modifier = Modifier.height(22.dp))

            // Card 1: Retailer
            RoleCard(
                role = UserRole.RETAILER,
                isSelected = selectedRole == UserRole.RETAILER,
                onSelect = { selectedRole = UserRole.RETAILER }
            )

            Spacer(modifier = Modifier.height(18.dp))

            // Card 2: Wholesaler
            RoleCard(
                role = UserRole.WHOLESALER,
                isSelected = selectedRole == UserRole.WHOLESALER,
                onSelect = { selectedRole = UserRole.WHOLESALER }
            )

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
