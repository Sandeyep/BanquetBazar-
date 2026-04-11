import React, { useEffect, useState, useContext } from 'react';
import api from '../../api/axiosInstance';
import { Calendar, Clock, User, Phone, Mail, Upload } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const UserDashboard = () => {
    const { user: authUser } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [profile, setProfile] = useState({
        phone_number: '',
        gender: '',
        profile_picture: null
    });
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        api.get('/bookings/').then(res => setBookings(res.data));
        // Fetch current user details to populate profile fields
        api.get(`/auth/profile/`).then(res => {
            setProfile({
                phone_number: res.data.phone_number || '',
                gender: res.data.gender || '',
                profile_picture: null
            });
            if (res.data.profile_picture) {
                setPreview(res.data.profile_picture.startsWith('http') ? res.data.profile_picture : `http://127.0.0.1:8000${res.data.profile_picture}`);
            }
        }).catch(err => console.error("Error fetching profile", err));
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('phone_number', profile.phone_number);
        formData.append('gender', profile.gender);
        if (profile.profile_picture) {
            formData.append('profile_picture', profile.profile_picture);
        }

        try {
            await api.patch(`/auth/profile/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error("Failed to update profile");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-indigo-900">My Dashboard</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Profile Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                <User size={20} className="mr-2 text-indigo-600" /> My Profile
                            </h2>
                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div className="flex flex-col items-center mb-6">
                                    <div className="relative group">
                                        <div className="h-24 w-24 rounded-full bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center overflow-hidden">
                                            {preview ? (
                                                <img src={preview} alt="Profile" className="h-full w-full object-cover" />
                                            ) : (
                                                <User size={40} className="text-indigo-200" />
                                            )}
                                        </div>
                                        <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-indigo-700 transition shadow-md">
                                            <Upload size={14} />
                                            <input type="file" className="hidden" onChange={e => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setProfile({ ...profile, profile_picture: file });
                                                    setPreview(URL.createObjectURL(file));
                                                }
                                            }} />
                                        </label>
                                    </div>
                                    <p className="mt-4 font-bold text-gray-800">{authUser?.username}</p>
                                    <p className="text-sm text-gray-500">{authUser?.email}</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase text-gray-400 mb-1 ml-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Your phone"
                                            className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                            value={profile.phone_number}
                                            onChange={e => setProfile({ ...profile, phone_number: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase text-gray-400 mb-1 ml-1">Gender</label>
                                    <select
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                        value={profile.gender}
                                        onChange={e => setProfile({ ...profile, gender: e.target.value })}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition shadow-md">
                                    Update Profile
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Booking History Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm p-8 h-full border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calendar size={20} className="mr-2 text-indigo-600" /> Booking History
                            </h2>

                            <div className="space-y-6">
                                {bookings.length > 0 ? bookings.map(b => (
                                    <div key={b.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center group">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between md:justify-start gap-4 mb-2">
                                                <h3 className="font-bold text-xl text-indigo-700 group-hover:text-indigo-600 transition">{b.hall_name}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${b.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    b.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {b.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-gray-500 text-sm space-x-6 mt-3">
                                                <span className="flex items-center"><Calendar size={16} className="mr-2 text-indigo-400" /> {b.event_date}</span>
                                                <span className="flex items-center"><Clock size={16} className="mr-2 text-indigo-400" /> Booked: {new Date(b.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <div className="mt-4 flex gap-4 text-sm text-gray-600">
                                                <span className="bg-gray-100 px-3 py-1 rounded-lg">Guests: <strong>{b.guest_count}</strong></span>
                                                <div className="flex flex-wrap gap-1">
                                                    {b.booked_services && b.booked_services.length > 0 ? b.booked_services.map((s, idx) => (
                                                        <span key={idx} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold border border-indigo-100">{s}</span>
                                                    )) : (
                                                        <span className="text-gray-400 text-[10px] font-bold bg-gray-50 px-2 py-0.5 rounded border border-gray-100">No Services</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-6 md:mt-0 md:text-right md:pl-8 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0">
                                            <p className="text-gray-400 text-xs uppercase font-semibold tracking-wider mb-1">Total Cost</p>
                                            <p className="text-2xl font-bold text-gray-900">Rs {b.total_cost}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                            <Calendar size={32} />
                                        </div>
                                        <p className="text-gray-500 text-lg">You haven't made any bookings yet.</p>
                                        <p className="text-gray-400 text-sm mt-2">Start by exploring our venues!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
