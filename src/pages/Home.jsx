import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosInstance";
import { Search, MapPin, Users, Banknote, ShieldCheck, CalendarCheck, Tag, Headphones, Star, Sparkles, PartyPopper } from "lucide-react";

const Home = () => {
    const [halls, setHalls] = useState([]);
    const [filteredHalls, setFilteredHalls] = useState([]);
    
    // AI Form State
    const [aiForm, setAiForm] = useState({
        event_types: 'Wedding',
        city: '',
        capacity: ''
    });
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState("");
    const [aiRecommendation, setAiRecommendation] = useState([]);

    useEffect(() => {
        api.get("/halls/")
            .then(res => {
                setHalls(res.data);
                setFilteredHalls(res.data);
            })
            .catch(err => console.error("Error fetching halls", err));
    }, []);

    // Filter logic: if AI recommendation exists, only show that hall, sorted by AI rank.
    useEffect(() => {
        if (aiRecommendation && aiRecommendation.length > 0) {
            // First check for exact/partial name match
            let results = halls.filter(hall => 
                aiRecommendation.some(rec => hall.name.toLowerCase().includes(rec.toLowerCase()))
            );

            // Sort results based on the order in aiRecommendation
            results.sort((a, b) => {
                const aIndex = aiRecommendation.findIndex(rec => a.name.toLowerCase().includes(rec.toLowerCase()));
                const bIndex = aiRecommendation.findIndex(rec => b.name.toLowerCase().includes(rec.toLowerCase()));
                return aIndex - bIndex;
            });

            setFilteredHalls(results);
        } else {
            setFilteredHalls(halls);
        }
    }, [aiRecommendation, halls]);

    const handleAiSearch = async (e) => {
        e.preventDefault();
        if (!aiForm.city || !aiForm.capacity) {
            setAiError("Please fill out the location and capacity.");
            return;
        }

        setIsAiLoading(true);
        setAiError("");
        setAiRecommendation([]);

        try {
            const payload = {
                ...aiForm,
                capacity: Number(aiForm.capacity),
                int_price: 1500, // Dummy value since they just want event type, location, capacity
                rating: 4.5
            };

            const response = await api.post("ai/recommend-hall/", payload);
            setAiRecommendation(response.data.recommended_halls || []);

            // Automatically scroll to listings after getting a result
            document.getElementById("listings").scrollIntoView({ behavior: 'smooth' });
        } catch (err) {
            setAiError("Could not connect to AI backend. Make sure it's running.");
            console.error(err);
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-indigo-800 via-indigo-700 to-purple-800 py-24 px-4 text-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 opacity-20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
                
                <div className="relative z-10 max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-semibold mb-6 shadow border border-white/20">
                        <Sparkles size={16} className="text-yellow-300" /> Powered by AI Machine Learning
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                        Find the <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-yellow-200">Exact Match</span> with AI
                    </h1>
                    <p className="text-lg md:text-xl mb-12 text-indigo-100 max-w-2xl mx-auto">
                        Tell our AI the event type, location, and guest capacity. Our neural model will automatically compute and surface the absolute best banquet fit.
                    </p>

                    {/* AI Recommender Form */}
                    <form onSubmit={handleAiSearch} className="bg-white p-4 md:p-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-1 w-full text-left">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Event Type</label>
                            <div className="flex items-center group">
                                <PartyPopper size={18} className="text-indigo-400 mr-2 group-hover:text-indigo-600 transition" />
                                <select 
                                    className="w-full text-gray-800 font-semibold outline-none bg-transparent py-2 cursor-pointer"
                                    value={aiForm.event_types}
                                    onChange={(e) => setAiForm({...aiForm, event_types: e.target.value})}
                                >
                                    <option value="Wedding">Wedding</option>
                                    <option value="Reception">Reception</option>
                                    <option value="Party">Party</option>
                                    <option value="Conference">Conference</option>
                                    <option value="Meeting">Meeting</option>
                                </select>
                            </div>
                        </div>

                        <div className="hidden md:block w-px h-12 bg-gray-200"></div>

                        <div className="flex-1 w-full text-left">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Location</label>
                            <div className="flex items-center group">
                                <MapPin size={18} className="text-indigo-400 mr-2 group-hover:text-indigo-600 transition" />
                                <input 
                                    type="text" 
                                    className="w-full text-gray-800 font-semibold outline-none bg-transparent py-2 placeholder-gray-300"
                                    placeholder="City (e.g. Delhi)"
                                    value={aiForm.city}
                                    onChange={(e) => setAiForm({...aiForm, city: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="hidden md:block w-px h-12 bg-gray-200"></div>

                        <div className="flex-1 w-full text-left">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Guests</label>
                            <div className="flex items-center group">
                                <Users size={18} className="text-indigo-400 mr-2 group-hover:text-indigo-600 transition" />
                                <select 
                                    className="w-full text-gray-800 font-semibold outline-none bg-transparent py-2 cursor-pointer"
                                    value={aiForm.capacity}
                                    onChange={(e) => setAiForm({...aiForm, capacity: e.target.value})}
                                >
                                    <option value="" disabled hidden>Select Guest Range</option>
                                    <option value="100">50 - 100</option>
                                    <option value="150">100 - 150</option>
                                    <option value="200">150 - 200</option>
                                    <option value="250">200 - 250</option>
                                    <option value="300">250 - 300</option>
                                    <option value="350">300 - 350</option>
                                    <option value="400">350 - 400</option>
                                    <option value="450">400 - 450</option>
                                    <option value="500">450 - 500</option>
                                </select>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isAiLoading}
                            className={`w-full md:w-auto mt-4 md:mt-0 font-bold px-8 py-4 rounded-xl text-white shadow-lg hover:shadow-xl transition-all transform flex items-center justify-center gap-2 ${isAiLoading ? 'bg-indigo-400 cursor-wait' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-800 hover:-translate-y-0.5'}`}
                        >
                            {isAiLoading ? (
                                <> <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> AI Thinking </>
                            ) : (
                                <> <Sparkles size={18} /> Ask AI </>
                            )}
                        </button>
                    </form>

                    {aiError && <div className="mt-6 bg-red-500/20 px-6 py-3 rounded-xl text-white inline-block border border-red-500/50 backdrop-blur-sm shadow">{aiError}</div>}
                    
                    {aiRecommendation && aiRecommendation.length > 0 && (
                        <div className="mt-8 animate-fade-in-up">
                            <div className="inline-flex flex-col items-center bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-2xl z-20">
                                <span className="text-indigo-200 font-semibold uppercase tracking-widest text-sm mb-4 font-bold">Top 3 AI Matches Computed</span>
                                <div className="flex flex-col gap-3 items-center">
                                    {aiRecommendation.map((rec, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className="bg-indigo-600/50 text-indigo-100 text-xs px-2 py-1 rounded-full font-bold">#{i+1}</span>
                                            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-yellow-300 text-2xl md:text-3xl text-center">{rec}</span>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => {setAiRecommendation([]); setFilteredHalls(halls);}} className="mt-6 text-white/70 hover:text-white transition cursor-pointer text-sm underline decoration-white/30 underline-offset-4">Reset Finder</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Hall Listings */}
            <div id="listings" className="max-w-6xl mx-auto px-4 py-16 scroll-mt-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        {aiRecommendation.length > 0 ? "Your Match Results" : "Featured Banquet Halls"}
                    </h2>
                    <p className="text-gray-600 text-lg">
                        {aiRecommendation.length > 0 ? "Here are the top venues our model predicted for your requirements." : "Handpicked venues for your dream events"}
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredHalls.slice(0, 6).map((hall) => (
                        <div key={hall.id} className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 ${aiRecommendation.length > 0 ? 'ring-4 ring-purple-500 transform scale-105 transition-all' : ''}`}>
                            {/* Image Handling */}
                            <div className="h-48 bg-gray-200 relative group">
                                {hall.image ? (
                                    <img src={hall.image} alt={hall.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 bg-gray-100">
                                        No Image
                                    </div>
                                )}
                                {aiRecommendation.length > 0 ? (
                                    <span className="absolute top-4 right-4 bg-purple-600 px-3 py-1 rounded-full text-sm font-bold text-white shadow-lg flex items-center gap-1">
                                        <Sparkles size={14} /> AI Top Pick
                                    </span>
                                ) : (
                                     <span className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-indigo-700 shadow">
                                         Featured
                                     </span>
                                )}
                            </div>

                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{hall.name}</h3>

                                <div className="space-y-4 mb-6">
                                    <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Base Hall Rent</span>
                                        <span className="text-2xl font-black text-gray-900 flex items-baseline">
                                            Rs {parseFloat(hall.price).toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center text-gray-600 text-sm font-medium">
                                            <MapPin size={16} className="mr-3 text-indigo-400" /> {hall.location}
                                        </div>
                                        <div className="flex items-center text-gray-600 text-sm font-medium">
                                            <Users size={16} className="mr-3 text-indigo-400" /> Capacity: {hall.capacity}
                                        </div>
                                        <div className="flex items-center text-green-700 font-bold text-sm bg-green-50 p-2 rounded-lg w-fit">
                                            <Banknote size={16} className="mr-2" /> Rs {hall.price_per_plate} / plate
                                        </div>
                                    </div>
                                </div>
                                <Link to={`/book/${hall.id}`} className="block w-full text-center bg-indigo-50 text-indigo-700 font-bold py-3 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                                    View Details & Book
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
                
                {filteredHalls.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 mt-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Search size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No exact venue matched your criteria</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">Try resetting the AI Recommender or browse the full directory instead.</p>
                        <button onClick={() => {setAiRecommendation([]); setFilteredHalls(halls);}} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">Clear Search</button>
                    </div>
                )}

                {!aiRecommendation.length && filteredHalls.length > 0 && (
                    <div className="text-center mt-16 pb-12">
                        <Link to="/venues" className="inline-block bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-3 rounded-full font-bold hover:bg-indigo-50 transition shadow transform hover:-translate-y-0.5">
                            Browse Entire Directory
                        </Link>
                    </div>
                )}
            </div>

            {/* Features Section */}
            <div className="bg-white py-20 border-t border-gray-100">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: <ShieldCheck size={32} />, title: "Verified Venues", desc: "All listings are thoroughly checked" },
                            { icon: <Sparkles size={32} />, title: "AI Matched", desc: "Our engine pairs you instantly" },
                            { icon: <Tag size={32} />, title: "Best Prices", desc: "Competitive pricing with zero fees" },
                            { icon: <Headphones size={32} />, title: "24/7 Support", desc: "Round-the-clock booking help" }
                        ].map((feature, index) => (
                            <div key={index} className="bg-gray-50 p-8 rounded-2xl hover:bg-indigo-50 hover:-translate-y-1 transition-all text-center group border border-gray-100">
                                <div className="w-16 h-16 mx-auto bg-white shadow-sm text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="bg-indigo-900 text-white py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20"></div>
                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-extrabold mb-4">What Our Clients Say</h2>
                        <p className="text-indigo-200 text-lg">Real experiences from real customers</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: "Sarah Jenkins", role: "Wedding Planner", event: "Wedding", text: "The new AI finder got the exact venue I needed in seconds without endless scrolling!" },
                            { name: "Rahul Sharma", role: "Event Manager", event: "Corporate", text: "BanquetBazar's integration of precise ML estimators changes the entire booking landscape." },
                            { name: "Priya Patel", role: "Bride", event: "Sangeet", text: "I was so stressed, but pasting my guests and budget instantly gave me my dream spot." }
                        ].map((testimonial, index) => (
                            <div key={index} className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/10 hover:bg-white/20 transition">
                                <div className="flex text-yellow-400 mb-6">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                                </div>
                                <p className="text-indigo-50 italic mb-8 leading-relaxed">"{testimonial.text}"</p>
                                <div className="flex items-center mt-auto">
                                    <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center font-bold text-xl mr-4 shadow-inner">
                                        {testimonial.name[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">{testimonial.name}</h4>
                                        <p className="text-xs text-indigo-300 font-semibold uppercase tracking-wide mt-1">{testimonial.event}</p>
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
