import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/apiFetch';
import {
  Box, Typography, Alert, TextField, Button, Dialog,
  DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip, CircularProgress, Chip
} from '@mui/material';
import { Add, Edit, Delete, Cancel } from '@mui/icons-material';
import DataTable from '../components/DataTable';

export default function RoleManagementPage() {
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ name: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/roles');
      setRoles(data);
    } catch {
      setError('Nu s-au putut încărca rolurile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoles(); }, []);

  const handleOpen = (role = null) => {
    setError('');
    if (role) {
      setEditId(role.id);
      setForm({ name: role.name });
    } else {
      setEditId(null);
      setForm({ name: '' });
    }
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditId(null);
    setForm({ name: '' });
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.name) {
      setError('Numele rolului este obligatoriu!');
      return;
    }
    setLoading(true);
    try {
      if (editId) {
        await apiFetch(`/api/roles/${editId}`, {
          method: 'PUT',
          body: JSON.stringify({ name: form.name }),
        });
      } else {
        await apiFetch('/api/roles', {
          method: 'POST',
          body: JSON.stringify(form),
        });
      }
      handleClose();
      fetchRoles();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await apiFetch(`/api/roles/${deleteId}`, { method: 'DELETE' });
      setDeleteId(null);
      fetchRoles();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: 'id', label: 'ID' },
    {
      field: 'name', label: 'Nume',
      render: (val, row) => (
        <Chip label={val} size="small" color={row.id === 1 ? 'primary' : 'default'} />
      )
    },
    {
      field: 'actions', label: 'Acțiuni', sortable: false, align: 'right',
      render: (val, row) => (
        <>
          <Tooltip title="Editează">
            <IconButton size="small" onClick={() => handleOpen(row)} color="primary">
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Șterge">
            <IconButton size="small" onClick={() => setDeleteId(row.id)} color="error">
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      )
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>Roluri</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Adaugă rol
        </Button>
      </Box>

      {error && !dialogOpen && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading && !dialogOpen ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable
          rows={roles}
          columns={columns}
          searchFields={['name']}
          defaultSort={{ field: 'id', direction: 'asc' }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      )}

      {/* Dialog adaugă/editează */}
      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="xs" fullWidth disableRestoreFocus>
        <DialogTitle>{editId ? 'Editează rol' : 'Adaugă rol nou'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
          <TextField
            name="name"
            label="Nume rol"
            value={form.name}
            onChange={e => setForm({ name: e.target.value })}
            fullWidth
            required
            size="small"
            sx={{ mt: 1 }}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} startIcon={<Cancel />} color="inherit">Renunță</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : editId ? 'Salvează' : 'Adaugă'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog confirmare ștergere */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} disableRestoreFocus>
        <DialogTitle>Confirmare ștergere</DialogTitle>
        <DialogContent>
          <Typography>Sigur vrei să ștergi acest rol? Utilizatorii cu acest rol pot fi afectați.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} color="inherit">Renunță</Button>
          <Button onClick={handleDelete} variant="contained" color="error" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Șterge'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}