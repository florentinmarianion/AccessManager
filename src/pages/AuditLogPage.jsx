import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/apiFetch';
import { Box, Typography, Alert, Chip, CircularProgress } from '@mui/material';
import DataTable from '../components/DataTable';

function getActionColor(action) {
  if (!action) return 'default';
  if (action.includes('delete')) return 'error';
  if (action.includes('create')) return 'success';
  if (action.includes('update')) return 'warning';
  if (action.includes('login')) return 'info';
  return 'default';
}

const columns = [
  { field: 'id', label: 'ID' },
  { field: 'username', label: 'User', render: val => <b>{val || '—'}</b> },
  {
    field: 'action', label: 'Acțiune',
    render: val => (
      <Chip label={val || '—'} size="small"
        color={getActionColor(val)} variant="outlined" />
    )
  },
  {
    field: 'created_at', label: 'Timestamp',
    render: val => (
      <Typography variant="caption" color="text.secondary">
        {val ? new Date(val).toLocaleString('ro-RO') : '—'}
      </Typography>
    )
  },
];

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiFetch('/api/audit')
      .then(setLogs)
      .catch(() => setError('Nu s-au putut încărca log-urile.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        Audit Log
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable
          rows={logs}
          columns={columns}
          searchFields={['username', 'action']}
          defaultSort={{ field: 'id', direction: 'desc' }}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      )}
    </Box>
  );
}