export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Staff' | 'Customer';
  isActive: boolean;
}

export interface VehiclePart {
  id: number;
  name: string;
  brand: string;
  sku: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  vendorId: number;
  vendorName?: string;
}

export interface Vendor {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
}

export interface SalesInvoice {
  id: number;
  customerId: number;
  customerName: string;
  totalAmount: number;
  discountAmount: number;
  date: string;
  items: SalesItem[];
}

export interface SalesItem {
  id: number;
  vehiclePartId: number;
  partName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
