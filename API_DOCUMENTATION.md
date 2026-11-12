# 📡 API Documentation

Complete API reference for Tradigoo platform.

## 📋 Table of Contents

- [Authentication](#authentication)
- [Products](#products)
- [Orders](#orders)
- [Pathway Real-Time](#pathway-real-time)
- [Users](#users)
- [Disputes](#disputes)
- [Payments](#payments)
- [Error Handling](#error-handling)

---

## 🔐 Authentication

### Sign In

```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "retailer@demo.com",
  "password": "demo123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "retailer@