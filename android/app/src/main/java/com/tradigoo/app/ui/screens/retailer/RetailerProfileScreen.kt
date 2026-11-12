package com.tradigoo.app.ui.screens.retailer

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
fun RetailerProfileScreen(
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
        // User Profile Header Card
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
                        .background(TradigooBrandGradient),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = (user?.name?.take(2) ?: "RP").uppercase(),
                        color = Color.White,
                        fontSize = 26.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = user?.name ?: "Retail Partner",
                    fontSize = 19.sp,
                    fontWeight = FontWeight.Bold,
                    color = TradigooTextPrimary
                )

                Text(
                    text = if (!user?.businessName.isNullOrBlank()) user!!.businessName else "Verified Retail Store",
                    fontSize = 14.sp,
                    color = TradigooTextSecondary
                )

                Spacer(modifier = Modifier.height(8.dp))

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(TradigooBlueBg)
                        .border(1.dp, TradigooBlue.copy(alpha = 0.2f), RoundedCornerShape(20.dp))
                        .padding(horizontal = 12.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "🏪 Registered Retailer",
                        color = TradigooBlue,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Trust Score Section
        if (user != null && user.totalOrders > 0) {
            GreenScoreMeter(
                score = user.trustScore,
                label = "Retailer Credibility & Reliability Rating"
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
                        text = "Trust Rating",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = TradigooTextPrimary
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Trust score is calculated automatically based on genuine completed consignments and successful inspections.",
                        fontSize = 13.sp,
                        color = TradigooTextSecondary
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Account Details Section (No fake phone numbers or fake addresses)
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = TradigooSurface),
            border = androidx.compose.foundation.BorderStroke(1.dp, TradigooCardBorder)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Genuine Business Information",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = TradigooTextPrimary
                )

                Spacer(modifier = Modifier.height(12.dp))

                ProfileDetailRow(label = "Registered Email", value = user?.email ?: "Not Available")
                HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp), color = TradigooCardBorder.copy(alpha = 0.5f))
                ProfileDetailRow(label = "Contact Phone", value = if (!user?.phone.isNullOrBlank()) user!!.phone!! else "Pending Profile Completion")
                HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp), color = TradigooCardBorder.copy(alpha = 0.5f))
                ProfileDetailRow(label = "Trading Region", value = if (!user?.location.isNullOrBlank()) user!!.location else "India")
                HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp), color = TradigooCardBorder.copy(alpha = 0.5f))
                ProfileDetailRow(label = "Fulfillment Currency", value = "Indian Rupee (INR ₹)")
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Logout Button
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
