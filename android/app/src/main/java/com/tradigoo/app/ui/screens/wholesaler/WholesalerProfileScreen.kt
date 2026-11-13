package com.tradigoo.app.ui.screens.wholesaler

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tradigoo.app.data.api.ApiTrustScoreResponse
import com.tradigoo.app.domain.model.User
import com.tradigoo.app.ui.components.GreenScoreMeter
import com.tradigoo.app.ui.components.TradigooOutlineButton
import com.tradigoo.app.ui.theme.*

@Composable
fun WholesalerProfileScreen(
    user: User?,
    trustScore: ApiTrustScoreResponse?,
    isSavingProfile: Boolean = false,
    onUpdateProfile: (
        name: String,
        phone: String?,
        businessName: String,
        location: String,
        gstNumber: String?,
        businessAddress: String?,
        pinCode: String?,
        onSaved: () -> Unit
    ) -> Unit,
    onLogout: () -> Unit
) {
    val scrollState = rememberScrollState()
    var showEditDialog by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(TradigooBackground)
            .verticalScroll(scrollState)
            .padding(16.dp)
    ) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = TradigooSurface),
            border = BorderStroke(1.dp, TradigooCardBorder)
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
                        .background(TradigooBrandGradient)
                        .border(2.dp, TradigooGold, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = (user?.name?.take(2) ?: "WP").uppercase(),
                        color = TradigooGoldLight,
                        fontSize = 24.sp,
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
                    text = user?.businessName?.takeIf { it.isNotBlank() } ?: "Registered Supplier Facility",
                    fontSize = 14.sp,
                    color = TradigooTextSecondary
                )

                Spacer(modifier = Modifier.height(8.dp))

                val gstBadgeBg = if (user?.gstVerified == true) TradigooEmeraldBg else TradigooGoldBg
                val gstBadgeFg = if (user?.gstVerified == true) TradigooEmeraldDark else TradigooNavy
                val gstBadgeBorder = if (user?.gstVerified == true) TradigooEmerald.copy(alpha = 0.35f) else TradigooGold.copy(alpha = 0.4f)

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(gstBadgeBg)
                        .border(1.dp, gstBadgeBorder, RoundedCornerShape(20.dp))
                        .padding(horizontal = 12.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = if (user?.gstVerified == true) "GST Verified Supplier" else "Wholesaler & Supplier",
                        color = gstBadgeFg,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        val hasTrustData = trustScore?.hasEnoughData ?: ((user?.totalOrders ?: 0) >= 3)
        GreenScoreMeter(
            score = trustScore?.score ?: if (hasTrustData) user?.trustScore else null,
            hasEnoughData = hasTrustData,
            badgeText = trustScore?.label,
            subtitleText = trustScore?.explanation,
            label = "Supplier Credibility & Reliability Rating"
        )

        Spacer(modifier = Modifier.height(18.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = TradigooSurface),
            border = BorderStroke(1.dp, TradigooCardBorder)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Enterprise Supplier Details",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = TradigooTextPrimary
                    )
                    TextButton(onClick = { showEditDialog = true }) {
                        Icon(Icons.Default.Edit, contentDescription = null, modifier = Modifier.size(15.dp), tint = TradigooNavy)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Edit", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = TradigooNavy)
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                ProfileDetailRow(label = "Official Email", value = user?.email ?: "Not Available")
                HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp), color = TradigooCardBorder.copy(alpha = 0.5f))
                ProfileDetailRow(
                    label = "Contact Phone",
                    value = user?.phone?.takeIf { it.isNotBlank() } ?: "Not Added"
                )
                HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp), color = TradigooCardBorder.copy(alpha = 0.5f))
                ProfileDetailRow(
                    label = "Facility Location",
                    value = user?.location?.takeIf { it.isNotBlank() } ?: "India"
                )
                HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp), color = TradigooCardBorder.copy(alpha = 0.5f))
                ProfileDetailRow(
                    label = "GSTIN",
                    value = user?.gstNumber?.takeIf { it.isNotBlank() } ?: "Not Provided"
                )
                HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp), color = TradigooCardBorder.copy(alpha = 0.5f))
                ProfileDetailRow(
                    label = "GST Compliance",
                    value = when {
                        user?.gstVerified == true -> "Verified"
                        !user?.gstNumber.isNullOrBlank() -> "Submitted (Under Review)"
                        else -> "GSTIN Not Added"
                    }
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        TradigooOutlineButton(
            text = "Sign Out from Tradigoo",
            onClick = onLogout
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Tradigoo B2B Wholesale • India",
            fontSize = 11.sp,
            color = TradigooTextTertiary,
            modifier = Modifier.fillMaxWidth(),
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(88.dp))
    }

    if (showEditDialog) {
        var editName by remember { mutableStateOf(user?.name ?: "") }
        var editPhone by remember { mutableStateOf(user?.phone ?: "") }
        var editBusiness by remember { mutableStateOf(user?.businessName ?: "") }
        var editLocation by remember { mutableStateOf(user?.location ?: "") }
        var editGstin by remember { mutableStateOf(user?.gstNumber ?: "") }
        var editAddress by remember { mutableStateOf(user?.businessAddress ?: "") }
        var editPin by remember { mutableStateOf(user?.pinCode ?: "") }

        AlertDialog(
            onDismissRequest = { showEditDialog = false },
            title = { Text("Edit Supplier Profile", fontWeight = FontWeight.Bold) },
            text = {
                Column(
                    modifier = Modifier.verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = editName,
                        onValueChange = { editName = it },
                        label = { Text("Full Name") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = editBusiness,
                        onValueChange = { editBusiness = it },
                        label = { Text("Business / Mill Name") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = editPhone,
                        onValueChange = { editPhone = it },
                        label = { Text("Phone Number") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = editLocation,
                        onValueChange = { editLocation = it },
                        label = { Text("City / State") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = editGstin,
                        onValueChange = { editGstin = it.uppercase() },
                        label = { Text("GSTIN (15-Char)") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = editAddress,
                        onValueChange = { editAddress = it },
                        label = { Text("Warehouse / Mill Address") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = editPin,
                        onValueChange = { if (it.length <= 6 && it.all(Char::isDigit)) editPin = it },
                        label = { Text("PIN Code") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    enabled = !isSavingProfile && editName.isNotBlank() && editBusiness.isNotBlank(),
                    onClick = {
                        onUpdateProfile(
                            editName,
                            editPhone.ifBlank { null },
                            editBusiness,
                            editLocation.ifBlank { "India" },
                            editGstin.ifBlank { null },
                            editAddress.ifBlank { null },
                            editPin.ifBlank { null }
                        ) {
                            showEditDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = TradigooNavy)
                ) {
                    Text(if (isSavingProfile) "Saving..." else "Save Changes")
                }
            },
            dismissButton = {
                TextButton(onClick = { showEditDialog = false }) { Text("Cancel") }
            }
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
        Spacer(modifier = Modifier.width(12.dp))
        Text(
            text = value,
            fontSize = 13.sp,
            fontWeight = FontWeight.SemiBold,
            color = TradigooTextPrimary,
            textAlign = TextAlign.End,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier.weight(1f)
        )
    }
}
