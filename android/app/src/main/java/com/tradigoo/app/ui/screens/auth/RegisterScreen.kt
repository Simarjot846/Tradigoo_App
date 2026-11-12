package com.tradigoo.app.ui.screens.auth

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
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
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
fun RegisterScreen(
    initialRole: UserRole,
    onNavigateBack: () -> Unit,
    onNavigateToLogin: () -> Unit,
    onRegisterSuccess: (UserRole) -> Unit,
    viewModel: AuthViewModel = viewModel()
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()

    var role by remember { mutableStateOf(initialRole) }
    var name by remember { mutableStateOf("") }
    var businessName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var location by remember { mutableStateOf("") }
    var gstin by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var isGoogleLoading by remember { mutableStateOf(false) }

    val isRetailer = role == UserRole.RETAILER
    val primaryColor = if (isRetailer) TradigooBlue else TradigooEmerald
    val gradient = if (isRetailer) TradigooBlueGradient else TradigooEmeraldGradient

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
                        role = role, // Always enforce the actively selected role on Register screen
                        name = event.name ?: name.ifBlank { null },
                        email = event.email ?: email.ifBlank { null },
                        businessName = businessName.ifBlank { null },
                        phone = phone.ifBlank { null },
                        location = location.ifBlank { "India" }
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
            onRegisterSuccess(uiState.user!!.role)
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
                title = "Create Account",
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

            // Interactive Role Selection Tabs (Allows user to toggle between Retailer and Wholesaler)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color(0xFFE2E8F0).copy(alpha = 0.6f))
                    .padding(4.dp),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                // Retailer Tab
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(12.dp))
                        .background(if (isRetailer) Color.White else Color.Transparent)
                        .clickable { role = UserRole.RETAILER }
                        .padding(vertical = 10.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "🏪 Retailer (Buyer)",
                        fontSize = 13.sp,
                        fontWeight = if (isRetailer) FontWeight.Bold else FontWeight.Medium,
                        color = if (isRetailer) TradigooBlue else TradigooTextSecondary
                    )
                }

                // Wholesaler Tab
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(12.dp))
                        .background(if (!isRetailer) Color.White else Color.Transparent)
                        .clickable { role = UserRole.WHOLESALER }
                        .padding(vertical = 10.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "🏭 Wholesaler (Seller)",
                        fontSize = 13.sp,
                        fontWeight = if (!isRetailer) FontWeight.Bold else FontWeight.Medium,
                        color = if (!isRetailer) TradigooEmeraldDark else TradigooTextSecondary
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = if (isRetailer) "Join Tradigoo Retail" else "Join Tradigoo Supplier",
                style = MaterialTheme.typography.displayMedium,
                color = TradigooTextPrimary,
                modifier = Modifier.fillMaxWidth(),
                fontSize = 24.sp
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = if (isRetailer) {
                    "Eliminate middlemen and buy directly with escrow protection."
                } else {
                    "Expand your wholesale network across India with guaranteed payouts."
                },
                fontSize = 14.sp,
                color = TradigooTextSecondary,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(20.dp))

            // Error Box
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

            // Google Registration CTA
            GoogleSignInButton(
                text = if (isRetailer) "Continue with Google as Retailer" else "Continue with Google as Wholesaler",
                isLoading = isGoogleLoading,
                onClick = {
                    viewModel.clearError()
                    isGoogleLoading = true
                    val client = GoogleAuthHelper.getGoogleSignInClient(context)
                    if (client != null) {
                        googleLauncher.launch(client.signInIntent)
                    } else {
                        GoogleAuthHelper.launchGoogleSignIn(context, role)
                    }
                }
            )

            Spacer(modifier = Modifier.height(20.dp))

            // Divider: or register with email
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                HorizontalDivider(modifier = Modifier.weight(1f), color = TradigooCardBorder)
                Text(
                    text = "  or register with email  ",
                    fontSize = 12.sp,
                    color = TradigooTextTertiary,
                    fontWeight = FontWeight.Medium
                )
                HorizontalDivider(modifier = Modifier.weight(1f), color = TradigooCardBorder)
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Full Name
            TradigooTextField(
                value = name,
                onValueChange = { name = it },
                label = if (isRetailer) "FULL NAME" else "OWNER / CONTACT NAME",
                placeholder = "e.g., Rajesh Sharma",
                leadingIcon = Icons.Default.Person
            )

            Spacer(modifier = Modifier.height(14.dp))

            // Business Name
            TradigooTextField(
                value = businessName,
                onValueChange = { businessName = it },
                label = "BUSINESS NAME",
                placeholder = if (isRetailer) "e.g., Sharma Kirana Store" else "e.g., Bharat Agro Processing Ltd",
                leadingIcon = Icons.Default.Business
            )

            Spacer(modifier = Modifier.height(14.dp))

            // Business Email
            TradigooTextField(
                value = email,
                onValueChange = { email = it },
                label = "BUSINESS EMAIL",
                placeholder = "rajesh@store.com",
                leadingIcon = Icons.Default.Email,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
            )

            Spacer(modifier = Modifier.height(14.dp))

            // Phone
            TradigooTextField(
                value = phone,
                onValueChange = { phone = it },
                label = "PHONE NUMBER",
                placeholder = "+91 98765 43210",
                leadingIcon = Icons.Default.Phone,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone)
            )

            Spacer(modifier = Modifier.height(14.dp))

            // Location
            TradigooTextField(
                value = location,
                onValueChange = { location = it },
                label = if (isRetailer) "BUSINESS CITY / LOCATION" else "FACTORY / WAREHOUSE ADDRESS",
                placeholder = if (isRetailer) "e.g., Jaipur, Rajasthan" else "e.g., MIDC Industrial Area, Nagpur",
                leadingIcon = Icons.Default.LocationOn
            )

            if (!isRetailer) {
                Spacer(modifier = Modifier.height(14.dp))

                // GSTIN for Wholesaler
                TradigooTextField(
                    value = gstin,
                    onValueChange = { gstin = it },
                    label = "GSTIN (OPTIONAL FOR PRE-VERIFICATION)",
                    placeholder = "27AAAAA0000A1Z5",
                    leadingIcon = Icons.Default.Verified
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Password
            TradigooTextField(
                value = password,
                onValueChange = { password = it },
                label = "PASSWORD (MIN. 6 CHARACTERS)",
                placeholder = "Create a secure password",
                leadingIcon = Icons.Default.Lock,
                visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                trailingIcon = {
                    IconButton(onClick = { passwordVisible = !passwordVisible }) {
                        Icon(
                            imageVector = if (passwordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                            contentDescription = "Toggle password visibility",
                            tint = TradigooTextSecondary
                        )
                    }
                },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Register CTA Button
            TradigooGradientButton(
                text = if (isRetailer) "Create Retailer Account" else "Create Wholesaler Account",
                gradient = gradient,
                isLoading = uiState.isLoading,
                onClick = {
                    viewModel.signUp(
                        email = email,
                        password = password,
                        name = name,
                        role = role,
                        businessName = businessName,
                        phone = phone,
                        location = location.ifEmpty { "India" }
                    )
                }
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Login Navigation
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Already registered on Tradigoo? ",
                    fontSize = 14.sp,
                    color = TradigooTextSecondary
                )
                Text(
                    text = "Sign in",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = primaryColor,
                    modifier = Modifier
                        .clickable { onNavigateToLogin() }
                        .padding(horizontal = 6.dp, vertical = 8.dp)
                )
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
