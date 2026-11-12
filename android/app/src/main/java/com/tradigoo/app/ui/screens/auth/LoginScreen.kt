package com.tradigoo.app.ui.screens.auth

import android.app.Activity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.tradigoo.app.R
import com.tradigoo.app.data.auth.GoogleAuthEvent
import com.tradigoo.app.data.auth.GoogleAuthHelper
import com.tradigoo.app.domain.model.UserRole
import com.tradigoo.app.ui.components.GoogleSignInButton
import com.tradigoo.app.ui.components.TradigooGradientButton
import com.tradigoo.app.ui.components.TradigooTextField
import com.tradigoo.app.ui.components.TradigooTopBar
import com.tradigoo.app.ui.theme.*

@Composable
fun LoginScreen(
    onNavigateBack: () -> Unit,
    onNavigateToRegister: () -> Unit,
    onNavigateToForgotPassword: () -> Unit,
    onLoginSuccess: (UserRole) -> Unit,
    viewModel: AuthViewModel = viewModel()
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()

    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var rememberMe by remember { mutableStateOf(true) }
    var isGoogleLoading by remember { mutableStateOf(false) }

    val scrollState = rememberScrollState()

    // Google Sign-In Activity Launcher for Play Services flow
    val googleLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            GoogleAuthHelper.handleSignInResult(result.data, context)
        } else {
            isGoogleLoading = false
        }
    }

    // Observe global Google Auth Events (from Play Services or OAuth deep links)
    LaunchedEffect(Unit) {
        GoogleAuthHelper.events.collect { event ->
            when (event) {
                is GoogleAuthEvent.Success -> {
                    isGoogleLoading = true
                    viewModel.signInWithGoogle(
                        idToken = event.idToken,
                        accessToken = event.accessToken,
                        role = event.role,
                        name = event.name,
                        email = event.email
                    )
                }
                is GoogleAuthEvent.Error -> {
                    isGoogleLoading = false
                }
                is GoogleAuthEvent.Cancelled -> {
                    isGoogleLoading = false
                }
            }
        }
    }

    LaunchedEffect(uiState.isSuccess, uiState.user) {
        if (uiState.isSuccess && uiState.user != null) {
            isGoogleLoading = false
            onLoginSuccess(uiState.user!!.role)
        }
    }

    LaunchedEffect(uiState.error) {
        if (uiState.error != null) {
            isGoogleLoading = false
        }
    }

    Scaffold(
        topBar = {
            TradigooTopBar(
                title = "Sign In",
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
                .verticalScroll(scrollState)
                .padding(horizontal = 24.dp, vertical = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(4.dp))

            // Transparent Official Full Tradigoo Logo (Sharp, proportion-preserved, perfectly centered)
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
                text = "Welcome back",
                style = MaterialTheme.typography.displayMedium,
                color = TradigooTextPrimary,
                modifier = Modifier.fillMaxWidth(),
                fontSize = 26.sp
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = "Sign in to access your B2B transactions & orders.",
                fontSize = 14.sp,
                color = TradigooTextSecondary,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(22.dp))

            // Error Card
            if (uiState.error != null) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(StatusErrorBg)
                        .padding(14.dp)
                ) {
                    Text(
                        text = "⚠️ " + uiState.error!!,
                        color = StatusError,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
                Spacer(modifier = Modifier.height(16.dp))
            }

            // Google Sign In CTA
            GoogleSignInButton(
                text = "Continue with Google",
                isLoading = isGoogleLoading,
                onClick = {
                    viewModel.clearError()
                    isGoogleLoading = true
                    val role = viewModel.getSelectedRole()
                    val client = GoogleAuthHelper.getGoogleSignInClient(context)
                    if (client != null) {
                        googleLauncher.launch(client.signInIntent)
                    } else {
                        GoogleAuthHelper.launchGoogleSignIn(context, role)
                    }
                }
            )

            Spacer(modifier = Modifier.height(20.dp))

            // Divider: or continue with email
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                HorizontalDivider(modifier = Modifier.weight(1f), color = TradigooCardBorder)
                Text(
                    text = "  or continue with email  ",
                    fontSize = 12.sp,
                    color = TradigooTextTertiary,
                    fontWeight = FontWeight.Medium
                )
                HorizontalDivider(modifier = Modifier.weight(1f), color = TradigooCardBorder)
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Email input
            TradigooTextField(
                value = email,
                onValueChange = {
                    email = it
                    viewModel.clearError()
                },
                label = "EMAIL ADDRESS",
                placeholder = "name@business.com",
                leadingIcon = Icons.Default.Email,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Password input
            TradigooTextField(
                value = password,
                onValueChange = {
                    password = it
                    viewModel.clearError()
                },
                label = "PASSWORD",
                placeholder = "Enter your password",
                leadingIcon = Icons.Default.Lock,
                visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                trailingIcon = {
                    IconButton(onClick = { passwordVisible = !passwordVisible }) {
                        Icon(
                            imageVector = if (passwordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                            contentDescription = if (passwordVisible) "Hide password" else "Show password",
                            tint = TradigooTextSecondary
                        )
                    }
                },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Remember Me and Forgot Password row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(
                        checked = rememberMe,
                        onCheckedChange = { rememberMe = it },
                        colors = CheckboxDefaults.colors(checkedColor = TradigooBlue)
                    )
                    Text(
                        text = "Remember me",
                        fontSize = 13.sp,
                        color = TradigooTextSecondary
                    )
                }

                Text(
                    text = "Forgot password?",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = TradigooBlue,
                    modifier = Modifier
                        .clickable { onNavigateToForgotPassword() }
                        .padding(horizontal = 6.dp, vertical = 8.dp)
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Login Button
            TradigooGradientButton(
                text = "Sign In to Tradigoo",
                isLoading = uiState.isLoading,
                onClick = { viewModel.signIn(email, password) }
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Quick Demo Credentials Picker
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = TradigooSurface),
                shape = RoundedCornerShape(16.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, TradigooCardBorder)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "⚡ Quick Demo Logins",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = TradigooTextSecondary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = {
                                email = "retailer@tradigoo.com"
                                password = "password123"
                            },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text(text = "Retailer", fontSize = 12.sp)
                        }

                        OutlinedButton(
                            onClick = {
                                email = "wholesaler@tradigoo.com"
                                password = "password123"
                            },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text(text = "Wholesaler", fontSize = 12.sp)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            // Register Navigation
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Don't have an account yet? ",
                    fontSize = 14.sp,
                    color = TradigooTextSecondary
                )
                Text(
                    text = "Register here",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = TradigooBlue,
                    modifier = Modifier
                        .clickable { onNavigateToRegister() }
                        .padding(horizontal = 6.dp, vertical = 8.dp)
                )
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
