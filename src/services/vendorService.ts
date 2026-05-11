import api from './api';

export interface Vendor {
  id: number;
  name: string;
  contactPerson: string;
  contact: string;
  phone: string;
  address: string;
  email: string;
  category: string;
  partsCount: number;
}

export const vendorService = {
  getAll: async () => {
    const response = await api.get<Vendor[]>('/vendors');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Vendor>(`/vendors/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post<Vendor>('/vendors', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.put<Vendor>(`/vendors/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/vendors/${id}`);
  }
};