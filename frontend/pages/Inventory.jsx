import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  IconButton,
  Chip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import inventoryService from '../services/inventoryService';
import { useAuth } from '../contexts/AuthContext';

const Inventory = () => {
  const { user, hasRole } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    quantity: 0,
    unit_price: 0,
    category: '',
    location: '',
  });

  const canEdit = hasRole(['admin', 'manager']);
  const canDelete = hasRole(['admin']);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getItems();
      setItems(data);
    } catch (error) {
      showSnackbar('Failed to load inventory items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditMode(true);
      setSelectedItem(item);
      setFormData({
        name: item.name,
        sku: item.sku,
        description: item.description || '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        category: item.category || '',
        location: item.location || '',
      });
    } else {
      setEditMode(false);
      setSelectedItem(null);
      setFormData({
        name: '',
        sku: '',
        description: '',
        quantity: 0,
        unit_price: 0,
        category: '',
        location: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setSelectedItem(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'quantity' || name === 'unit_price' ? parseFloat(value) || 0 : value,
    });
  };

  const handleSubmit = async () => {
    try {
      if (editMode && selectedItem) {
        await inventoryService.updateItem(selectedItem.id, formData);
        showSnackbar('Item updated successfully', 'success');
      } else {
        await inventoryService.createItem(formData);
        showSnackbar('Item created successfully', 'success');
      }
      handleCloseDialog();
      fetchItems();
    } catch (error) {
      showSnackbar(error.response?.data?.detail || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await inventoryService.deleteItem(itemId);
        showSnackbar('Item deleted successfully', 'success');
        fetchItems();
      } catch (error) {
        showSnackbar(error.response?.data?.detail || 'Delete failed', 'error');
      }
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'sku', headerName: 'SKU', width: 130 },
    { field: 'category', headerName: 'Category', width: 130 },
    { 
      field: 'quantity', 
      headerName: 'Quantity', 
      width: 110,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value < 10 ? 'warning' : 'success'}
          size="small"
        />
      ),
    },
    { 
      field: 'unit_price', 
      headerName: 'Unit Price', 
      width: 110,
      valueFormatter: (params) => `$${params.value.toFixed(2)}`,
    },
    {
      field: 'total_value',
      headerName: 'Total Value',
      width: 130,
      valueGetter: (params) => params.row.quantity * params.row.unit_price,
      valueFormatter: (params) => `$${params.value.toFixed(2)}`,
    },
    { field: 'location', headerName: 'Location', width: 130 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          {canEdit && (
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleOpenDialog(params.row)}
            >
              <EditIcon />
            </IconButton>
          )}
          {canDelete && (
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.id)}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Inventory Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your inventory items
          </Typography>
        </Box>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Item
          </Button>
        )}
      </Box>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={items}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          loading={loading}
          disableSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
          }}
        />
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Item Name"
            fullWidth
            required
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="sku"
            label="SKU"
            fullWidth
            required
            value={formData.sku}
            onChange={handleChange}
            disabled={editMode}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="quantity"
            label="Quantity"
            type="number"
            fullWidth
            required
            value={formData.quantity}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="unit_price"
            label="Unit Price"
            type="number"
            fullWidth
            required
            value={formData.unit_price}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="category"
            label="Category"
            fullWidth
            value={formData.category}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="location"
            label="Location"
            fullWidth
            value={formData.location}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Inventory;