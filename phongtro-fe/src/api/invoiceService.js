import api from './axios';

export const invoiceService = {
  getByRoom: (roomId) => api.get(`/invoices/room/${roomId}`),
  generate: (roomId, month, year) => api.post(`/invoices/generate/${roomId}/${month}/${year}`),
  generateAll: (month, year) => api.post(`/invoices/generate-all/${month}/${year}`),
  inputMeter: (data) => api.post('/invoices/input-meter', data),
  pay: (id) => api.put(`/invoices/pay/${id}`),
  createUtilityBill: (data) => api.post('/invoices/utility-bill', data),
};