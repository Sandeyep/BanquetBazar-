import React, { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    PieChart, Pie, Cell 
} from 'recharts';
import { LayoutDashboard, TrendingUp, Users, Calendar } from 'lucide-react';

const AdminOverview = () => {
    const [bookings, setBookings] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [hallData, setHallData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/bookings/');
            const data = res.data;
            setBookings(data);
            processChartData(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching booking data:", error);
            setLoading(false);
        }
    };

    const processChartData = (data) => {
        // Monthly Trends
        const monthCounts = {};
        const hallCounts = {};

        data.forEach(booking => {
            // Process Monthly Data
            const date = new Date(booking.event_date);
            const month = date.toLocaleString('default', { month: 'short' });
            monthCounts[month] = (monthCounts[month] || 0) + 1;

            // Process Hall Data
            const hall = booking.hall_name;
            hallCounts[hall] = (hallCounts[hall] || 0) + 1;
        });

        const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedMonthly = monthsOrder
            .filter(m => monthCounts[m])
            .map(m => ({ name: m, bookings: monthCounts[m] }));

        setMonthlyData(formattedMonthly);

        const formattedHall = Object.keys(hallCounts).map(name => ({
            name,
            value: hallCounts[name]
        })).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5

        setHallData(formattedHall);
    };

    const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#f59e0b', '#10b981'];

    if (loading) return <div className="p-8 text-center">Loading Overview...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-indigo-900">System Overview</h1>
                    <p className="text-gray-500 mt-1">Analytics and booking trends for your banquet businesses.</p>
                </header>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                <LayoutDashboard size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Bookings</p>
                                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Approved</p>
                                <p className="text-2xl font-bold text-gray-900">{bookings.filter(b => b.status === 'approved').length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Pending</p>
                                <p className="text-2xl font-bold text-gray-900">{bookings.filter(b => b.status === 'pending').length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Monthly High</p>
                                <p className="text-2xl font-bold text-gray-900">{monthlyData[0]?.name || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Monthly Bookings Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <TrendingUp size={20} className="text-indigo-500" />
                            Booking Trends (Monthly)
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                    <Tooltip 
                                        cursor={{fill: '#f8fafc'}}
                                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                    />
                                    <Bar dataKey="bookings" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Popular Halls Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-6">Most Booked Halls</h3>
                        <div className="h-[300px] w-full flex items-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={hallData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {hallData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                    />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
