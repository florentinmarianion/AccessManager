import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/apiFetch';
import {
  Box, Typography, Alert, TextField, Button, Grid,
  MenuItem, Select, FormControl, InputLabel, Dialog,
  DialogTitle, DialogContent, DialogActions,
  IconButton, Chip, Tooltip, CircularProgress
} from '@mui/material';
import { Add, Edit, Delete, Cancel } from '@mui/icons-material';
import DataTable from '../components/DataTable';

const emptyForm = {
  username: '', email: '', first_name: '', last_name: '',
  phone: '', custom_fields: '', password: '', role_id: ''
};

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesData, usersData] = await Promise.all([
        apiFetch('/api/roles'),
        apiFetch('/api/users'),
      ]);
      setRoles(rolesData);
      setUsers(usersData);
    } catch {
      setError('Nu s-au putut încărca datele.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleOpen = (user = null) => {
    if (user) {
      setEditId(user.id);
      setForm({
        username: user.username, email: user.email,
        first_name: user.first_name || '', last_name: user.last_name || '',
        phone: user.phone || '', custom_fields: JSON.stringify(user.custom_fields || {}),
        password: '', role_id: user.role_id,
      });
    } else {
      setEditId(null);
      setForm(emptyForm);
    }
    setError('');
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditId(null);
    setForm(emptyForm);
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.email || (!editId && !form.password) || !form.role_id) {
      setError('Username, email, parolă și rol sunt obligatorii!');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      setError('Email invalid!'); return;
    }
    if (form.phone && !/^\d{8,}$/.test(form.phone)) {
      setError('Telefon invalid! Minim 8 cifre.'); return;
    }
    let customFieldsObj = {};
    if (form.custom_fields) {
      try { customFieldsObj = JSON.parse(form.custom_fields); }
      catch { setError('Câmpuri dinamice trebuie să fie JSON valid!'); return; }
    }
    setLoading(true);
    try {
      if (editId) {
        await apiFetch(`/api/users/${editId}`, {
          method: 'PUT',
          body: JSON.stringify({ ...form, custom_fields: customFieldsObj }),
        });
      } else {
        await apiFetch('/api/users', {
          method: 'POST',
          body: JSON.stringify({ ...form, custom_fields: customFieldsObj }),
        });
      }
      handleClose();
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await apiFetch(`/api/users/${deleteId}`, { method: 'DELETE' });
      setDeleteId(null);
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleName = (role_id) => roles.find(r => r.id === role_id)?.name || role_id;

  const columns = [
    { field: 'id', label: 'ID' },
    { field: 'username', label: 'Username', render: val => <b>{val}</b> },
    { field: 'email', label: 'Email' },
    {
      field: 'first_name', label: 'Nume',
      render: (val, row) => [row.first_name, row.last_name].filter(Boolean).join(' ') || '—'
    },
    { field: 'phone', label: 'Telefon', render: val => val || '—' },
    {
      field: 'role_id', label: 'Rol',
      render: val => (
        <Chip label={getRoleName(val)} size="small"
          color={val === 1 ? 'primary' : 'default'} />
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
        <Typography variant="h6" fontWeight={600}>Utilizatori</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Adaugă utilizator
        </Button>
      </Box>

      {error && !dialogOpen && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading && !dialogOpen ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable
          rows={users}
          columns={columns}
          searchFields={['username', 'email', 'phone']}
          defaultSort={{ field: 'id', direction: 'asc' }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      )}

      {/* Dialog adaugă/editează */}
      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth disableRestoreFocus>
        <DialogTitle>{editId ? 'Editează utilizator' : 'Adaugă utilizator nou'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={6}>
              <TextField name="username" label="Username" value={form.username}
                onChange={handleChange} fullWidth required size="small" />
            </Grid>
            <Grid size={6}>
              <TextField name="email" label="Email" value={form.email}
                onChange={handleChange} fullWidth required size="small" />
            </Grid>
            <Grid size={6}>
              <TextField name="first_name" label="Prenume" value={form.first_name}
                onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <TextField name="last_name" label="Nume" value={form.last_name}
                onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <TextField name="phone" label="Telefon" value={form.phone}
                onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Rol</InputLabel>
                <Select name="role_id" value={form.role_id} label="Rol" onChange={handleChange}>
                  {roles.map(r => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            {!editId && (
              <Grid size={12}>
                <TextField name="password" label="Parolă" type="password" value={form.password}
                  onChange={handleChange} fullWidth required size="small" />
              </Grid>
            )}
            <Grid size={12}>
              <TextField name="custom_fields" label="Câmpuri dinamice (JSON)"
                value={form.custom_fields} onChange={handleChange}
                fullWidth size="small" placeholder='{"cheie": "valoare"}' />
            </Grid>
          </Grid>
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
          <Typography>Sigur vrei să ștergi acest utilizator? Acțiunea nu poate fi anulată.</Typography>
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