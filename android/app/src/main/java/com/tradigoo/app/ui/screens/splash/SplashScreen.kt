package com.tradigoo.app.ui.screens.splash

import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.scale
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tradigoo.app.R
import com.tradigoo.app.data.local.SessionManager
import com.tradigoo.app.domain.model.UserRole
import com.tradigoo.app.ui.theme.*
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(
    onNavigateToWelcome: () -> Unit,
    onNavigateToRetailer: () -> Unit,
    onNavigateToWholesaler: () -> Unit,
    onNavigateToEmployee: () -> Unit,
    onNavigateToFounder: () -> Unit
) {
    val context = LocalContext.current
    val sessionManager = remember { SessionManager.getInstance(context) }

    var startAnimation by remember { mutableStateOf(false) }

    val scale by animateFloatAsState(
        targetValue = if (startAnimation) 1.0f else 0.85f,
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessLow
        ),
        label = "logo_scale"
    )

    val alpha by animateFloatAsState(
        targetValue = if (startAnimation) 1.0f else 0.0f,
        animationSpec = tween(durationMillis = 800),
        label = "logo_alpha"
    )

    LaunchedEffect(key1 = true) {
        startAnimation = true
        delay(1800)

        if (sessionManager.isLoggedIn()) {
            val role = sessionManager.getUserRole()
            when (role) {
                UserRole.FOUNDER -> onNavigateToFounder()
                UserRole.EMPLOYEE -> onNavigateToEmployee()
                UserRole.WHOLESALER -> onNavigateToWholesaler()
                else -> onNavigateToRetailer()
            }
        } else {
            onNavigateToWelcome()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(TradigooBackground),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier
                .scale(scale)
                .alpha(alpha)
                .padding(32.dp)
        ) {
            // Official Tradigoo App Icon (Transparent symbol)
            Image(
                painter = painterResource(id = R.drawable.ic_tradigoo_app_icon),
                contentDescription = "Tradigoo",
                modifier = Modifier.size(92.dp),
                contentScale = ContentScale.Fit
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Official Full Tradigoo Logo (Transparent)
            Image(
                painter = painterResource(id = R.drawable.logo_tradigoo),
                contentDescription = "Tradigoo",
                modifier = Modifier
                    .width(180.dp)
                    .height(42.dp),
                contentScale = ContentScale.Fit
            )

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "Smarter Sourcing. Safer Transactions.",
                fontSize = 13.5.sp,
                fontWeight = FontWeight.Medium,
                color = TradigooTextSecondary,
                letterSpacing = 0.2.sp
            )
        }

        // Bottom Trust Badge
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .navigationBarsPadding()
                .padding(bottom = 24.dp)
                .alpha(alpha)
        ) {
            Text(
                text = "🛡️ Escrow-Protected B2B Wholesale Platform",
                fontSize = 12.sp,
                color = TradigooTextTertiary,
                fontWeight = FontWeight.Medium
            )
        }
    }
}
