import React, { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { PlusCircle, Trash2, Edit, MapPin, Building2 } from 'lucide-react';

const ManageHalls = () => {
    const [halls, setHalls] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingHall, setEditingHall] = useState(null);

    const [hallForm, setHallForm] = useState({
        name: '',
        price: '',
        capacity: '',
        location: '',
        description: '',
        event_types: [],
        google_maps_link: '',
        image: null
    });

    const EVENT_TYPE_OPTIONS = ['Wedding', 'Corporate', 'Birthday', 'Social', 'Other'];

    useEffect(() => {
        fetchHalls();
    }, []);

    const fetchHalls = () => {
        api.get('/halls/').then(res => setHalls(res.data)).catch(err => console.error(err));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        Object.keys(hallForm).forEach(key => {
            if (key === 'event_types') {
                formData.append(key, JSON.stringify(hallForm[key]));
            } else if (key === 'image' && hallForm[key]) {
                formData.append(key, hallForm[key]);
            } else if (hallForm[key] !== null && hallForm[key] !== '') {
                formData.append(key, hallForm[key]);
            }
        });

        try {
            if (editingHall) {
                await api.patch(`/halls/${editingHall.id}/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Hall updated successfully!");
            } else {
                await api.post('/halls/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Hall added successfully!");
            }
            resetForm();
            fetchHalls();
        } catch (error) {
            toast.error("Failed to save hall");
            console.error(error);
        }
    };

    const handleEdit = (hall) => {
        setEditingHall(hall);
        setHallForm({
            name: hall.name,
            price: hall.price,
            capacity: hall.capacity,
            location: hall.location,
            description: hall.description,
            event_types: hall.event_types || [],
            google_maps_link: hall.google_maps_link || '',
            image: null
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this hall?")) {
            try {
                await api.delete(`/halls/${id}/`);
                toast.success("Hall deleted successfully");
                fetchHalls();
            } catch (error) {
                toast.error("Failed to delete hall");
            }
        }
    };

    const resetForm = () => {
        setHallForm({
            name: '',
            price: '',
            capacity: '',
            location: '',
            description: '',
            event_types: [],
            google_maps_link: '',
            image: null
        });
        setEditingHall(null);
        setShowForm(false);
    };

    const toggleEventType = (type) => {
        setHallForm(prev => ({
            ...prev,
            event_types: prev.event_types.includes(type)
                ? prev.event_types.filter(t => t !== type)
                : [...prev.event_types, type]
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-indigo-900 flex items-center gap-3">
                            <Building2 size={36} />
                            Manage Halls
                        </h1>
                        <p className="text-gray-600 mt-1">Add, edit, and manage your banquet halls</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition shadow-md"
                    >
                        <PlusCircle size={20} />
                        {showForm ? 'Cancel' : 'Add New Hall'}
                    </button>
                </div>

                {/* Add/Edit Hall Form */}
                {showForm && (
                    <div className="bg-white p-8 rounded-xl shadow-lg mb-8 border border-gray-100">
                        <h3 className="text-xl font-bold mb-6 text-gray-800">
                            {editingHall ? 'Edit Hall' : 'Add New Hall'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input
                                    placeholder="Hall Name"
                                    className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                    value={hallForm.name}
                                    onChange={e => setHallForm({ ...hallForm, name: e.target.value })}
                                />
                                <input
                                    placeholder="Location"
                                    className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                    value={hallForm.location}
                                    onChange={e => setHallForm({ ...hallForm, location: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder="Price (Rs)"
                                    className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                    value={hallForm.price}
                                    onChange={e => setHallForm({ ...hallForm, price: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder="Capacity (Guests)"
                                    className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                    value={hallForm.capacity}
                                    onChange={e => setHallForm({ ...hallForm, capacity: e.target.value })}
                                />
                            </div>

                            {/* Event Types - Multiple Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Event Types (Select multiple)
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {EVENT_TYPE_OPTIONS.map(type => (
                                        <label
                                            key={type}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition ${hallForm.event_types.includes(type)
                                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                                    : 'border-gray-200 hover:border-indigo-300'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={hallForm.event_types.includes(type)}
                                                onChange={() => toggleEventType(type)}
                                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded"
                                            />
                                            <span className="font-medium">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Google Maps Link */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Google Maps Embed Link (Optional)
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://www.google.com/maps/embed?pb=..."
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={hallForm.google_maps_link}
                                    onChange={e => setHallForm({ ...hallForm, google_maps_link: e.target.value })}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Get embed link: Google Maps → Share → Embed a map → Copy src URL
                                </p>
                            </div>

                            <textarea
                                placeholder="Description"
                                rows="4"
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                                value={hallForm.description}
                                onChange={e => setHallForm({ ...hallForm, description: e.target.value })}
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload Image {editingHall && '(Leave empty to keep current image)'}
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    onChange={e => setHallForm({ ...hallForm, image: e.target.files[0] })}
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-semibold shadow-md transition flex-1"
                                >
                                    {editingHall ? 'Update Hall' : 'Add Hall'}
                                </button>
                                {editingHall && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 font-semibold shadow-md transition"
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                )}

                {/* Halls Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {halls.map(hall => (
                        <div key={hall.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                            {/* Hall Image */}
                            <div className="h-48 bg-gray-200 relative">
                                {hall.image ? (
                                    <img src={hall.image} alt={hall.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        <Building2 size={48} />
                                    </div>
                                )}
                            </div>

                            {/* Hall Details */}
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-bold text-lg text-gray-800">{hall.name}</h4>
                                    <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded text-sm">
                                        Rs {parseFloat(hall.price).toLocaleString()}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <MapPin size={14} className="mr-2 text-indigo-400" />
                                        {hall.location}
                                    </div>
                                    <div>Capacity: {hall.capacity} guests</div>
                                </div>

                                {/* Event Types Badges */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {(hall.event_types && hall.event_types.length > 0 ? hall.event_types : [hall.event_type]).filter(Boolean).map((type, idx) => (
                                        <span key={idx} className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">
                                            {type}
                                        </span>
                                    ))}
                                </div>

                                {/* Google Maps Link */}
                                {hall.google_maps_link && (
                                    <a
                                        href={hall.google_maps_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 text-sm flex items-center gap-1 mb-4 hover:text-indigo-700"
                                    >
                                        <MapPin size={14} />
                                        View on Map
                                    </a>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(hall)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition font-medium"
                                    >
                                        <Edit size={16} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(hall.id)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition font-medium"
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {halls.length === 0 && (
                    <div className="text-center text-gray-500 py-16 bg-white rounded-xl shadow-sm">
                        <Building2 size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No halls yet</h3>
                        <p className="text-gray-500">Click "Add New Hall" to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageHalls;
