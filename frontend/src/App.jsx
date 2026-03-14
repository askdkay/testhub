import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminLogin from "./pages/Admin/AdminLogin";
import Register from "./pages/Register";
import Tests from "./pages/Tests";
import TakeTest from "./pages/TakeTest";
import Dashboard from "./pages/Admin/Dashboard";
import Students from "./pages/Admin/Students";
import AddTest from "./pages/Admin/AddTest";
import AddQuestions from "./pages/Admin/AddQuestions";
import TailwindTest from "./components/TailwindTest";
import ForgotPassword from "./pages/ForgotPassword";
import TestResult from "./pages/TestResult";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Exams from "./pages/Exams";
import GkCurrentAffairs from "./pages/GkCurrentAffairs";
import UserAnalytics from "./pages/Admin/Analytics";
import FreeTests from "./pages/FFF";
import TestManagement from "./pages/Admin/TestManagement";
import BulkTestImport from "./pages/Admin/BulkTestImport";
import ContentManagement from "./pages/Admin/ContentManagement";
import ExamContent from "./pages/Exams/ExamContent";

// Private Route for Logged in users
function PrivateRoute({ children }) {
  const { user, loading } = useAuth(); // Loading state import ki

  if (loading) return <div className='h-screen flex items-center justify-center text-white'>Loading...</div>; // Jab tak data check ho raha hai, tab tak wait karega

  return user ? children : <Navigate to='/login' replace />;
}

// Admin Route for Admin users
function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className='h-screen flex items-center justify-center text-white bg-gray-950'>Loading Admin...</div>;

  // Agar user admin nahi hai, toh ab usko `/admin/login` par bhejenge
  return user?.role === "admin" ? children : <Navigate to='/admin/login' replace />;
}

// Navbar Wrapper logic
function NavbarWrapper() {
  const location = useLocation();
  const hideNavbarPaths = ["/login", "/register", "/forgot-password"];
  const shouldHide = location.pathname.startsWith("/admin") || hideNavbarPaths.includes(location.pathname);

  if (shouldHide) {
    return null;
  }
  return <Navbar />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavbarWrapper />

        {/* Sirf EK Routes component hona chahiye */}
        <Routes>
          {/* Public Routes */}
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/exams' element={<Exams />} />
          <Route path='/GkCurrentAffairs' element={<GkCurrentAffairs />} />
          <Route path='/test-tailwind' element={<TailwindTest />} />
          <Route path='/fff' element={<FreeTests />} />
          <Route path="/exam/:examSlug/study" element={<ExamContent />} />
          {/* User Protected Routes */}
          <Route
            path='/tests'
            element={
              <PrivateRoute>
                <Tests />
              </PrivateRoute>
            }
          />
          <Route
            path='/test/:id'
            element={
              <PrivateRoute>
                <TakeTest />
              </PrivateRoute>
            }
          />
          <Route
            path='/test-result/:testId'
            element={
              <PrivateRoute>
                <TestResult />
              </PrivateRoute>
            }
          />
          <Route
            path='/settings'
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          <Route
            path='/profile'
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          {/* Admin Routes */}
          <Route path='/admin/login' element={<AdminLogin />} />
          // Admin routes mein yeh add karo:
          <Route
            path='/admin/tests'
            element={
              <AdminRoute>
                <TestManagement />
              </AdminRoute>
            }
          />
          <Route
            path='/admin/bulk-import'
            element={
              <AdminRoute>
                <BulkTestImport />
              </AdminRoute>
            }
          />
          {/* Admin Routes */}
          <Route
            path='/admin'
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          />
          <Route path="/admin/content" element={
  <AdminRoute>
    <ContentManagement />
  </AdminRoute>
} />
          <Route
            path='/admin'
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          />
          <Route
            path='/admin/students'
            element={
              <AdminRoute>
                <Students />
              </AdminRoute>
            }
          />
          <Route
            path='/admin/add-test'
            element={
              <AdminRoute>
                <AddTest />
              </AdminRoute>
            }
          />
          <Route
            path='/admin/add-questions/:testId'
            element={
              <AdminRoute>
                <AddQuestions />
              </AdminRoute>
            }
          />
          {/* Jo route aapne alag rakha tha, use yahan merge kar diya */}
          <Route
            path='/admin/users'
            element={
              <AdminRoute>
                <UserAnalytics />
              </AdminRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
