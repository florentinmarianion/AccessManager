import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { SentimentDissatisfied } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    }}>
      <SentimentDissatisfied sx={{ fontSize: 64, color: 'text.disabled' }} />
      <Typography variant="h1" fontWeight={700} color="primary" lineHeight={1}>
        404
      </Typography>
      <Typography variant="h6" color="text.secondary">
        Pagina nu a fost găsită.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 1 }}>
        Înapoi acasă
      </Button>
    </Box>
  );
}