package com.tradigoo.app.domain.model

enum class UserRole(val value: String, val displayName: String) {
    RETAILER("retailer", "Retailer"),
    WHOLESALER("wholesaler", "Wholesaler"),
    EMPLOYEE("employee", "Operations Employee"),
    FOUNDER("founder", "Founder & Administrator");

    companion object {
        fun fromString(role: String?): UserRole {
            return when (role?.lowercase()?.trim()) {
                "founder", "admin" -> FOUNDER
                "employee", "staff", "support" -> EMPLOYEE
                "wholesaler", "seller" -> WHOLESALER
                else -> RETAILER
            }
        }
    }
}
