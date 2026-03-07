import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Tests from './pages/Tests';
import TakeTest from './pages/TakeTest';
import AdminDashboard from './pages/Admin/Dashboard';
import AddTest from './pages/Admin/AddTest';
import AddQuestions from './pages/Admin/AddQuestions';

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
                            <AdminDashboard />
                        </AdminRoute>
                    } />
                    <Route path="/admin/add-test" element={
                        <AdminRoute>
                            <AddTest />
                        </AdminRoute>
                    } />
                    <Route path="/admin/add-questions" element={
                        <AdminRoute>
                            <AddQuestions />
                        </AdminRoute>
                    } />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;