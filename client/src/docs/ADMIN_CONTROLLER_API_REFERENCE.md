# Admin Controller API Reference

This guide explains all controller functions in `admin.controller.js` for frontend developers. It shows which route each function handles, what data to send, and what you get back.

---

## Quickstart
- **All routes start with:** `/api/v1/admin`
- **All endpoints require:** `Authorization: Bearer <admin-token>`
- **All responses:** `{ success: true, data: ... }`
- **Errors:** `{ success: false, message: "..." }`

---

## Dashboard
**Get system overview and analytics.**
- **Function:** `getAdminDashboard`
- **Route:** GET `/dashboard`
- **Returns:**
  - `overview`: counts (users, orders, products, revenue)
  - `recentActivity`: recent orders and users
  - `analytics`: monthly stats, top products, order status breakdown

---

## Customers
**Manage users (customers).**

- **getAllCustomers**
  - **Route:** GET `/customers`
  - **Query:** `page`, `limit`, `search`, `sort`
  - **Returns:**
    - `users`: array of user objects
    - `pagination`: total, page, limit, totalPages

- **getCustomerById**
  - **Route:** GET `/customers/:id`
  - **Returns:**
    - `user`: user object
    - `orders`: recent orders
    - `stats`: order stats for this user

- **updateCustomer**
  - **Route:** PUT `/customers/:id`
  - **Body:** (send only fields you want to update)
    | Field   | Type   | Required | Example         |
    |---------|--------|----------|----------------|
    | name    | String | No       | "Jane Doe"     |
    | email   | String | No       | "jane@x.com"   |
    | phone   | String | No       | "9876543210"   |
  - **Returns:** updated user object
  - **Example:**
    ```json
    { "name": "Jane Doe", "email": "jane@x.com" }
    ```

- **deleteCustomer**
  - **Route:** DELETE `/customers/:id`
  - **Returns:** `{ success: true, data: null }`

---

## Orders
**View and manage all orders.**

- **getAllOrders**
  - **Route:** GET `/orders`
  - **Query:** `page`, `limit`, `sort`, `status`, ...
  - **Returns:**
    - `orders`: array of order objects
    - `pagination`: total, page, limit, totalPages

- **getOrderById**
  - **Route:** GET `/orders/:id`
  - **Returns:** order object

- **updateOrderStatus**
  - **Route:** PUT `/orders/:id/status`
  - **Body:**
    | Field   | Type   | Required | Example      |
    |---------|--------|----------|--------------|
    | status  | String | Yes      | "shipped"   |
    | notes   | String | No       | "Left at door" |
  - **Returns:** updated order object
  - **Example:**
    ```json
    { "status": "shipped", "notes": "Left at door" }
    ```

- **getOrderStats**
  - **Route:** GET `/orders/stats`
  - **Returns:**
    - `totalOrders`, `totalSales`, `ordersByStatus`, `monthlyOrders`, `topProducts`, `recentOrders`

---

## Products
**Manage products in the catalog.**

- **getAllProducts**
  - **Route:** GET `/products`
  - **Query:** `page`, `limit`, `search`, `sort`, ...
  - **Returns:**
    - `products`: array of product objects
    - `pagination`: total, page, limit, totalPages

- **getProductById**
  - **Route:** GET `/products/:id`
  - **Returns:** product object

- **createProduct**
  - **Route:** POST `/products`
  - **Body:** `multipart/form-data` (fields + images[])
    | Field     | Type     | Required | Example         |
    |-----------|----------|----------|----------------|
    | name      | String   | Yes      | "Darjeeling"   |
    | price     | Number   | Yes      | 499            |
    | category  | String   | Yes      | "Gift Box"     |
    | type      | Array    | Yes      | ["Black"]      |
    | images[]  | File     | No       | (upload files)  |
  - **Returns:** created product object
  - **Example:**
    Form fields:
    - name: Darjeeling
    - price: 499
    - category: Gift Box
    - type: ["Black"]
    - images[]: (upload files)

- **updateProduct**
  - **Route:** PUT `/products/:id`
  - **Body:** same as create
  - **Returns:** updated product object

- **deleteProduct**
  - **Route:** DELETE `/products/:id`
  - **Returns:** `{ success: true, data: null }`

- **getProductStats**
  - **Route:** GET `/products/stats`
  - **Returns:**
    - `totalProducts`, `productsByCategory`, `productsByType`, `averagePrice`, `lowStockProducts`

---

## Logs
**View admin activity logs.**

- **getAdminLogs**
  - **Route:** GET `/logs`
  - **Query:** `page`, `limit`, `sort`, ...
  - **Returns:**
    - `logs`: array of log objects
    - `pagination`: total, page, limit, pages

---

## User Management
**Change user roles or delete users.**

- **updateUserRole**
  - **Route:** PUT `/users/:id/role`
  - **Body:**
    | Field | Type   | Required | Example   |
    |-------|--------|----------|-----------|
    | role  | String | Yes      | "admin"   |
  - **Returns:** updated user object
  - **Example:**
    ```json
    { "role": "admin" }
    ```

- **deleteUser**
  - **Route:** DELETE `/users/:id`
  - **Returns:** `{ success: true, data: null }`

---

## Analytics
**Get analytics for users, orders, revenue, and daily stats.**

- **getAnalytics**
  - **Route:** GET `/analytics?period=30`
  - **Returns:**
    - `users`: { new, total }
    - `orders`: { new, total }
    - `revenue`: { period, total }
    - `dailyStats`: array of daily stats

---

## System Operations
**Check system health or clear cache.**

- **getSystemHealth**
  - **Route:** GET `/system/health`
  - **Returns:**
    - `status`: 'healthy'
    - `database`: DB status
    - `stats`: { uptime, memory, nodeVersion, platform }

- **clearCache**
  - **Route:** POST `/system/cache/clear`
  - **Returns:** `{ success: true, data: null }`

---

## Field Reference

**User Object:**
| Field      | Type   | Description           |
|------------|--------|----------------------|
| _id        | String | User ID              |
| name       | String | Name                 |
| email      | String | Email                |
| phone      | String | Phone number         |
| role       | String | 'user' or 'admin'    |
| created_at | String | ISO date             |
| ...        | ...    | More fields possible |

**Order Object:**
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

**Product Object:**
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

**Log Object:**
| Field      | Type   | Description           |
|------------|--------|----------------------|
| _id        | String | Log ID               |
| admin_id   | String | Admin user ID        |
| action_type| String | Action type          |
| timestamp  | String | ISO date             |
| details    | Object | Action details       |
| ...        | ...    | More fields possible |

---

**See `admin.controller.js` for more details on each function.** 