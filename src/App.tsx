import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline } from '@mui/material';
import Sidebar from './components/Layout/Sidebar';
import PortfolioRecap from './components/portfolioRecap/PortfolioRecap';
import portfolioRecapTheme from './theme/portfolioRecapTheme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={portfolioRecapTheme}>
        <CssBaseline />
        <div className="flex h-screen bg-slate-100">
          <Sidebar />

          <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-y-auto">
              <PortfolioRecap />
            </main>
          </div>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
