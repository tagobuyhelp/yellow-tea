import { customAlphabet } from 'nanoid';

// Create a custom alphabet for the transaction ID
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Create a nanoid function with the custom alphabet and a length of 12
const nanoid = customAlphabet(alphabet, 12);

export const generateTransactionId = () => {
    const timestamp = Date.now().toString(36); // Convert current timestamp to base 36
    const randomPart = nanoid(); // Generate a random string
    return `TXN_${timestamp}_${randomPart}`;
};