import { AppBar, Toolbar, Typography, Button, Container, Box, Badge } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StarIcon from '@mui/icons-material/Star';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Layout({ children, unreadCount = 0 }) {
  const router = useRouter();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={2}>
        <Toolbar>
          <NotificationsIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Notification Center
          </Typography>
          <Link href="/" passHref legacyBehavior>
            <Button
              color="inherit"
              startIcon={
                <Badge badgeContent={unreadCount} color="error" max={99}>
                  <NotificationsIcon />
                </Badge>
              }
              sx={{
                mr: 1,
                fontWeight: router.pathname === '/' ? 700 : 400,
                borderBottom: router.pathname === '/' ? '2px solid white' : 'none',
              }}
            >
              All
            </Button>
          </Link>
          <Link href="/priority" passHref legacyBehavior>
            <Button
              color="inherit"
              startIcon={<StarIcon />}
              sx={{
                fontWeight: router.pathname === '/priority' ? 700 : 400,
                borderBottom: router.pathname === '/priority' ? '2px solid white' : 'none',
              }}
            >
              Priority
            </Button>
          </Link>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
