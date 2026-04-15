import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  total?: number;
  image?: string;
}

interface ShippingAddress {
  street: string;
  apartment?: string;
  city: string;
  state: string;
  pincode?: string;
  country: string;
}

interface InvoiceData {
  orderId: string;
  orderNumber?: string;
  orderDate: string;
  total: number;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  customerName?: string;
  paymentMethod?: string;
}

export const generateInvoicePDF = (invoiceData: InvoiceData): jsPDF => {
  const doc = new jsPDF();
  
  // Set font
  doc.setFont('helvetica');
  
  // Header
  doc.setFontSize(24);
  doc.setTextColor(34, 139, 34); // Green color
  doc.text('Yellow Tea', 20, 30);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Premium Tea Collection', 20, 40);
  
  // Invoice title
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text('INVOICE', 20, 60);
  
  // Invoice details
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Invoice Number:', 20, 80);
  doc.text('Date:', 20, 90);
  doc.text('Order ID:', 20, 100);
  
  doc.setTextColor(0, 0, 0);
  doc.text(invoiceData.orderNumber || invoiceData.orderId, 60, 80);
  doc.text(new Date(invoiceData.orderDate).toLocaleDateString(), 60, 90);
  doc.text(invoiceData.orderId, 60, 100);
  
  // Customer info
  doc.setTextColor(100, 100, 100);
  doc.text('Bill To:', 120, 80);
  doc.setTextColor(0, 0, 0);
  doc.text(invoiceData.customerName || 'Customer', 120, 90);
  
  // Shipping address
  const address = invoiceData.shippingAddress;
  const addressLines = [
    address.street,
    address.apartment,
    `${address.city}, ${address.state} ${address.pincode}`,
    address.country
  ].filter(Boolean);
  
  addressLines.forEach((line, index) => {
    doc.text(line, 120, 100 + (index * 5));
  });
  
  // Items table
  const tableY = 140;
  
  // Table headers
  autoTable(doc, {
    startY: tableY,
    tableWidth: 115,
    head: [['Item', 'Quantity', 'Price', 'Total']],
    body: invoiceData.items.map(item => [
      item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
      item.quantity.toString(),
      `Rs. ${item.price}`,
      `Rs. ${item.total || (item.price * item.quantity)}`
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [34, 139, 34],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 60, cellPadding: 1 },
      1: { cellWidth: 15, halign: 'center', cellPadding: 1 },
      2: { cellWidth: 20, halign: 'right', cellPadding: 1 },
      3: { cellWidth: 20, halign: 'right', cellPadding: 1 },
    },
  });
  
  // Total
  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Total:', 150, finalY);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Rs. ${invoiceData.total}`, 180, finalY);
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for choosing Yellow Tea!', 20, 270);
  doc.text('For support, contact us at support@yellowtea.com', 20, 275);
  
  return doc;
};

export const downloadInvoicePDF = (invoiceData: InvoiceData, filename?: string) => {
  const doc = generateInvoicePDF(invoiceData);
  const safeOrderId = invoiceData.orderId.replace(/[^a-zA-Z0-9-_]/g, '');
  const pdfFilename = filename || `invoice-${safeOrderId}.pdf`;
  doc.save(pdfFilename);
}; 