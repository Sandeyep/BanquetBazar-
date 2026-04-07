import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, User, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await login(formData.username, formData.password);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid username or password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
            <div className="max-w-md w-full">
                {/* Brand Header */}


                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10 transition-all hover:shadow-2xl">
                    <div className="text-center mb-8">

                        <h2 className="text-3xl font-bold text-gray-800">Login</h2>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700 text-sm animate-pulse">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-600 ml-1">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Enter your username"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-bold text-gray-600">Password</label>
                                <a href="#" className="text-xs font-semibold text-indigo-600 hover:underline">Forgot?</a>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-indigo-200 transform transition active:scale-95 flex items-center justify-center gap-2 ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5'
                                }`}
                        >
                            {isLoading ? 'Logging in...' : 'Sign In'}
                            {!isLoading && <ArrowRight size={18} />}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                        <p className="text-gray-500 text-sm">
                            New to BanquetBazar?{' '}
                            <Link to="/register" className="text-indigo-600 font-bold hover:underline">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400">
                        &copy; 2026 BanquetBazar MS. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
