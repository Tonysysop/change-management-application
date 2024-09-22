import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import { ThemeProvider } from '@/components/theme-provider';
import { ModeToggle } from '@/components/mode-toggle';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Signup from './pages/Signup'
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute'




function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Router>
          <ModeToggle />
          <Routes>
            <Route path="*" element={<NotFound />} />
            <Route path="/" element={<Login />} />
            <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
            <Route path="/Signup" element={<Signup />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  
  );
}

export default App;
