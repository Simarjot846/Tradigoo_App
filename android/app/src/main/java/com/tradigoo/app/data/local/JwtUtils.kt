package com.tradigoo.app.data.local

import java.nio.charset.StandardCharsets

/**
 * Pure-Kotlin JWT utilities that work both on Android (API 24+) and in JVM unit tests
 * without requiring android.util.Base64 or Robolectric.
 */
object JwtUtils {

    private val EXP_REGEX = Regex("\"exp\"\\s*:\\s*(\\d+)")
    private const val BASE64_URL_ALPHABET =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"

    fun extractExpiryEpochSeconds(jwt: String?): Long? {
        if (jwt.isNullOrBlank()) return null
        val parts = jwt.split(".")
        if (parts.size < 2) return null

        val payloadBytes = decodeBase64Url(parts[1]) ?: return null
        val payloadJson = String(payloadBytes, StandardCharsets.UTF_8)
        val match = EXP_REGEX.find(payloadJson) ?: return null
        return match.groupValues.getOrNull(1)?.toLongOrNull()
    }

    fun isExpiringSoon(
        jwt: String?,
        explicitExpiresAtSec: Long? = null,
        bufferSeconds: Long = 90L,
        nowEpochSec: Long = System.currentTimeMillis() / 1000L
    ): Boolean {
        val expSec = extractExpiryEpochSeconds(jwt) ?: explicitExpiresAtSec ?: return false
        return (expSec - nowEpochSec) <= bufferSeconds
    }

    internal fun decodeBase64Url(input: String): ByteArray? {
        val cleaned = input.trim().trimEnd('=')
        if (cleaned.isEmpty()) return null

        val out = ByteArray((cleaned.length * 3) / 4)
        var outIndex = 0
        var buffer = 0
        var bitsCollected = 0

        for (ch in cleaned) {
            val mappedChar = when (ch) {
                '+' -> '-'
                '/' -> '_'
                else -> ch
            }
            val value = BASE64_URL_ALPHABET.indexOf(mappedChar)
            if (value < 0) return null

            buffer = (buffer shl 6) or value
            bitsCollected += 6

            if (bitsCollected >= 8) {
                bitsCollected -= 8
                if (outIndex < out.size) {
                    out[outIndex++] = ((buffer ushr bitsCollected) and 0xFF).toByte()
                }
            }
        }

        return if (outIndex == out.size) out else out.copyOf(outIndex)
    }
}
