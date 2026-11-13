package com.tradigoo.app.ui.theme

import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

// Tradigoo Primary Brand Identity: Deep Navy & Elegant Gold
val TradigooNavy = Color(0xFF0F172A)
val TradigooNavySurface = Color(0xFF1E293B)
val TradigooNavyLight = Color(0xFF334155)
val TradigooNavyBg = Color(0xFFF1F5F9)

val TradigooGold = Color(0xFFC9A227)
val TradigooGoldDark = Color(0xFFA68214)
val TradigooGoldLight = Color(0xFFE5C158)
val TradigooGoldBg = Color(0xFFFEF9E7)

// Retailer Trust Blue (restrained navy-blue secondary for buyer actions)
val TradigooBlue = Color(0xFF1E3A8A)
val TradigooBlueDark = Color(0xFF172554)
val TradigooBlueLight = Color(0xFF2563EB)
val TradigooBlueBg = Color(0xFFEFF6FF)

// Accent / Escrow Purple kept subdued for escrow badge compatibility
val TradigooViolet = Color(0xFF4F46E5)
val TradigooVioletDark = Color(0xFF3730A3)
val TradigooVioletLight = Color(0xFF6366F1)
val TradigooVioletBg = Color(0xFFEEF2FF)

// Wholesaler & Verification Emerald
val TradigooEmerald = Color(0xFF059669)
val TradigooEmeraldDark = Color(0xFF047857)
val TradigooEmeraldLight = Color(0xFF34D399)
val TradigooEmeraldBg = Color(0xFFECFDF5)

// Indian Commerce Amber
val TradigooAmber = Color(0xFFD97706)
val TradigooAmberBg = Color(0xFFFFFBEB)

// Status Colors
val StatusSuccess = Color(0xFF059669)
val StatusWarning = Color(0xFFD97706)
val StatusInfo = Color(0xFF1E3A8A)
val StatusError = Color(0xFFDC2626)
val StatusErrorBg = Color(0xFFFEF2F2)

// Clean Light Surfaces & Neutrals
val TradigooBackground = Color(0xFFF8FAFC)
val TradigooSurface = Color(0xFFFFFFFF)
val TradigooSurfaceElevated = Color(0xFFF1F5F9)
val TradigooCardBorder = Color(0xFFE2E8F0)
val TradigooTextPrimary = Color(0xFF0F172A)
val TradigooTextSecondary = Color(0xFF475569)
val TradigooTextTertiary = Color(0xFF64748B)

// Semantic Aliases
val TradigooWarning = StatusWarning
val TradigooWarningBg = TradigooAmberBg
val TradigooError = StatusError
val TradigooErrorBg = StatusErrorBg

// Clean, Restrained Brand Gradients (Deep Navy & Gold)
val TradigooBrandGradient = Brush.horizontalGradient(
    colors = listOf(TradigooNavy, TradigooNavySurface)
)

val TradigooGoldGradient = Brush.horizontalGradient(
    colors = listOf(TradigooGoldDark, TradigooGold)
)

val TradigooCardGradient = Brush.verticalGradient(
    colors = listOf(TradigooNavySurface, TradigooNavy)
)

val TradigooEmeraldGradient = Brush.horizontalGradient(
    colors = listOf(TradigooEmerald, TradigooEmeraldDark)
)

val TradigooBlueGradient = Brush.horizontalGradient(
    colors = listOf(TradigooNavy, TradigooBlue)
)
