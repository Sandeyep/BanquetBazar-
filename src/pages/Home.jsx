import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosInstance";
import { Search, MapPin, Users, Banknote, ShieldCheck, CalendarCheck, Tag, Headphones, Star } from "lucide-react";

const Home = () => {
    const [halls, setHalls] = useState([]);
    const [filteredHalls, setFilteredHalls] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [locationFilter, setLocationFilter] = useState("");

    useEffect(() => {
        api.get("/halls/")
            .then(res => {
                setHalls(res.data);
                setFilteredHalls(res.data);
            })
            .catch(err => console.error("Error fetching halls", err));
    }, []);

    useEffect(() => {
        const results = halls.filter(hall =>
            hall.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            hall.location.toLowerCase().includes(locationFilter.toLowerCase())
        );
        setFilteredHalls(results);
    }, [searchTerm, locationFilter, halls]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-indigo-600 py-20 px-4 text-center text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Perfect Banquet Hall</h1>
                <p className="text-lg md:text-xl mb-8">Discover top-rated venues for weddings, parties, and corporate events.</p>

                {/* Search Bar */}
                <div className="max-w-4xl mx-auto bg-white p-4 rounded-lg shadow-lg flex flex-col md:flex-row gap-4">
                    <div className="flex-1 flex items-center border rounded px-3 py-2">
                        <Search className="text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            className="w-full text-gray-800 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex-1 flex items-center border rounded px-3 py-2">
                        <MapPin className="text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Location (e.g. Kathmandu)"
                            className="w-full text-gray-800 outline-none"
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                        />
                    </div>
                    <button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-2 rounded font-semibold transition">
                        Search
                    </button>
                </div>
            </div>

            {/* Hall Listings */}
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Featured Banquet Halls</h2>
                    <p className="text-gray-600 text-lg">Handpicked venues for your dream events</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredHalls.slice(0, 3).map((hall) => (
                        <div key={hall.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                            {/* Image Handling */}
                            <div className="h-48 bg-gray-200 relative">
                                {hall.image ? (
                                    <img src={hall.image} alt={hall.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        No Image
                                    </div>
                                )}
                                <span className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-bold text-indigo-600 shadow">
                                    Top Rated
                                </span>
                            </div>

                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{hall.name}</h3>

                                <div className="flex items-center text-gray-600 mb-2">
                                    <MapPin size={16} className="mr-2" /> {hall.location}
                                </div>
                                <div className="flex items-center text-gray-600 mb-2">
                                    <Users size={16} className="mr-2" /> Capacity: {hall.capacity}
                                </div>
                                <div className="flex items-center text-green-600 font-semibold mb-4">
                                    <Banknote size={16} className="mr-2" /> Rs {hall.price}
                                </div>

                                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{hall.description}</p>

                                <Link to={`/book/${hall.id}`} className="block w-full text-center bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
                                    View Details & Apply
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
                {filteredHalls.length === 0 && (
                    <div className="text-center text-gray-500 py-10">
                        No halls found matching your search.
                    </div>
                )}

                <div className="text-center mt-12 pb-12 border-b border-gray-200">
                    <Link to="/venues" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                        View All Venues
                    </Link>
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-white py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: <ShieldCheck size={32} />, title: "Verified Venues", desc: "All listings are verified and quality checked" },
                            { icon: <CalendarCheck size={32} />, title: "Instant Booking", desc: "Book your venue in just a few clicks" },
                            { icon: <Tag size={32} />, title: "Best Prices", desc: "Competitive pricing with no hidden fees" },
                            { icon: <Headphones size={32} />, title: "24/7 Support", desc: "Round-the-clock customer assistance" }
                        ].map((feature, index) => (
                            <div key={index} className="bg-gray-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center group">
                                <div className="w-16 h-16 mx-auto bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>
                                <p className="text-gray-600 text-sm">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="bg-purple-50 py-20">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">What Our Clients Say</h2>
                        <p className="text-gray-600 text-lg">Real experiences from real customers</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: "Sarah Jenkins", role: "Wedding Planner", event: "Wedding Reception", date: "Oct 2023", text: "Found the perfect venue for my client in minutes. The booking process was seamless and the support team was incredibly helpful!" },
                            { name: "Rahul Sharma", role: "Corporate Event Manager", event: "Annual Tech Summit", date: "Nov 2023", text: "BanquetBazar made organizing our corporate summit a breeze. Developing this platform changed how we verify venues." },
                            { name: "Priya Patel", role: "Bride", event: "Sangeet Ceremony", date: "Dec 2023", text: "I was so stressed about finding a hall, but this site saved me. Verified listings meant no nasty surprises on the big day." }
                        ].map((testimonial, index) => (
                            <div key={index} className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow relative">
                                <div className="flex text-yellow-400 mb-4">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                                </div>
                                <p className="text-gray-700 italic mb-6">"{testimonial.text}"</p>
                                <div className="flex items-center mt-auto">
                                    <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-bold text-xl mr-4">
                                        {testimonial.name[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                                        <p className="text-xs text-purple-600 font-medium uppercase tracking-wide">{testimonial.event} • {testimonial.date}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
