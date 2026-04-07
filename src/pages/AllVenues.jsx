import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosInstance";
import { Search, MapPin, Users, Banknote, Filter } from "lucide-react";


const AllVenues = () => {
    const [halls, setHalls] = useState([]);
    const [filteredHalls, setFilteredHalls] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [locationFilter, setLocationFilter] = useState("");

    // New Filters
    const [selectedEventType, setSelectedEventType] = useState("All");
    const [priceRange, setPriceRange] = useState(200000); // Max price default
    const [minCapacity, setMinCapacity] = useState(0);

    const eventTypes = ["All", "Wedding", "Corporate", "Birthday", "Social", "Other"];

    useEffect(() => {
        api.get("/halls/")
            .then(res => {
                setHalls(res.data);
                setFilteredHalls(res.data);
            })
            .catch(err => console.error("Error fetching halls", err));
    }, []);

    useEffect(() => {
        const results = halls.filter(hall => {
            const matchesSearch = hall.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                hall.location.toLowerCase().includes(locationFilter.toLowerCase());
            // Support both old event_type and new event_types array
            const hallEventTypes = hall.event_types && hall.event_types.length > 0 ? hall.event_types : [hall.event_type];
            const matchesType = selectedEventType === "All" || hallEventTypes.includes(selectedEventType);
            const matchesPrice = parseFloat(hall.price) <= priceRange;
            const matchesCapacity = hall.capacity >= minCapacity;

            return matchesSearch && matchesType && matchesPrice && matchesCapacity;
        });
        setFilteredHalls(results);
    }, [searchTerm, locationFilter, halls, selectedEventType, priceRange, minCapacity]);

    return (
        <div className="min-h-screen bg-gray-50 pt-10 pb-20">
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Find Your Perfect Venue</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <div className="lg:w-1/4">
                        <div className="bg-white p-6 rounded-xl shadow-md sticky top-24">
                            <div className="flex items-center gap-2 mb-6 text-indigo-700">
                                <Filter size={20} />
                                <h2 className="text-xl font-bold">Filters</h2>
                            </div>

                            {/* Event Type Filter */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-700 mb-3">Event Type</h3>
                                <div className="space-y-2">
                                    {eventTypes.map(type => (
                                        <label key={type} className="flex items-center space-x-2 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="eventType"
                                                value={type}
                                                checked={selectedEventType === type}
                                                onChange={(e) => setSelectedEventType(e.target.value)}
                                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                            />
                                            <span className={`text-gray-600 group-hover:text-indigo-600 transition ${selectedEventType === type ? 'font-medium text-indigo-700' : ''}`}>{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Filter */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-700 mb-3">Max Price: Rs {priceRange.toLocaleString()}</h3>
                                <input
                                    type="range"
                                    min="10000"
                                    max="500000"
                                    step="5000"
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>10k</span>
                                    <span>500k</span>
                                </div>
                            </div>

                            {/* Capacity Filter */}
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-3">Min Capacity: {minCapacity} Guests</h3>
                                <input
                                    type="range"
                                    min="0"
                                    max="2000"
                                    step="50"
                                    value={minCapacity}
                                    onChange={(e) => setMinCapacity(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>0</span>
                                    <span>2000+</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Venue Grid */}
                    <div className="lg:w-3/4">
                        {/* Search Bar - Moved here for better mobile flow */}
                        <div className="mb-6 bg-white p-4 rounded-xl shadow-md flex flex-col md:flex-row gap-4">
                            <div className="flex-1 flex items-center border border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-100 transition">
                                <Search className="text-gray-400 mr-2" />
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    className="w-full text-gray-800 outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex-1 flex items-center border border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-100 transition">
                                <MapPin className="text-gray-400 mr-2" />
                                <input
                                    type="text"
                                    placeholder="Location..."
                                    className="w-full text-gray-800 outline-none"
                                    value={locationFilter}
                                    onChange={(e) => setLocationFilter(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredHalls.map((hall) => (
                                <div key={hall.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group">
                                    <div className="h-48 bg-gray-200 relative overflow-hidden">
                                        {hall.image ? (
                                            <img src={hall.image} alt={hall.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400 bg-gray-100">
                                                <div className="text-center">
                                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                                                        <MapPin size={24} className="opacity-50" />
                                                    </div>
                                                    <span className="text-sm">No Image</span>
                                                </div>
                                            </div>
                                        )}
                                        {/* Display first event type as badge */}
                                        {((hall.event_types && hall.event_types.length > 0) || hall.event_type) && (
                                            <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-600 shadow-sm">
                                                {hall.event_types && hall.event_types.length > 0 ? hall.event_types[0] : hall.event_type}
                                                {hall.event_types && hall.event_types.length > 1 && ` +${hall.event_types.length - 1}`}
                                            </span>
                                        )}
                                    </div>

                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold text-gray-900 leading-tight">{hall.name}</h3>
                                            <div className="text-right">
                                                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Hall Rent</span>
                                                <span className="text-indigo-600 font-bold text-sm bg-indigo-50 px-2 py-1 rounded">Rs {parseFloat(hall.price).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center text-gray-600 text-sm">
                                                <MapPin size={14} className="mr-2 text-indigo-400" /> {hall.location}
                                            </div>
                                            <div className="flex items-center text-gray-600 text-sm">
                                                <Users size={14} className="mr-2 text-indigo-400" /> Capacity: {hall.capacity}
                                            </div>
                                        </div>

                                        <p className="text-gray-500 text-sm mb-4 line-clamp-2 h-10">{hall.description}</p>

                                        <Link to={`/book/${hall.id}`} className="block w-full text-center bg-gray-900 text-white py-2.5 rounded-lg hover:bg-indigo-600 transition font-medium text-sm">
                                            View Details & Apply
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {filteredHalls.length === 0 && (
                            <div className="text-center text-gray-500 py-16 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                    <Search size={32} />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No venues found</h3>
                                <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                                <button onClick={() => { setSearchTerm(""); setSelectedEventType("All"); setPriceRange(500000); setMinCapacity(0); }} className="mt-4 text-indigo-600 font-medium hover:text-indigo-700">
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllVenues;
