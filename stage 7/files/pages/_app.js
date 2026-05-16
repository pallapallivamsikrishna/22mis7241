import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Head from 'next/head';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary:   { main: '#1565c0' },
    secondary: { main: '#f57c00' },
    background: { default: '#f4f6f8' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: { borderRadius: 10 },
});

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Notification Center</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}
