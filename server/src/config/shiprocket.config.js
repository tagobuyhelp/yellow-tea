// Shiprocket API configuration
export const shiprocketConfig = {
  apiKey: process.env.SHIPROCKET_API_KEY || 'your-shiprocket-api-key',
  apiSecret: process.env.SHIPROCKET_API_SECRET || 'your-shiprocket-api-secret',
  baseUrl: process.env.SHIPROCKET_BASE_URL || 'https://apiv2.shiprocket.in/v1/external',
}; 