import api from './api';

const auditService = {
  // Get all audit logs
  async getLogs(params = {}) {
    const response = await api.get('/audit/', { params });
    return response.data;
  },

  // Get audit logs for specific item
  async getItemLogs(itemId) {
    const response = await api.get(`/audit/item/${itemId}`);
    return response.data;
  },
};

export default auditService;