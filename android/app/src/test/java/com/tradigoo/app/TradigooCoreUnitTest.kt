package com.tradigoo.app

import com.tradigoo.app.data.local.JwtUtils
import com.tradigoo.app.domain.model.CartItem
import com.tradigoo.app.domain.model.Order
import com.tradigoo.app.domain.model.TaxCalculator
import com.tradigoo.app.domain.model.UserRole
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class TradigooCoreUnitTest {

    @Test
    fun `userRole fromString maps all supported role aliases`() {
        assertEquals(UserRole.FOUNDER, UserRole.fromString("founder"))
        assertEquals(UserRole.FOUNDER, UserRole.fromString(" ADMIN "))
        assertEquals(UserRole.EMPLOYEE, UserRole.fromString("employee"))
        assertEquals(UserRole.EMPLOYEE, UserRole.fromString("staff"))
        assertEquals(UserRole.EMPLOYEE, UserRole.fromString("support"))
        assertEquals(UserRole.WHOLESALER, UserRole.fromString("wholesaler"))
        assertEquals(UserRole.WHOLESALER, UserRole.fromString("SELLER"))
        assertEquals(UserRole.RETAILER, UserRole.fromString("retailer"))
        assertEquals(UserRole.RETAILER, UserRole.fromString(null))
        assertEquals(UserRole.RETAILER, UserRole.fromString("unknown"))
    }

    @Test
    fun `taxCalculator assigns accurate Indian GST category slabs`() {
        assertEquals(5, TaxCalculator.getGstRateForCategory("Grains"))
        assertEquals(5, TaxCalculator.getGstRateForCategory("Pulses & Lentils"))
        assertEquals(5, TaxCalculator.getGstRateForCategory("Spices"))
        assertEquals(12, TaxCalculator.getGstRateForCategory("Beverages"))
        assertEquals(12, TaxCalculator.getGstRateForCategory("Fashion"))
        assertEquals(18, TaxCalculator.getGstRateForCategory("Electronics"))
        assertEquals(18, TaxCalculator.getGstRateForCategory("Home & Kitchen"))
    }

    @Test
    fun `taxCalculator computes item and multi-slab cart totals accurately`() {
        val grainItem = CartItem(
            id = "c1",
            productId = "p1",
            productName = "Sharbati Wheat",
            category = "Grains",
            basePrice = 40.0,
            minOrderQuantity = 50,
            quantity = 100
        )
        val applianceItem = CartItem(
            id = "c2",
            productId = "p2",
            productName = "Commercial Mixer",
            category = "Electronics",
            basePrice = 2500.0,
            minOrderQuantity = 2,
            quantity = 2
        )

        val itemPricing = TaxCalculator.calculateItemPricing(40.0, 100, "Grains")
        assertEquals(5, itemPricing.gstRate)
        assertEquals(4000.0, itemPricing.taxableAmount, 0.001)
        assertEquals(200.0, itemPricing.gstAmount, 0.001)
        assertEquals(4200.0, itemPricing.totalAmount, 0.001)

        val summary = TaxCalculator.calculateCartTotals(listOf(grainItem, applianceItem))
        // Subtotal: 4000 + 5000 = 9000; GST: 200 (5%) + 900 (18%) = 1100; Grand: 10100
        assertEquals(9000.0, summary.subtotal, 0.001)
        assertEquals(1100.0, summary.gstTotal, 0.001)
        assertEquals(10100.0, summary.grandTotal, 0.001)
    }

    @Test
    fun `order normalizedStatus unifies legacy uppercase and backend lowercase states`() {
        fun makeOrder(status: String) = Order(
            id = "ord-1",
            buyerId = "b-1",
            sellerId = "s-1",
            productId = "p-1",
            productName = "Wheat",
            quantity = 100,
            unitPrice = 40.0,
            totalAmount = 4200.0,
            status = status,
            createdAt = "2026-01-01T00:00:00Z"
        )

        assertEquals("payment_pending", makeOrder("ORDER_CREATED").normalizedStatus())
        assertEquals("payment_in_escrow", makeOrder("PAYMENT_HELD").normalizedStatus())
        assertEquals("payment_in_escrow", makeOrder("payment_in_escrow").normalizedStatus())
        assertEquals("shipped", makeOrder("SHIPPED").normalizedStatus())
        assertEquals("courier_verified", makeOrder("courier_verified").normalizedStatus())
        assertEquals("delivered", makeOrder("delivered").normalizedStatus())
        assertEquals("inspection", makeOrder("OTP_CONFIRMED").normalizedStatus())
        assertEquals("inspection", makeOrder("inspection").normalizedStatus())
        assertEquals("completed", makeOrder("PAYMENT_RELEASED").normalizedStatus())
        assertEquals("completed", makeOrder("completed").normalizedStatus())
        assertEquals("disputed", makeOrder("disputed").normalizedStatus())
    }

    @Test
    fun `jwtUtils decodes exp claim and detects expired or near-expiry tokens`() {
        // Header: {"alg":"HS256","typ":"JWT"} -> eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
        // Payload: {"sub":"usr_1","exp":2000000000} -> eyJzdWIiOiJ1c3JfMSIsImV4cCI6MjAwMDAwMDAwMH0
        val sampleJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfMSIsImV4cCI6MjAwMDAwMDAwMH0.sig"

        assertEquals(2000000000L, JwtUtils.extractExpiryEpochSeconds(sampleJwt))
        assertFalse(JwtUtils.isExpiringSoon(sampleJwt, bufferSeconds = 90L, nowEpochSec = 1999999000L))
        assertTrue(JwtUtils.isExpiringSoon(sampleJwt, bufferSeconds = 90L, nowEpochSec = 1999999950L))
        assertTrue(JwtUtils.isExpiringSoon(sampleJwt, bufferSeconds = 90L, nowEpochSec = 2000000500L))
        assertEquals(null, JwtUtils.extractExpiryEpochSeconds("not-a-jwt"))
    }
}
