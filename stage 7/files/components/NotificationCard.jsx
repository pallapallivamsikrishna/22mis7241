import {
  Card, CardContent, CardActionArea,
  Typography, Chip, Box, Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FiberNewIcon from '@mui/icons-material/FiberNew';

const TYPE_COLORS = {
  Result:  'success',
  Event:   'info',
  Alert:   'error',
  Warning: 'warning',
};

export default function NotificationCard({ notification, isViewed, onView }) {
  const id        = notification.ID        || notification.id;
  const title     = notification.Type      || notification.type    || 'Notification';
  const message   = notification.Message   || notification.message || '';
  const type      = notification.Type      || notification.type    || '';
  const timestamp = notification.Timestamp || notification.timestamp;
  const sender    = notification.Sender    || notification.sender;
  const seen = isViewed(id);

  return (
    <Card
      elevation={seen ? 1 : 4}
      sx={{
        mb: 2,
        borderLeft: 4,
        borderColor: seen ? 'grey.300' : `${TYPE_COLORS[type] || 'primary'}.main`,
        opacity: seen ? 0.75 : 1,
        transition: 'all 0.2s',
      }}
    >
      <CardActionArea onClick={() => onView(id)} sx={{ p: 0 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
            <Box display="flex" alignItems="center" gap={1}>
              {seen
                ? <CheckCircleIcon fontSize="small" color="disabled" />
                : <FiberNewIcon fontSize="small" color="error" />}
              <Typography variant="subtitle1" fontWeight={seen ? 400 : 700}>
                {title}
              </Typography>
            </Box>
            <Box display="flex" gap={1} alignItems="center">
              <Chip
                label={type || 'general'}
                color={TYPE_COLORS[type] || 'default'}
                size="small"
              />
              {!seen && (
                <Chip label="NEW" color="error" size="small" variant="outlined" />
              )}
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" mb={1}>
            {message}
          </Typography>

          <Box display="flex" justifyContent="space-between">
            {sender && (
              <Typography variant="caption" color="text.secondary">
                From: {sender}
              </Typography>
            )}
            {timestamp && (
              <Tooltip title={new Date(timestamp).toLocaleString()}>
                <Typography variant="caption" color="text.secondary">
                  {new Date(timestamp).toLocaleDateString()}
                </Typography>
              </Tooltip>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
