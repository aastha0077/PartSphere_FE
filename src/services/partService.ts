import api from './api';

export interface Part {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  stockQuantity: number;
  description: string;
  vendorId: number;
  vendorName: string;
  isLowStock: boolean;
  updatedAt: string;
  rowVersion: string;
}

export interface InventoryResponse {
  items: Part[];
  total: number;
  page: number;
  pageSize: number;
}

export const partService = {
  getAll: async (params: { search?: string; category?: string; page?: number; pageSize?: number }) => {
    const response = await api.get<InventoryResponse>('/parts', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Part>(`/parts/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post<Part>('/parts', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.put<Part>(`/parts/${id}`, data);
    return response.data;
  },

  updateStock: async (id: number, stockQuantity: number, rowVersion: string) => {
    const response = await api.patch<Part>(`/parts/${id}/stock`, { stockQuantity, rowVersion });
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/parts/${id}`);
  }
};