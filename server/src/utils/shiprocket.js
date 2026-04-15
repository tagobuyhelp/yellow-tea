import axios from 'axios';
import { shiprocketConfig } from '../config/shiprocket.config.js';
import Order from '../models/order.model.js';

let shiprocketToken = null;

export async function loginToShiprocket() {
  const response = await axios.post(`${shiprocketConfig.baseUrl}/auth/login`, {
    email: shiprocketConfig.apiKey,
    password: shiprocketConfig.apiSecret,
  });
  shiprocketToken = response.data.token;
  return shiprocketToken;
}

async function ensureToken() {
  if (!shiprocketToken) {
    await loginToShiprocket();
  }
  return shiprocketToken;
}

export async function createShiprocketOrder(orderData) {
  await ensureToken();
  const response = await axios.post(
    `${shiprocketConfig.baseUrl}/orders/create/adhoc`,
    orderData,
    {
      headers: { Authorization: `Bearer ${shiprocketToken}` },
    }
  );
  return response.data;
}

export async function getShiprocketTracking(shipmentId) {
  await ensureToken();
  const response = await axios.get(
    `${shiprocketConfig.baseUrl}/courier/track?shipment_id=${shipmentId}`,
    {
      headers: { Authorization: `Bearer ${shiprocketToken}` },
    }
  );
  return response.data;
}

export async function updateShiprocketOrderStatuses() {
  const orders = await Order.find({ shiprocketShipmentId: { $ne: null }, status: { $nin: ['delivered', 'cancelled', 'refunded'] } });
  for (const order of orders) {
    try {
      const tracking = await getShiprocketTracking(order.shiprocketShipmentId);
      if (tracking && tracking.current_status) {
        let newStatus = order.status;
        switch (tracking.current_status.toLowerCase()) {
          case 'delivered':
            newStatus = 'delivered';
            break;
          case 'shipped':
            newStatus = 'shipped';
            break;
          case 'cancelled':
            newStatus = 'cancelled';
            break;
          case 'returned':
            newStatus = 'refunded';
            break;
          case 'in transit':
          case 'out for delivery':
            newStatus = 'processing';
            break;
        }
        if (newStatus !== order.status) {
          order.status = newStatus;
          await order.save();
        }
      }
    } catch (err) {
      console.error(`Failed to update tracking for order ${order._id}:`, err?.response?.data || err.message);
    }
  }
}

export async function checkCourierServiceability({ pickup_postcode, delivery_postcode, cod = 0, weight = 1 }) {
  await ensureToken();
  const response = await axios.get(
    `${shiprocketConfig.baseUrl}/courier/serviceability/`,
    {
      params: {
        pickup_postcode,
        delivery_postcode,
        cod,
        weight
      },
      headers: { Authorization: `Bearer ${shiprocketToken}` },
    }
  );
  return response.data;
} 