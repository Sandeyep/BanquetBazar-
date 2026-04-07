import React, { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { PlusCircle, Trash2, Edit, MapPin, Building2, Star, RefreshCw, Banknote, X } from 'lucide-react';

const ManageHalls = () => {
    const [halls, setHalls] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingHall, setEditingHall] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const [hallForm, setHallForm] = useState({
        name: '',
        price: '',
        capacity: '',
        location: '',
        description: '',
        event_types: [],
        google_maps_link: '',
        image: null,
        rating: 4.0,
        price_per_plate: 500,
        decoration_price: 10000,
        makeup_price: 5000,
        dj_price: 5000,
        photography_price: 10000,
        galleryImages: [],
        existingImages: [],
        menu: {} // { "Category": ["Item 1", "Item 2"] }
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
            if (key === 'event_types' || key === 'menu') {
                formData.append(key, JSON.stringify(hallForm[key]));
            } else if (key === 'image' && hallForm[key]) {
                formData.append(key, hallForm[key]);
            } else if (key === 'galleryImages') {
                hallForm.galleryImages.forEach(file => {
                    formData.append('images', file);
                });
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
            image: null,
            rating: hall.rating || 4.0,
            price_per_plate: hall.price_per_plate || 500,
            decoration_price: hall.decoration_price || 10000,
            makeup_price: hall.makeup_price || 5000,
            dj_price: hall.dj_price || 5000,
            photography_price: hall.photography_price || 10000,
            galleryImages: [],
            existingImages: hall.images || [],
            menu: hall.menu || {}
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
            image: null,
            rating: 4.0,
            price_per_plate: 500,
            decoration_price: 10000,
            makeup_price: 5000,
            dj_price: 5000,
            photography_price: 10000,
            galleryImages: [],
            existingImages: [],
            menu: {}
        });
        setEditingHall(null);
        setShowForm(false);
    };

    const handleSyncAI = async () => {
        setIsSyncing(true);
        const toastId = toast.loading("Synchronizing AI model... Please wait.");
        try {
            const response = await api.post('/ai/sync/');
            toast.success(response.data.message, { id: toastId });
        } catch (error) {
            toast.error("Failed to sync AI model. Check server logs.", { id: toastId });
            console.error(error);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDeleteExistingImage = async (imageId) => {
        if (window.confirm("Remove this image from gallery?")) {
            try {
                await api.delete(`/hall-images/${imageId}/`);
                setHallForm(prev => ({
                    ...prev,
                    existingImages: prev.existingImages.filter(img => img.id !== imageId)
                }));
                toast.success("Image removed");
                fetchHalls(); // Refresh to update counts
            } catch (error) {
                toast.error("Failed to remove image");
                console.error(error);
            }
        }
    };

    const handleAddMenuCategory = (category) => {
        if (!category) return;
        setHallForm(prev => ({
            ...prev,
            menu: { ...prev.menu, [category]: [] }
        }));
    };

    const handleAddMenuItem = (category, item) => {
        if (!item) return;
        setHallForm(prev => ({
            ...prev,
            menu: { 
                ...prev.menu, 
                [category]: [...prev.menu[category], item]
            }
        }));
    };

    const handleRemoveMenuItem = (category, index) => {
        setHallForm(prev => ({
            ...prev,
            menu: {
                ...prev.menu,
                [category]: prev.menu[category].filter((_, i) => i !== index)
            }
        }));
    };

    const handleRemoveMenuCategory = (category) => {
        const newMenu = { ...hallForm.menu };
        delete newMenu[category];
        setHallForm({ ...hallForm, menu: newMenu });
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
                    <div className="flex gap-4">
                        <button
                            onClick={handleSyncAI}
                            disabled={isSyncing}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition shadow-md ${isSyncing ? 'bg-gray-400 cursor-wait text-white' : 'bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50'}`}
                        >
                            <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
                            {isSyncing ? 'Syncing...' : 'Sync AI Recommender'}
                        </button>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition shadow-md"
                        >
                            <PlusCircle size={20} />
                            {showForm ? 'Cancel' : 'Add New Hall'}
                        </button>
                    </div>
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">Hall Rent (Base Price)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                        value={hallForm.price}
                                        onChange={e => setHallForm({ ...hallForm, price: e.target.value })}
                                        placeholder="e.g. 50000"
                                        required
                                    />
                                </div>
                                <input
                                    type="number"
                                    placeholder="Capacity (Guests)"
                                    className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                    value={hallForm.capacity}
                                    onChange={e => setHallForm({ ...hallForm, capacity: e.target.value })}
                                />
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="1"
                                        max="5"
                                        placeholder="Rating (1-5)"
                                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        required
                                        value={hallForm.rating}
                                        onChange={e => setHallForm({ ...hallForm, rating: e.target.value })}
                                    />
                                    <Star className="absolute right-3 top-3 text-yellow-400" size={20} fill="currentColor" />
                                </div>
                            </div>

                            {/* Cost Estimation Details */}
                            <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100">
                                <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Banknote size={16} />
                                    Cost Estimation Settings (AI Based)
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold text-gray-500 ml-1">Price per Plate (Rs)</label>
                                        <input
                                            type="number"
                                            placeholder="Plate Price"
                                            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                            required
                                            value={hallForm.price_per_plate}
                                            onChange={e => setHallForm({ ...hallForm, price_per_plate: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold text-gray-500 ml-1">Decoration Cost (Rs)</label>
                                        <input
                                            type="number"
                                            placeholder="Decoration"
                                            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                            required
                                            value={hallForm.decoration_price}
                                            onChange={e => setHallForm({ ...hallForm, decoration_price: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold text-gray-500 ml-1">DJ Cost (Rs)</label>
                                        <input
                                            type="number"
                                            placeholder="DJ"
                                            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                            required
                                            value={hallForm.dj_price}
                                            onChange={e => setHallForm({ ...hallForm, dj_price: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold text-gray-500 ml-1">Makeup Artist (Rs)</label>
                                        <input
                                            type="number"
                                            placeholder="Makeup"
                                            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                            required
                                            value={hallForm.makeup_price}
                                            onChange={e => setHallForm({ ...hallForm, makeup_price: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold text-gray-500 ml-1">Photography (Rs)</label>
                                        <input
                                            type="number"
                                            placeholder="Photography"
                                            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                            required
                                            value={hallForm.photography_price}
                                            onChange={e => setHallForm({ ...hallForm, photography_price: e.target.value })}
                                        />
                                    </div>
                                </div>
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

                            {/* Image Previews & Uploads */}
                            <div className="bg-white p-6 rounded-xl border-2 border-dashed border-gray-200">
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Venue Visuals</h4>
                                
                                {/* Existing Images Grid */}
                                {editingHall && (hallForm.existingImages.length > 0 || editingHall.image) && (
                                    <div className="mb-6">
                                        <p className="text-xs font-bold text-gray-400 mb-3">CURRENTLY UPLOADED</p>
                                        <div className="flex flex-wrap gap-4">
                                            {/* Main Image */}
                                            {editingHall.image && (
                                                <div className="relative group">
                                                    <img src={editingHall.image} alt="Hero" className="w-24 h-24 object-cover rounded-xl border border-gray-200" />
                                                    <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[8px] px-1.5 py-0.5 rounded-bl-lg font-bold">HERO</div>
                                                </div>
                                            )}
                                            {/* Gallery Images */}
                                            {hallForm.existingImages.map(img => (
                                                <div key={img.id} className="relative group">
                                                    <img src={img.image} alt="Gallery" className="w-24 h-24 object-cover rounded-xl border border-gray-200" />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteExistingImage(img.id)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">
                                            {editingHall ? 'Change Hero Image' : 'Main Hero Image'}
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition shadow-sm"
                                            onChange={e => setHallForm({ ...hallForm, image: e.target.files[0] })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">
                                            Add Gallery Photos
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition shadow-sm"
                                            onChange={e => setHallForm({ ...hallForm, galleryImages: Array.from(e.target.files) })}
                                        />
                                        {hallForm.galleryImages.length > 0 && (
                                            <p className="text-xs text-purple-600 mt-2 font-bold italic">
                                                +{hallForm.galleryImages.length} new images selected
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Menu Builder */}
                            <div className="bg-white p-6 rounded-xl border-2 border-dashed border-gray-200 mt-6">
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Catering Menu</h4>
                                
                                <div className="space-y-6">
                                    {Object.entries(hallForm.menu).map(([category, items]) => (
                                        <div key={category} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                            <div className="flex justify-between items-center mb-3">
                                                <h5 className="font-bold text-indigo-700 uppercase text-xs tracking-widest">{category}</h5>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleRemoveMenuCategory(category)}
                                                    className="text-red-500 hover:text-red-700 transition"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {items.map((item, idx) => (
                                                    <span key={idx} className="bg-white px-3 py-1 rounded-full border border-gray-200 text-xs font-semibold flex items-center gap-2 group hover:border-red-200 hover:text-red-600 transition cursor-default">
                                                        {item}
                                                        <X size={10} className="cursor-pointer" onClick={() => handleRemoveMenuItem(category, idx)} />
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex gap-2">
                                                <input 
                                                    className="flex-1 text-xs border border-gray-200 p-2 rounded-lg outline-none focus:ring-1 focus:ring-indigo-300"
                                                    placeholder={`Add item to ${category}...`}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleAddMenuItem(category, e.target.value);
                                                            e.target.value = '';
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    <div className="flex gap-2">
                                        <input 
                                            id="new-category-input"
                                            className="flex-1 bg-gray-50 border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                            placeholder="New Category Name (e.g. Starters)"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                const input = document.getElementById('new-category-input');
                                                handleAddMenuCategory(input.value);
                                                input.value = '';
                                            }}
                                            className="bg-indigo-600 text-white px-6 rounded-lg font-bold hover:bg-indigo-700 transition"
                                        >
                                            Add Category
                                        </button>
                                    </div>
                                </div>
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
                                {hall.images && hall.images.length > 0 && (
                                    <div className="absolute bottom-2 right-2 bg-indigo-600/90 text-white text-[10px] px-2 py-1 rounded-md font-bold backdrop-blur-sm">
                                        {hall.images.length + 1} PHOTOS
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
                                    <div className="flex items-center justify-between">
                                        <span>Capacity: {hall.capacity} guests</span>
                                        <div className="flex items-center text-yellow-600 font-bold">
                                            <Star size={14} className="mr-1" fill="currentColor" />
                                            {hall.rating}
                                        </div>
                                    </div>
                                </div>

                                {/* Event Types Badges */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {(hall.event_types && hall.event_types.length > 0 ? hall.event_types : [hall.event_type]).filter(Boolean).map((type, idx) => (
                                        <span key={idx} className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">
                                            {type}
                                        </span>
                                    ))}
                                </div>

                                <div className="mb-4 grid grid-cols-2 gap-2 text-[10px] uppercase font-bold text-gray-400 border-t border-gray-50 pt-3">
                                    <span>Plate: <span className="text-indigo-600">Rs {hall.price_per_plate}</span></span>
                                    <span>DJ: <span className="text-indigo-600">Rs {hall.dj_price}</span></span>
                                    <span>Decor: <span className="text-indigo-600">Rs {hall.decoration_price}</span></span>
                                    <span>Photo: <span className="text-indigo-600">Rs {hall.photography_price}</span></span>
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
