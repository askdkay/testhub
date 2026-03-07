import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Tests from './pages/Tests';
import TakeTest from './pages/TakeTest';
import Dashboard from './pages/Admin/Dashboard';
import Students from './pages/Admin/Students';
import AddTest from './pages/Admin/AddTest';
import AddQuestions from './pages/Admin/AddQuestions';
import TailwindTest from './components/TailwindTest';
import ForgotPassword from './pages/ForgotPassword';
import TestResult from './pages/TestResult';




function PrivateRoute({ children }) {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
    const { user } = useAuth();
    return user?.role === 'admin' ? children : <Navigate to="/" />;
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/tests" element={
                        <PrivateRoute>
                            <Tests />
                        </PrivateRoute>
                    } />
                    <Route path="/test/:id" element={
                        <PrivateRoute>
                            <TakeTest />
                        </PrivateRoute>
                    } />
                    
                    {/* Admin Routes */}
                    <Route path="/admin" element={
                        <AdminRoute>
                            <Dashboard />
                        </AdminRoute>
                    } />
                    <Route path="/admin/students" element={
                        <AdminRoute>
                            <Students />
                        </AdminRoute>
                    } />
                    <Route path="/admin/add-test" element={
                        <AdminRoute>
                            <AddTest />
                        </AdminRoute>
                    } />
                    <Route path="/admin/add-questions/:testId" element={
                        <AdminRoute>
                            <AddQuestions />
                        </AdminRoute>
                    } />
                    <Route path="/test-result/:testId" element={
  <PrivateRoute>
    <TestResult />
  </PrivateRoute>
} />
                    <Route path="/test-tailwind" element={<TailwindTest />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;