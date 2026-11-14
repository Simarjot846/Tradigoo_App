package com.tradigoo.app.ui.screens.onboarding

import android.app.Activity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.tradigoo.app.R
import com.tradigoo.app.data.auth.GoogleAuthEvent
import com.tradigoo.app.data.auth.GoogleAuthHelper
import com.tradigoo.app.domain.model.UserRole
import com.tradigoo.app.ui.components.GoogleSignInButton
import com.tradigoo.app.ui.components.TradigooGradientButton
import com.tradigoo.app.ui.components.TradigooOutlineButton
import com.tradigoo.app.ui.screens.auth.AuthViewModel
import com.tradigoo.app.ui.theme.*

@Composable
fun WelcomeScreen(
    onNavigateToRoleSelection: () -> Unit,
    onNavigateToLogin: () -> Unit,
    onGoogleSignInSuccess: (UserRole) -> Unit = {},
    viewModel: AuthViewModel = viewModel()
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()
    val scrollState = rememberScrollState()

    var isGoogleLoading by remember { mutableStateOf(false) }
    var localError by remember { mutableStateOf<String?>(null) }

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
                        refreshToken = event.refreshToken,
                        expiresAt = event.expiresAt,
                        role = event.role,
                        name = event.name,
                        email = event.email
                    )
                }
                is GoogleAuthEvent.Error -> {
                    isGoogleLoading = false
                    localError = event.message
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
            onGoogleSignInSuccess(uiState.user!!.role)
        }
    }

    LaunchedEffect(uiState.error) {
        if (uiState.error != null) {
            isGoogleLoading = false
            localError = uiState.error
        }
    }

    Scaffold(
        containerColor = TradigooBackground,
        contentWindowInsets = WindowInsets.safeDrawing,
        bottomBar = {
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .navigationBarsPadding(),
                color = TradigooBackground,
                tonalElevation = 2.dp,
                shadowElevation = 0.dp
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp)
                        .padding(top = 8.dp, bottom = 14.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    TradigooGradientButton(
                        text = "Get Started",
                        onClick = onNavigateToRoleSelection
                    )

                    GoogleSignInButton(
                        text = "Continue with Google",
                        isLoading = isGoogleLoading,
                        onClick = {
                            localError = null
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

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Already have an account? ",
                            fontSize = 14.sp,
                            color = TradigooTextSecondary
                        )
                        Text(
                            text = "Sign In",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = TradigooGoldDark,
                            modifier = Modifier
                                .clickable { onNavigateToLogin() }
                                .padding(horizontal = 4.dp, vertical = 6.dp)
                        )
                    }

                    Text(
                        text = "By continuing, you agree to Tradigoo's Terms of Trade and Escrow Policy.",
                        fontSize = 11.sp,
                        color = TradigooTextTertiary,
                        textAlign = TextAlign.Center,
                        lineHeight = 15.sp,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 2.dp)
                    )
                }
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(scrollState)
                .padding(horizontal = 24.dp, vertical = 12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(12.dp))

            Image(
                painter = painterResource(id = R.drawable.logo_tradigoo),
                contentDescription = "Tradigoo",
                modifier = Modifier
                    .fillMaxWidth(0.68f)
                    .height(48.dp)
                    .padding(vertical = 2.dp),
                contentScale = ContentScale.Fit
            )

            Spacer(modifier = Modifier.height(18.dp))

            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .background(TradigooGoldBg)
                    .border(1.dp, TradigooGold.copy(alpha = 0.35f), RoundedCornerShape(20.dp))
                    .padding(horizontal = 14.dp, vertical = 6.dp)
            ) {
                Text(
                    text = "Direct Factory-to-Retail OS",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = TradigooNavy
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Welcome to Tradigoo",
                style = MaterialTheme.typography.displayMedium,
                color = TradigooTextPrimary,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "Smarter sourcing starts here.",
                fontSize = 17.sp,
                fontWeight = FontWeight.SemiBold,
                color = TradigooNavy,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "Discover trusted suppliers, source products confidently and manage your business purchases with automated escrow protection.",
                fontSize = 14.5.sp,
                lineHeight = 22.sp,
                color = TradigooTextSecondary,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = 12.dp)
            )

            if (localError != null) {
                Spacer(modifier = Modifier.height(14.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(StatusErrorBg)
                        .padding(12.dp)
                ) {
                    Text(
                        text = "⚠️ $localError",
                        color = StatusError,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Verified Feature Card (Backed by genuine platform features)
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(22.dp))
                    .border(1.dp, TradigooCardBorder, RoundedCornerShape(22.dp)),
                colors = CardDefaults.cardColors(containerColor = TradigooSurface),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(18.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(42.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(TradigooEmeraldBg),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(text = "🛡️", fontSize = 20.sp)
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "Escrow Protected Payments",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = TradigooTextPrimary
                            )
                            Text(
                                text = "Funds held securely until inspection completes",
                                fontSize = 12.sp,
                                color = TradigooEmerald
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        QuickMetricBadge(label = "Secure Escrow", value = "Protected", modifier = Modifier.weight(1f))
                        QuickMetricBadge(label = "Inspection", value = "QR & OTP", modifier = Modifier.weight(1f))
                        QuickMetricBadge(label = "Direct Sourcing", value = "Zero Middlemen", modifier = Modifier.weight(1f))
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}

@Composable
private fun QuickMetricBadge(
    label: String,
    value: String,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(TradigooBackground)
            .border(1.dp, TradigooCardBorder, RoundedCornerShape(12.dp))
            .padding(vertical = 10.dp, horizontal = 6.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = value,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = TradigooTextPrimary,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = label,
                fontSize = 10.sp,
                color = TradigooTextSecondary,
                fontWeight = FontWeight.Medium,
                textAlign = TextAlign.Center
            )
        }
    }
}
