import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Home, LayoutDashboard, Building2, Calendar, LogOut } from 'lucide-react';

const AdminNavbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    if (!user || user.role !== 'admin') return null;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const adminLinks = [
        { name: 'Overview', path: '/admin/overview', icon: <LayoutDashboard size={20} /> },
        { name: 'Manage Bookings', path: '/dashboard', icon: <Calendar size={20} /> },
        { name: 'Manage Halls', path: '/admin/manage-halls', icon: <Building2 size={20} /> },
        { name: 'View Site', path: '/', icon: <Home size={20} /> },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-[50] shadow-sm">
            {/* Logo Section */}
            <div className="p-8 border-b border-gray-50">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-500 bg-clip-text text-transparent">
                    BanquetBazar
                </h2>
                <p className="text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase mt-1">Admin Panel</p>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 p-4 space-y-1 mt-4">
                {adminLinks.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group ${isActive
                                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                    : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'
                                }`}
                        >
                            <span className={`${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-500'} transition-colors`}>
                                {link.icon}
                            </span>
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            {/* User & Logout Section */}
            <div className="p-4 border-t border-gray-50 bg-gray-50/30">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 text-sm">
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-900 truncate">Hi, {user.username}</p>
                        <p className="text-[10px] text-gray-400 truncate uppercase tracking-wider">Administrator</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-red-100 text-red-600 font-semibold hover:bg-red-50 hover:border-red-200 transition-all shadow-sm active:scale-95"
                >
                    <LogOut size={16} />
                    <span className="text-sm">Log Out</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminNavbar;
