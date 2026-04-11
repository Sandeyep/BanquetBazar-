import React, { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { PlusCircle, Trash2, CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard = () => {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = () => {
        api.get('/bookings/').then(res => setBookings(res.data));
    };

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/bookings/${id}/`, { status });
            toast.success(`Booking ${status}`);
            fetchBookings();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-indigo-900">Admin Dashboard</h1>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-indigo-500 hover:shadow-lg transition-shadow">
                        <h3 className="text-gray-500 font-medium">Total Bookings</h3>
                        <p className="text-3xl font-bold text-gray-800 mt-2">{bookings.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-pink-500 hover:shadow-lg transition-shadow">
                        <h3 className="text-gray-500 font-medium">Pending Requests</h3>
                        <p className="text-3xl font-bold text-gray-800 mt-2">{bookings.filter(b => b.status === 'pending').length}</p>
                    </div>
                </div>

                {/* Manage Bookings Section */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Booking Applications</h2>
                    <div className="overflow-hidden bg-white rounded-xl shadow-md border border-gray-200">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 border-b font-semibold text-gray-600">Customer</th>
                                    <th className="p-4 border-b font-semibold text-gray-600">Contact & Info</th>
                                    <th className="p-4 border-b font-semibold text-gray-600">Venue</th>
                                    <th className="p-4 border-b font-semibold text-gray-600">Date</th>
                                    <th className="p-4 border-b font-semibold text-gray-600">Amount</th>
                                    <th className="p-4 border-b font-semibold text-gray-600">Services</th>
                                    <th className="p-4 border-b font-semibold text-gray-600">Status</th>
                                    <th className="p-4 border-b font-semibold text-gray-600">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {bookings.map(b => (
                                    <tr key={b.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 mr-3">
                                                    {b.user_details?.profile_picture ? (
                                                        <img className="h-10 w-10 rounded-full object-cover border border-gray-200" src={b.user_details.profile_picture.startsWith('http') ? b.user_details.profile_picture : `http://127.0.0.1:8000${b.user_details.profile_picture}`} alt="" />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                                                            {b.user_username.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-sm font-medium text-gray-900">{b.user_details?.username || b.user_username}</div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-gray-900">{b.user_details?.email}</div>
                                            <div className="text-xs text-gray-500">{b.user_details?.phone_number || 'No phone'} | {b.user_details?.gender || 'N/A'}</div>
                                        </td>
                                        <td className="p-4 text-gray-600">{b.hall_name}</td>
                                        <td className="p-4 text-gray-600">{b.event_date}</td>
                                        <td className="p-4 text-gray-600 font-medium">Rs {b.total_cost}</td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                                                {b.booked_services && b.booked_services.length > 0 ? b.booked_services.map((s, idx) => (
                                                    <span key={idx} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold border border-indigo-100 whitespace-nowrap">{s}</span>
                                                )) : (
                                                    <span className="text-gray-400 text-[10px]">-</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${b.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                b.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {b.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {b.status === 'pending' && (
                                                <div className="flex gap-3">
                                                    <button onClick={() => updateStatus(b.id, 'approved')} className="text-green-500 hover:text-green-700 bg-green-50 p-1 rounded-full"><CheckCircle size={20} /></button>
                                                    <button onClick={() => updateStatus(b.id, 'rejected')} className="text-red-500 hover:text-red-700 bg-red-50 p-1 rounded-full"><XCircle size={20} /></button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {bookings.length === 0 && <p className="p-8 text-center text-gray-500">No bookings requests found.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
