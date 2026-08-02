import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import RoutinesPage from './pages/RoutinesPage'
import BodyMetricsPage from './pages/BodyMetricsPage'
import MyPage from './pages/MyPage'
import BottomNav from './components/BottomNav'

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-paper/40 text-sm">불러오는 중...</div>
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return (
    <div className="max-w-md mx-auto min-h-screen relative">
      {children}
      <BottomNav />
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedLayout><HomePage /></ProtectedLayout>} />
      <Route path="/routines" element={<ProtectedLayout><RoutinesPage /></ProtectedLayout>} />
      <Route path="/metrics" element={<ProtectedLayout><BodyMetricsPage /></ProtectedLayout>} />
      <Route path="/me" element={<ProtectedLayout><MyPage /></ProtectedLayout>} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
