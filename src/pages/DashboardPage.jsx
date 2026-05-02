import React, { useEffect, useState } from 'react';
import UserManagementPage from './UserManagementPage';
import RoleManagementPage from './RoleManagementPage';
import AuditLogPage from './AuditLogPage';
import { apiFetch } from '../utils/apiFetch';
import {
  Box, AppBar, Toolbar, Typography, Button, Container,
  Avatar, Chip, Divider, Paper, List, ListItem, ListItemText, Tab, Tabs
} from '@mui/material';
import { LogoutOutlined, AdminPanelSettings, Person } from '@mui/icons-material';

export default function DashboardPage({ user, handleLogout }) {
  const [roles, setRoles] = useState([]);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    apiFetch('/api/roles').then(setRoles).catch(() => {});
  }, []);

  const isAdmin = user.role_id === 1;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>

      {/* Navbar */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={700} color="primary">
            User Access Manager
          </Typography>
		  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
			<Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: 14 }}>
				{user.username[0].toUpperCase()}
			</Avatar>
			<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
				<Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1, marginTop: '15px' }}>
				{user.username}
				</Typography>
				<Typography variant="caption" color="text.secondary">
				{isAdmin ? 'Administrator' : 'User'}
				</Typography>
			</Box>
			<Button
				variant="outlined"
				size="small"
				startIcon={<LogoutOutlined />}
				onClick={handleLogout}
				color="inherit"
				sx={{ color: 'text.secondary', borderColor: 'divider' }}
			>
				Logout
			</Button>
		   </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>

        {/* Roluri disponibile */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Roluri disponibile în sistem
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
            {roles.map(r => (
              <Chip
                key={r.id}
                label={r.name}
                size="small"
                color={r.id === user.role_id ? 'primary' : 'default'}
                icon={r.id === 1 ? <AdminPanelSettings /> : <Person />}
              />
            ))}
          </Box>
        </Paper>

        {/* Zona admin */}
        {isAdmin && (
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}
            >
              <Tab label="Utilizatori" />
              <Tab label="Roluri" />
              <Tab label="Audit Log" />
            </Tabs>
            <Box sx={{ p: 3 }}>
              {tab === 0 && <UserManagementPage />}
              {tab === 1 && <RoleManagementPage />}
              {tab === 2 && <AuditLogPage />}
            </Box>
          </Paper>
        )}

      </Container>
    </Box>
  );
}