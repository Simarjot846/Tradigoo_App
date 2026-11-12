package com.tradigoo.app.ui.theme

import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

// Tradigoo Primary Brand Colors
val TradigooBlue = Color(0xFF2563EB)
val TradigooBlueDark = Color(0xFF1D4ED8)
val TradigooBlueLight = Color(0xFF3B82F6)
val TradigooBlueBg = Color(0xFFEFF6FF)

// Tradigoo Violet & Accent Gradient
val TradigooViolet = Color(0xFF7C3AED)
val TradigooVioletDark = Color(0xFF6D28D9)
val TradigooVioletLight = Color(0xFF8B5CF6)
val TradigooVioletBg = Color(0xFFF5F3FF)

// Wholesaler Emerald Green
val TradigooEmerald = Color(0xFF10B981)
val TradigooEmeraldDark = Color(0xFF059669)
val TradigooEmeraldLight = Color(0xFF34D399)
val TradigooEmeraldBg = Color(0xFFECFDF5)

// Indian Commerce Orange / Amber
val TradigooAmber = Color(0xFFF59E0B)
val TradigooAmberBg = Color(0xFFFFFBEB)

// Status Colors
val StatusSuccess = Color(0xFF10B981)
val StatusWarning = Color(0xFFF59E0B)
val StatusInfo = Color(0xFF3B82F6)
val StatusError = Color(0xFFEF4444)
val StatusErrorBg = Color(0xFFFEF2F2)

// Surfaces & Neutrals
val TradigooNavy = Color(0xFF0F172A)
val TradigooNavySurface = Color(0xFF1E293B)
val TradigooBackground = Color(0xFFF8FAFC)
val TradigooSurface = Color(0xFFFFFFFF)
val TradigooSurfaceElevated = Color(0xFFF1F5F9)
val TradigooCardBorder = Color(0xFFE2E8F0)
val TradigooTextPrimary = Color(0xFF0F172A)
val TradigooTextSecondary = Color(0xFF64748B)
val TradigooTextTertiary = Color(0xFF94A3B8)

// Semantic Tradigoo Colors
val TradigooWarning = StatusWarning
val TradigooWarningBg = TradigooAmberBg
val TradigooError = StatusError
val TradigooErrorBg = StatusErrorBg


// Gradients
val TradigooBrandGradient = Brush.horizontalGradient(
    colors = listOf(TradigooBlue, TradigooViolet)
)

val TradigooCardGradient = Brush.verticalGradient(
    colors = listOf(Color(0xFF1E293B), Color(0xFF0F172A))
)

val TradigooEmeraldGradient = Brush.horizontalGradient(
    colors = listOf(TradigooEmerald, Color(0xFF059669))
)

val TradigooBlueGradient = Brush.horizontalGradient(
    colors = listOf(TradigooBlue, TradigooBlueDark)
)
