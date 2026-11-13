package com.tradigoo.app.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = TradigooNavy,
    onPrimary = TradigooSurface,
    primaryContainer = TradigooNavyBg,
    onPrimaryContainer = TradigooNavy,
    secondary = TradigooGold,
    onSecondary = TradigooNavy,
    secondaryContainer = TradigooGoldBg,
    onSecondaryContainer = TradigooGoldDark,
    tertiary = TradigooEmerald,
    onTertiary = TradigooSurface,
    tertiaryContainer = TradigooEmeraldBg,
    onTertiaryContainer = TradigooEmeraldDark,
    background = TradigooBackground,
    onBackground = TradigooTextPrimary,
    surface = TradigooSurface,
    onSurface = TradigooTextPrimary,
    surfaceVariant = TradigooSurfaceElevated,
    onSurfaceVariant = TradigooTextSecondary,
    outline = TradigooCardBorder,
    error = StatusError,
    onError = TradigooSurface
)

@Composable
fun TradigooTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) LightColorScheme else LightColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? Activity)?.window
            if (window != null) {
                WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = true
            }
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = TradigooTypography,
        content = content
    )
}
