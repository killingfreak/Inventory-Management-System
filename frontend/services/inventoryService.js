import api from './api';

const inventoryService = {
  // Get all inventory items
  async getItems(params = {}) {
    const response = await api.get('/inventory/', { params });
    return response.data;
  },

  // Get inventory statistics
  async getStats() {
    const response = await api.get('/inventory/stats');
    return response.data;
  },

  // Get single inventory item
  async getItem(itemId) {
    const response = await api.get(`/inventory/${itemId}`);
    return response.data;
  },

  // Create new inventory item
  async createItem(itemData) {
    const response = await api.post('/inventory/', itemData);
    return response.data;
  },

  // Update inventory item
  async updateItem(itemId, itemData) {
    const response = await api.put(`/inventory/${itemId}`, itemData);
    return response.data;
  },

  // Delete inventory item
  async deleteItem(itemId) {
    const response = await api.delete(`/inventory/${itemId}`);
    return response.data;
  },
};

export default inventoryService;