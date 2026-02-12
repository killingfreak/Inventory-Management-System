import { useEffect, useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import auditService from '../services/auditService';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await auditService.getLogs();
      setLogs(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'action', headerName: 'Action', width: 120 },
    { field: 'item_id', headerName: 'Item ID', width: 100 },
    { field: 'user_id', headerName: 'User ID', width: 100 },
    { 
      field: 'changes', 
      headerName: 'Changes', 
      width: 400,
      renderCell: (params) => (
        <Box sx={{ whiteSpace: 'pre-wrap', overflow: 'auto', maxHeight: 100 }}>
          {params.value || '-'}
        </Box>
      ),
    },
    {
      field: 'timestamp',
      headerName: 'Timestamp',
      width: 200,
      valueFormatter: (params) => new Date(params.value).toLocaleString(),
    },
  ];

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Audit Logs
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Track all inventory changes and user actions
      </Typography>

      <Box sx={{ height: 600, width: '100%', mt: 3 }}>
        <DataGrid
          rows={logs}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          loading={loading}
          disableSelectionOnClick
          getRowHeight={() => 'auto'}
          sx={{
            '& .MuiDataGrid-cell': {
              py: 1,
            },
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default AuditLogs;