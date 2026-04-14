import api from './axios';

export const contractService = {
  getAll: () => api.get('/contracts'),
  getByRoom: (roomId) => api.get(`/contracts/room/${roomId}`),
  getByTenant: (tenantId) => api.get(`/contracts/tenant/${tenantId}`),
  create: (data) => api.post('/contracts', data),
  cancel: (id) => api.put(`/contracts/${id}/cancel`),
  getActive: (date) => api.get('/contracts/active', { params: { date } }),
};