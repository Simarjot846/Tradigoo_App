package com.tradigoo.app.domain.model

/**
 * Category-aware GST & Pricing Calculator for Indian B2B Wholesale Orders.
 * Mirrors server-side /lib/tax.ts slabs so client previews match server totals.
 */
object TaxCalculator {

    private val categoryGstRates: Map<String, Int> = mapOf(
        // 5% GST slab (Essential staples & agricultural commodities)
        "grains" to 5,
        "grains & cereals" to 5,
        "pulses" to 5,
        "pulses & lentils" to 5,
        "flours" to 5,
        "oils" to 5,
        "oils & ghee" to 5,
        "spices" to 5,
        "sweeteners" to 5,
        "dairy products" to 5,
        "dairy" to 5,

        // 12% GST slab (Apparel, personal care, packaged goods)
        "fashion" to 12,
        "clothing" to 12,
        "beauty" to 12,
        "body care" to 12,
        "skincare" to 12,
        "bath products" to 12,
        "beverages" to 12,
        "dry fruits" to 12,
        "snacks" to 12,

        // 18% GST slab (Electronics, cookware, general B2B)
        "electronics" to 18,
        "home & kitchen" to 18,
        "general" to 18
    )

    fun getGstRateForCategory(category: String?): Int {
        if (category.isNullOrBlank()) return 5
        val normalized = category.trim().lowercase()
        categoryGstRates[normalized]?.let { return it }
        if (normalized.contains("grain") || normalized.contains("dal") ||
            normalized.contains("flour") || normalized.contains("spice") ||
            normalized.contains("oil") || normalized.contains("pulse") ||
            normalized.contains("sweet")
        ) {
            return 5
        }
        if (normalized.contains("cloth") || normalized.contains("fashion") ||
            normalized.contains("care") || normalized.contains("skin") ||
            normalized.contains("beauty") || normalized.contains("beverage") ||
            normalized.contains("snack") || normalized.contains("fruit")
        ) {
            return 12
        }
        return 18
    }

    data class ItemPricing(
        val gstRate: Int,
        val taxableAmount: Double,
        val gstAmount: Double,
        val totalAmount: Double
    )

    data class CartSummary(
        val subtotal: Double,
        val gstTotal: Double,
        val grandTotal: Double
    )

    fun calculateItemPricing(unitPrice: Double, quantity: Int, category: String?): ItemPricing {
        val safePrice = if (unitPrice.isFinite() && unitPrice > 0.0) unitPrice else 0.0
        val safeQty = if (quantity > 0) quantity else 0
        val gstRate = getGstRateForCategory(category)
        val taxable = kotlin.math.round(safePrice * safeQty * 100.0) / 100.0
        val gst = kotlin.math.round(taxable * (gstRate / 100.0) * 100.0) / 100.0
        val total = kotlin.math.round((taxable + gst) * 100.0) / 100.0
        return ItemPricing(gstRate = gstRate, taxableAmount = taxable, gstAmount = gst, totalAmount = total)
    }

    fun calculateCartTotals(items: List<CartItem>): CartSummary {
        var subtotal = 0.0
        var gstTotal = 0.0
        for (item in items) {
            val pricing = calculateItemPricing(item.basePrice, item.quantity, item.category)
            subtotal += pricing.taxableAmount
            gstTotal += pricing.gstAmount
        }
        val roundedSub = kotlin.math.round(subtotal * 100.0) / 100.0
        val roundedGst = kotlin.math.round(gstTotal * 100.0) / 100.0
        val grand = kotlin.math.round((roundedSub + roundedGst) * 100.0) / 100.0
        return CartSummary(subtotal = roundedSub, gstTotal = roundedGst, grandTotal = grand)
    }
}
