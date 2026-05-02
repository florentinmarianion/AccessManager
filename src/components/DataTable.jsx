// src/components/DataTable.jsx
import React, { useState, useMemo } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, TextField, InputAdornment, TableSortLabel,
  TablePagination, Typography, Chip
} from '@mui/material';
import { Search } from '@mui/icons-material';

export default function DataTable({
  columns,      // [{ field, label, sortable, render }]
  rows,         // array de obiecte
  searchFields, // ['username', 'action'] — câmpurile pe care se caută
  defaultSort,  // { field: 'id', direction: 'desc' }
  rowsPerPageOptions = [10, 25, 50, 100],
}) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState(defaultSort || { field: columns[0]?.field, direction: 'asc' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);

  const handleSort = (field) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPage(0);
  };

  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter(row =>
      (searchFields || columns.map(c => c.field)).some(field =>
        (row[field] ?? '').toString().toLowerCase().includes(q)
      )
    );
  }, [rows, search, searchFields, columns]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const valA = a[sort.field] ?? '';
      const valB = b[sort.field] ?? '';
      const cmp = valA.toString().localeCompare(valB.toString(), 'ro', { numeric: true });
      return sort.direction === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sort]);

  const paginated = useMemo(() => {
    return sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sorted, page, rowsPerPage]);

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {filtered.length} din {rows.length} înregistrări
        </Typography>
        <TextField
          size="small"
          placeholder="Caută..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }
          }}
          sx={{ width: 250 }}
        />
      </Box>

      {/* Tabel */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              {columns.map(col => (
                <TableCell key={col.field} align={col.align || 'left'}>
                  {col.sortable !== false ? (
                    <TableSortLabel
                      active={sort.field === col.field}
                      direction={sort.field === col.field ? sort.direction : 'asc'}
                      onClick={() => handleSort(col.field)}
                    >
                      <b>{col.label}</b>
                    </TableSortLabel>
                  ) : (
                    <b>{col.label}</b>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  Nu există înregistrări.
                </TableCell>
              </TableRow>
            ) : paginated.map((row, i) => (
              <TableRow key={row.id ?? i} hover>
                {columns.map(col => (
                  <TableCell key={col.field} align={col.align || 'left'}>
                    {col.render ? col.render(row[col.field], row) : (row[col.field] ?? '—')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginare */}
      <TablePagination
        component="div"
        count={filtered.length}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
        rowsPerPageOptions={rowsPerPageOptions}
        labelRowsPerPage="Rânduri pe pagină:"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} din ${count}`}
      />
    </Box>
  );
}