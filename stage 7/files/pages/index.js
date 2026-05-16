import { useState, useEffect, useMemo } from 'react';
import {
  Typography, Box, Pagination, CircularProgress,
  Alert, Select, MenuItem, FormControl, InputLabel,
  Divider, Chip,
} from '@mui/material';
import Layout from '../components/Layout';
import NotificationCard from '../components/NotificationCard';
import { fetchNotifications } from '../lib/api';
import { useViewed } from '../lib/useViewed';

const PAGE_SIZE_OPTIONS = [5, 10, 20];

export default function AllNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage]         = useState(1);
  const [limit, setLimit]       = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const { markViewed, isViewed } = useViewed();

  const unreadCount = useMemo(
    () => notifications.filter((n) => !isViewed(n.id)).length,
    [notifications, isViewed]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    fetchNotifications({ page, limit })
      .then((data) => {
        if (cancelled) return;
        // Support various API response shapes
        const list  = data.notifications ?? data.data ?? data ?? [];
        const total = data.totalPages ?? data.total_pages ?? Math.ceil((data.total ?? list.length) / limit) ?? 1;
        setNotifications(list);
        setTotalPages(total || 1);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [page, limit]);

  return (
    <Layout unreadCount={unreadCount}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>All Notifications</Typography>
          <Typography variant="body2" color="text.secondary">
            {unreadCount} unread
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Per page</InputLabel>
          <Select
            value={limit}
            label="Per page"
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <MenuItem key={n} value={n}>{n}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : notifications.length === 0 ? (
        <Alert severity="info">No notifications found.</Alert>
      ) : (
        <>
          {notifications.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              isViewed={isViewed}
              onView={markViewed}
            />
          ))}

          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, val) => setPage(val)}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        </>
      )}
    </Layout>
  );
}
