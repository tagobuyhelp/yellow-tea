# Yellow Tea Admin API Documentation

This guide explains all admin API endpoints for Yellow Tea. It is designed for frontend developers to quickly understand how to use each endpoint, what data to send, and what to expect in the response.

---

## Quickstart
- **Base URL:** `/api/v1/admin`
- **Authentication:** All endpoints require an admin JWT token in the `Authorization: Bearer <token>` header.
- **All responses:**
  ```json
  { "success": true, "data": ... }
  ```
- **Errors:**
  ```json
  { "success": false, "message": "Error message" }
  ```

---

## Table of Contents
- [Dashboard](#dashboard)
- [Customers](#customers)
- [Orders](#orders)
- [Products](#products)
- [Logs](#logs)
- [User Management](#user-management)
- [Analytics](#analytics)
- [System Operations](#system-operations)

---

## Dashboard
**Get an overview of the system: user, order, product counts, revenue, recent activity, and analytics.**

**GET** `/dashboard`
- **Returns:**
  - `overview`: counts (users, orders, products, revenue)
  - `recentActivity`: recent orders and users
  - `analytics`: monthly stats, top products, order status breakdown

---

## Customers
**Manage users (customers) in the system.**

### List Customers
**GET** `/customers`
- **Query:** `page`, `limit`, `search`, `sort`
- **Returns:**
  - `users`: array of user objects
  - `pagination`: total, page, limit, totalPages

### Get Customer by ID
**GET** `/customers/:id`
- **Returns:**
  - `user`: user object
  - `orders`: recent orders
  - `stats`: order stats for this user

### Update Customer
**PUT** `/customers/:id`
- **Body:** (send only fields you want to update)
  | Field   | Type   | Required | Example         |
  |---------|--------|----------|----------------|
  | name    | String | No       | "Jane Doe"     |
  | email   | String | No       | "jane@x.com"   |
  | phone   | String | No       | "9876543210"   |
- **Returns:** updated user object

**Example:**
```json
{
  "name": "Jane Doe",
  "email": "jane@x.com"
}
```

### Delete Customer
**DELETE** `/customers/:id`
- **Returns:** `{ success: true, data: null }`

**User Object Fields:**
| Field      | Type   | Description           |
|------------|--------|----------------------|
| _id        | String | User ID              |
| name       | String | Name                 |
| email      | String | Email                |
| phone      | String | Phone number         |
| role       | String | 'user' or 'admin'    |
| created_at | String | ISO date             |
| ...        | ...    | More fields possible |

---

## Orders
**View and manage all orders.**

### List Orders
**GET** `/orders`
- **Query:** `page`, `limit`, `sort`, `status`, ...
- **Returns:**
  - `orders`: array of order objects
  - `pagination`: total, page, limit, totalPages

### Get Order by ID
**GET** `/orders/:id`
- **Returns:** order object

### Update Order Status
**PUT** `/orders/:id/status`
- **Body:**
  | Field   | Type   | Required | Example      |
  |---------|--------|----------|--------------|
  | status  | String | Yes      | "shipped"   |
  | notes   | String | No       | "Left at door" |
- **Returns:** updated order object

**Example:**
```json
{
  "status": "shipped",
  "notes": "Left at door"
}
```

### Get Order Stats
**GET** `/orders/stats`
- **Returns:**
  - `totalOrders`, `totalSales`, `ordersByStatus`, `monthlyOrders`, `topProducts`, `recentOrders`

**Order Object Fields:**
| Field           | Type     | Description                |
|-----------------|----------|----------------------------|
| _id             | String   | Order ID                   |
| orderNumber     | String   | Unique order number        |
| user            | Object   | User info                  |
| orderItems      | Array    | List of order items        |
| shippingAddress | Object   | Shipping address           |
| paymentMethod   | String   | Payment method             |
| status          | String   | Order status               |
| totalPrice      | Number   | Total price                |
| isPaid          | Boolean  | Paid status                |
| deliveredAt     | String   | Delivery date              |
| ...             | ...      | More fields possible       |

**Order Item Fields:**
| Field    | Type   | Description         |
|----------|--------|--------------------|
| name     | String | Product name       |
| quantity | Number | Quantity           |
| price    | Number | Price per item     |
| product  | String | Product ID         |
| image    | String | Product image URL  |

---

## Products
**Manage products in the catalog.**

### List Products
**GET** `/products`
- **Query:** `page`, `limit`, `search`, `sort`, ...
- **Returns:**
  - `products`: array of product objects
  - `pagination`: total, page, limit, totalPages

### Get Product by ID
**GET** `/products/:id`
- **Returns:** product object

### Create Product
**POST** `/products`
- **Body:** `multipart/form-data` (fields + images[])
  | Field     | Type     | Required | Example         |
  |-----------|----------|----------|----------------|
  | name      | String   | Yes      | "Darjeeling"   |
  | price     | Number   | Yes      | 499            |
  | category  | String   | Yes      | "Gift Box"     |
  | type      | Array    | Yes      | ["Black"]      |
  | images[]  | File     | No       | (upload files)  |
  | ...       | ...      | ...      | ...            |
- **Returns:** created product object

**Example:**
Form fields:
- name: Darjeeling
- price: 499
- category: Gift Box
- type: ["Black"]
- images[]: (upload files)

### Update Product
**PUT** `/products/:id`
- **Body:** same as create
- **Returns:** updated product object

### Delete Product
**DELETE** `/products/:id`
- **Returns:** `{ success: true, data: null }`

**Product Object Fields:**
| Field      | Type   | Description           |
|------------|--------|----------------------|
| _id        | String | Product ID           |
| name       | String | Name                 |
| slug       | String | URL slug             |
| category   | String | Category             |
| type       | Array  | Product types        |
| price      | Number | Price                |
| images     | Array  | Image URLs           |
| ...        | ...    | More fields possible |

---

## Logs
**View admin activity logs.**

**GET** `/logs`
- **Query:** `page`, `limit`, `sort`, ...
- **Returns:**
  - `logs`: array of log objects
  - `pagination`: total, page, limit, pages

**Log Object Fields:**
| Field      | Type   | Description           |
|------------|--------|----------------------|
| _id        | String | Log ID               |
| admin_id   | String | Admin user ID        |
| action_type| String | Action type          |
| timestamp  | String | ISO date             |
| details    | Object | Action details       |
| ...        | ...    | More fields possible |

---

## User Management
**Change user roles or delete users.**

### Update User Role
**PUT** `/users/:id/role`
- **Body:**
  | Field | Type   | Required | Example   |
  |-------|--------|----------|-----------|
  | role  | String | Yes      | "admin"   |
- **Returns:** updated user object

### Delete User
**DELETE** `/users/:id`
- **Returns:** `{ success: true, data: null }`

---

## Analytics
**Get analytics for users, orders, revenue, and daily stats.**

**GET** `/analytics?period=30`
- **Returns:**
  - `users`: { new, total }
  - `orders`: { new, total }
  - `revenue`: { period, total }
  - `dailyStats`: array of daily stats

---

## System Operations
**Check system health or clear cache.**

### System Health
**GET** `/system/health`
- **Returns:**
  - `status`: 'healthy'
  - `database`: DB status
  - `stats`: { uptime, memory, nodeVersion, platform }

### Clear Cache
**POST** `/system/cache/clear`
- **Returns:** `{ success: true, data: null }`

---

## Tips
- All endpoints require admin authentication.
- For file uploads, use `multipart/form-data` and send images as `images[]`.
- Only send fields you want to update (for PATCH/PUT).
- See `admin.controller.js` for more details on each endpoint. 