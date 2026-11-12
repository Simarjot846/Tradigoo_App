package com.tradigoo.app.ui.screens.wholesaler

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tradigoo.app.domain.model.User
import com.tradigoo.app.ui.components.GreenScoreMeter
import com.tradigoo.app.ui.components.TradigooOutlineButton
import com.tradigoo.app.ui.theme.*

@Composable
fun WholesalerProfileScreen(
    user: User?,
    onLogout: () -> Unit
) {
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(TradigooBackground)
            .verticalScroll(scrollState)
            .padding(16.dp)
    ) {
        // Wholesaler Profile Header Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = TradigooSurface),
            border = androidx.compose.foundation.BorderStroke(1.dp, TradigooCardBorder)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .size(68.dp)
                        .clip(CircleShape)
                        .background(TradigooEmeraldGradient),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = (user?.name?.take(2) ?: "WP").uppercase(),
                        color = Color.White,
                        fontSize = 26.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = user?.name ?: "Wholesale Partner",
                    fontSize = 19.sp,
                    fontWeight = FontWeight.Bold,
                    color = TradigooTextPrimary
                )

                Text(
                    text = if (!user?.businessName.isNullOrBlank()) user!!.businessName else "Registered Supplier Facility",
                    fontSize = 14.sp,
                    color = TradigooTextSecondary
                )

                Spacer(modifier = Modifier.height(8.dp))

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(TradigooEmeraldBg)
                        .border(1.dp, TradigooEmerald.copy(alpha = 0.3f), RoundedCornerShape(20.dp))
                        .padding(horizontal = 12.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "🏭 Verified Wholesaler & Supplier",
                        color = TradigooEmeraldDark,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Wholesaler Credibility Meter (Real score or empty state)
        if (user != null && user.totalOrders > 0) {
            GreenScoreMeter(
                score = user.trustScore,
                label = "Supplier Credibility & ESG Green Rating"
            )
        } else {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = TradigooSurface),
                border = androidx.compose.foundation.BorderStroke(1.dp, TradigooCardBorder)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Trust & Reliability Score",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = TradigooTextPrimary
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Your supplier trust score will be calculated dynamically based on real fulfillment track record, on-time dispatches, and resolution history.",
                        fontSize = 13.sp,
                        color = TradigooTextSecondary
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Business Credentials (Real data)
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = TradigooSurface),
            border = androidx.compose.foundation.BorderStroke(1.dp, TradigooCardBorder)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Enterprise Supplier Details",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = TradigooTextPrimary
                )

                Spacer(modifier = Modifier.height(12.dp))

                ProfileDetailRow(label = "Official Email", value = user?.email ?: "Not Available")
                HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp), color = TradigooCardBorder.copy(alpha = 0.5f))
                ProfileDetailRow(label = "Contact Phone", value = if (!user?.phone.isNullOrBlank()) user!!.phone!! else "Pending Verification")
                HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp), color = TradigooCardBorder.copy(alpha = 0.5f))
                ProfileDetailRow(label = "Facility Location", value = if (!user?.location.isNullOrBlank()) user!!.location else "India")
                HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp), color = TradigooCardBorder.copy(alpha = 0.5f))
                ProfileDetailRow(label = "Verification Status", value = "GST & Business Compliance Pending Review")
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        TradigooOutlineButton(
            text = "Sign Out from Tradigoo",
            onClick = onLogout
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Tradigoo Native Android Edition • Production Architecture",
            fontSize = 11.sp,
            color = TradigooTextTertiary,
            modifier = Modifier.fillMaxWidth(),
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )
    }
}

@Composable
private fun ProfileDetailRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = label, fontSize = 13.sp, color = TradigooTextSecondary)
        Text(text = value, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TradigooTextPrimary)
    }
}
