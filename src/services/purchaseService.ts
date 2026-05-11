import api from './api';

export interface PurchaseItem {
  id: number;
  vehiclePartId: number;
  partName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseInvoice {
  id: number;
  vendorId: number;
  vendorName: string;
  totalAmount: number;
  date: string;
  notes: string;
  items: PurchaseItem[];
}

export const purchaseService = {
  getAll: async (vendorId?: number) => {
    const params = vendorId ? { vendorId } : {};
    const response = await api.get<PurchaseInvoice[]>('/purchases', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<PurchaseInvoice>(`/purchases/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post<PurchaseInvoice>('/purchases', data);
    return response.data;
  }
};