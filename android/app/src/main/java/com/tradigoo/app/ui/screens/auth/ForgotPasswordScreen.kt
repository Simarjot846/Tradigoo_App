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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tradigoo.app.R
import com.tradigoo.app.ui.components.TradigooGradientButton
import com.tradigoo.app.ui.components.TradigooTextField
import com.tradigoo.app.ui.components.TradigooTopBar
import com.tradigoo.app.ui.theme.*

@Composable
fun ForgotPasswordScreen(
    onNavigateBack: () -> Unit
) {
    var email by remember { mutableStateOf("") }
    var submitted by remember { mutableStateOf(false) }

    val scrollState = rememberScrollState()

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
                .verticalScroll(scrollState)
                .padding(horizontal = 24.dp, vertical = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(4.dp))

            // Transparent Official Full Tradigoo Logo (Sharp, proportion-preserved, centered)
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

            Spacer(modifier = Modifier.height(28.dp))

            if (submitted) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(TradigooEmeraldBg)
                        .padding(18.dp)
                ) {
                    Column {
                        Text(
                            text = "✅ Link Sent Successfully",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = TradigooEmeraldDark
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "A password recovery email has been dispatched to $email. Please check your inbox and spam folders.",
                            fontSize = 13.sp,
                            color = TradigooEmeraldDark
                        )
                    }
                }
            } else {
                TradigooTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = "REGISTERED EMAIL",
                    placeholder = "name@company.com",
                    leadingIcon = Icons.Default.Email,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
                )

                Spacer(modifier = Modifier.height(24.dp))

                TradigooGradientButton(
                    text = "Send Reset Link",
                    onClick = {
                        if (email.isNotBlank()) {
                            submitted = true
                        }
                    }
                )
            }
        }
    }
}
