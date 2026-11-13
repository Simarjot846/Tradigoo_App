package com.tradigoo.app.ui.screens.auth

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.tradigoo.app.R
import com.tradigoo.app.ui.components.TradigooGradientButton
import com.tradigoo.app.ui.components.TradigooOutlineButton
import com.tradigoo.app.ui.components.TradigooTextField
import com.tradigoo.app.ui.components.TradigooTopBar
import com.tradigoo.app.ui.theme.*

@Composable
fun ForgotPasswordScreen(
    onNavigateBack: () -> Unit,
    viewModel: AuthViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var email by remember { mutableStateOf("") }
    val scrollState = rememberScrollState()

    DisposableEffect(Unit) {
        onDispose { viewModel.clearResetState() }
    }

    Scaffold(
        topBar = {
            TradigooTopBar(
                title = "Reset Password",
                canNavigateBack = true,
                onNavigateBack = onNavigateBack
            )
        },
        contentWindowInsets = WindowInsets.safeDrawing,
        containerColor = TradigooBackground
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .imePadding()
                .verticalScroll(scrollState)
                .padding(horizontal = 24.dp, vertical = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(4.dp))

            Image(
                painter = painterResource(id = R.drawable.logo_tradigoo),
                contentDescription = "Tradigoo",
                modifier = Modifier
                    .fillMaxWidth(0.55f)
                    .height(44.dp)
                    .padding(vertical = 2.dp),
                contentScale = ContentScale.Fit
            )

            Spacer(modifier = Modifier.height(18.dp))

            Text(
                text = "Forgot Password?",
                style = MaterialTheme.typography.displayMedium,
                color = TradigooTextPrimary,
                modifier = Modifier.fillMaxWidth(),
                fontSize = 24.sp
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "Enter your registered business email and we will send you secure password reset instructions.",
                fontSize = 14.sp,
                color = TradigooTextSecondary,
                lineHeight = 20.sp
            )

            Spacer(modifier = Modifier.height(24.dp))

            if (uiState.error != null) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(StatusErrorBg)
                        .padding(14.dp)
                ) {
                    Text(
                        text = uiState.error!!,
                        color = StatusError,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
                Spacer(modifier = Modifier.height(16.dp))
            }

            if (uiState.resetSuccess) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(TradigooEmeraldBg)
                        .padding(18.dp)
                ) {
                    Column {
                        Text(
                            text = "Reset Email Dispatched",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = TradigooEmeraldDark
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = uiState.resetMessage ?: "Please check your inbox and spam folder for the password reset link.",
                            fontSize = 13.sp,
                            color = TradigooEmeraldDark
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                TradigooOutlineButton(
                    text = "Back to Sign In",
                    onClick = onNavigateBack
                )
            } else {
                TradigooTextField(
                    value = email,
                    onValueChange = {
                        email = it
                        viewModel.clearError()
                    },
                    label = "REGISTERED EMAIL",
                    placeholder = "name@company.com",
                    leadingIcon = Icons.Default.Email,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
                )

                Spacer(modifier = Modifier.height(24.dp))

                TradigooGradientButton(
                    text = "Send Reset Link",
                    isLoading = uiState.isLoading,
                    onClick = { viewModel.resetPassword(email) }
                )
            }
        }
    }
}
