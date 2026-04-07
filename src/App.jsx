import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/common/navbar";
import AdminNavbar from "./components/common/AdminNavbar";
import Footer from "./components/common/footer";
import Dashboard from "./dashboard";
import HallList from "./HallList";
import Home from "./pages/Home";
import AllVenues from "./pages/AllVenues";
import VenueDetail from "./pages/VenueDetail";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ManageHalls from "./pages/admin/ManageHalls";
import AdminOverview from "./pages/admin/AdminOverview";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useContext } from "react";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

const App = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin') || 
                      (location.pathname === '/dashboard' && user?.role === 'admin');

  return (
    <>
      <Navbar />
      <AdminNavbar />
      <div className={`min-h-[calc(100vh-64px)] overflow-x-hidden ${user?.role === 'admin' ? 'pl-64' : ''}`}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/venues" element={<AllVenues />} />
          <Route
            path="/book/:hallId"
            element={
              <ProtectedRoute>
                <VenueDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/manage-halls"
            element={
              <ProtectedRoute>
                <ManageHalls />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/overview"
            element={
              <ProtectedRoute>
                <AdminOverview />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      {!isAdminRoute && <Footer />}
    </>
  );
};

export default App;
