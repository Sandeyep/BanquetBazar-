import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { Menu, X, LogOut, User, LayoutDashboard, Home, MapPin, Building2 } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/login");
  };

  const navLinks = [
    { name: "Home", path: "/", icon: <Home size={18} /> },
    { name: "Venues", path: "/venues", icon: <MapPin size={18} /> },
    ...(user?.role === 'admin' ? [{ name: "Manage Halls", path: "/admin/manage-halls", icon: <Building2 size={18} /> }] : []),
    ...(user ? [{ name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> }] : []),
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-indigo-200 shadow-lg">
              B
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-500 bg-clip-text text-transparent">
              BanquetBazar
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition-colors"
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-700">
                  Hi, {user.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full font-medium hover:bg-red-100 transition"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium">Login</Link>
                <Link to="/register" className="bg-indigo-600 text-white px-5 py-2 rounded-full font-medium hover:bg-indigo-700 shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-indigo-600 focus:outline-none">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full left-0">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="flex items-center gap-3 block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                onClick={() => setIsOpen(false)}
              >
                {link.icon} {link.name}
              </Link>
            ))}
            <div className="border-t border-gray-100 my-2 pt-2">
              {user ? (
                <>
                  <div className="px-3 py-2 flex items-center gap-3 text-gray-700 font-medium">
                    <User size={18} /> {user.username}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 px-3 py-3 text-red-600 font-medium hover:bg-red-50 rounded-md"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3 mt-2">
                  <Link to="/login" onClick={() => setIsOpen(false)} className="w-full text-center border border-indigo-600 text-indigo-600 py-2 rounded-lg font-medium">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="w-full text-center bg-indigo-600 text-white py-2 rounded-lg font-medium shadow">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
