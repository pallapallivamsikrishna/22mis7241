import { useState, useEffect } from 'react';
import {
  Typography, Box, CircularProgress, Alert,
  Select, MenuItem, FormControl, InputLabel,
  TextField, Divider, Chip, Stack,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import Layout from '../components/Layout';
import NotificationCard from '../components/NotificationCard';
import { fetchNotifications } from '../lib/api';
import { useViewed } from '../lib/useViewed';

const TYPES = ['all', 'alert', 'info', 'success', 'warning'];

export default function PriorityNotifications() {
  const [allNotifications, setAllNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Controls
  const [topN, setTopN]       = useState(5);
  const [filterType, setFilterType] = useState('all');

  const { markViewed, isViewed } = useViewed();

  // Fetch a generous batch; priority slicing happens client-side
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    fetchNotifications({ limit: 100, page: 1 })
      .then((data) => {
        if (cancelled) return;
        const list = data.notifications ?? data.data ?? data ?? [];
        setAllNotifications(list);
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  // Apply type filter, then take top N
  const displayed = allNotifications
    .filter((n) => filterType === 'all' || n.type === filterType)
    .slice(0, topN);

  const unreadCount = allNotifications.filter((n) => !isViewed(n.id)).length;

  return (
    <Layout unreadCount={unreadCount}>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <StarIcon color="warning" />
        <Typography variant="h5" fontWeight={700}>Priority Notifications</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Showing top {topN} notifications{filterType !== 'all' ? ` of type "${filterType}"` : ''}
      </Typography>

      {/* Controls */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
        <TextField
          label="Top N"
          type="number"
          size="small"
          value={topN}
          inputProps={{ min: 1, max: 50 }}
          onChange={(e) => setTopN(Math.max(1, Number(e.target.value)))}
          sx={{ width: 120 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter by type</InputLabel>
          <Select
            value={filterType}
            label="Filter by type"
            onChange={(e) => setFilterType(e.target.value)}
          >
            {TYPES.map((t) => (
              <MenuItem key={t} value={t} sx={{ textTransform: 'capitalize' }}>
                {t}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : displayed.length === 0 ? (
        <Alert severity="info">No priority notifications match your filter.</Alert>
      ) : (
        <>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Chip
              label={`${displayed.length} shown`}
              color="warning"
              size="small"
              icon={<StarIcon />}
            />
            <Chip
              label={`${allNotifications.filter((n) => !isViewed(n.id)).length} unread total`}
              color="error"
              size="small"
              variant="outlined"
            />
          </Box>

          {displayed.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              isViewed={isViewed}
              onView={markViewed}
            />
          ))}
        </>
      )}
    </Layout>
  );
}
