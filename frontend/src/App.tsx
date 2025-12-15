import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuth } from './hooks/useAuth';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ChatLayout from './components/Layout/ChatLayout';

const queryClient = new QueryClient();

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <Login />
                )
              }
            />
            <Route
              path="/register"
              element={
                isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <Register />
                )
              }
            />
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <ChatLayout />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="*"
              element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
            />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
