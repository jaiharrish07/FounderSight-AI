import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes cache
    },
  },
})

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
            <Toaster position="bottom-right" theme="dark" toastOptions={{
                style: {
                    background: 'rgba(28, 28, 30, 0.8)',
                    backdropFilter: 'blur(40px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#f5f5f7',
                }
            }} />
        </QueryClientProvider>
    </StrictMode>,
)
