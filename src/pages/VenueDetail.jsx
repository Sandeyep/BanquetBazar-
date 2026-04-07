import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { MapPin, Users, Banknote, Calendar as CalendarIcon, CheckCircle, XCircle, Info, Building2, Star, ArrowRight, Utensils, Pizza, Coffee, Dessert } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarOverlay.css'; // We'll create this for custom styling

const VenueDetail = () => {
    const { hallId } = useParams();
    const navigate = useNavigate();

    // Hall data
    const [hall, setHall] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookedDates, setBookedDates] = useState([]);
    const [activeImage, setActiveImage] = useState(null);

    const [selectedServices, setSelectedServices] = useState([]);
    const [eventDate, setEventDate] = useState('');
    const [guestCount, setGuestCount] = useState(100);
    const [totalCost, setTotalCost] = useState(0);

    useEffect(() => {
        // Fetch Hall Details and Booked Dates
        const fetchHallData = async () => {
            try {
                const hallRes = await api.get(`/halls/${hallId}/`);
                setHall(hallRes.data);
                setActiveImage(hallRes.data.image);

                // Fetch booked dates
                const bookedRes = await api.get(`/halls/${hallId}/booked_dates/`);
                setBookedDates(bookedRes.data.map(date => new Date(date).toDateString()));

                setLoading(false);
            } catch (error) {
                console.error('Error fetching hall details', error);
                toast.error('Failed to load hall details');
                setLoading(false);
            }
        };

        fetchHallData();
    }, [hallId]);

    useEffect(() => {
        if (hall) {
            const hallRental = parseFloat(hall.price) || 0;
            const platePrice = parseFloat(hall.price_per_plate) || 0;
            const guests = parseInt(guestCount) || 0;
            
            let servicesCost = 0;
            if (selectedServices.includes('decoration')) servicesCost += parseFloat(hall.decoration_price);
            if (selectedServices.includes('dj')) servicesCost += parseFloat(hall.dj_price);
            if (selectedServices.includes('makeup')) servicesCost += parseFloat(hall.makeup_price);
            if (selectedServices.includes('photography')) servicesCost += parseFloat(hall.photography_price);

            setTotalCost(hallRental + (platePrice * guests) + servicesCost);
        }
    }, [hall, selectedServices, guestCount]);

    const handleServiceChange = (serviceKey) => {
        if (selectedServices.includes(serviceKey)) {
            setSelectedServices(selectedServices.filter(key => key !== serviceKey));
        } else {
            setSelectedServices([...selectedServices, serviceKey]);
        }
    };

    const handleDateChange = (date) => {
        const dateString = date.toISOString().split('T')[0];
        setEventDate(dateString);
    };

    const isDateBooked = ({ date, view }) => {
        if (view === 'month') {
            return bookedDates.includes(date.toDateString());
        }
        return false;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/bookings/', {
                hall: hallId,
                services: selectedServices,
                event_date: eventDate,
                guest_count: guestCount
            });
            toast.success('Booking request sent successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error('Failed to create booking');
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading venue details...</p>
                </div>
            </div>
        );
    }

    if (!hall) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <XCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <p className="text-xl text-gray-700">Venue not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-6 pb-16">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT SIDE - Hall Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Interactive Gallery */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="relative h-[450px] bg-gray-900 group">
                                {activeImage ? (
                                    <img
                                        src={activeImage}
                                        alt={hall.name}
                                        className="w-full h-full object-cover transition-opacity duration-300"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        <MapPin size={48} className="opacity-20" />
                                    </div>
                                )}
                                
                                {/* Status Overlay */}
                                <div className="absolute bottom-6 left-6 flex gap-2">
                                    <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-indigo-600 shadow-lg">
                                        Verified Venue
                                    </span>
                                </div>
                            </div>

                            {/* Thumbnails */}
                            {(hall.images && hall.images.length > 0) && (
                                <div className="p-4 bg-gray-50/50 flex gap-3 overflow-x-auto scrollbar-hide">
                                    {[hall.image, ...hall.images.map(img => img.image)].map((imgUrl, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(imgUrl)}
                                            className={`relative flex-shrink-0 w-24 h-20 rounded-xl overflow-hidden transition-all duration-200 ${
                                                activeImage === imgUrl 
                                                ? 'ring-4 ring-indigo-600 ring-offset-2' 
                                                : 'opacity-70 hover:opacity-100 scale-95 hover:scale-100'
                                            }`}
                                        >
                                            <img src={imgUrl} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Hall Information */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        {hall.event_types?.map(type => (
                                            <span key={type} className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-md">
                                                {type}
                                            </span>
                                        ))}
                                    </div>
                                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{hall.name}</h1>
                                    <div className="flex items-center mt-2 text-gray-500">
                                        <MapPin size={18} className="mr-2 text-indigo-500" />
                                        <span className="text-lg">{hall.location}</span>
                                    </div>
                                </div>
                                <div className="text-left md:text-right">
                                    <div className="flex items-center gap-1 text-yellow-500 mb-1 justify-end">
                                        <Star size={18} fill="currentColor" />
                                        <span className="font-bold text-lg">{hall.rating}</span>
                                        <span className="text-gray-400 text-sm font-medium">(24 reviews)</span>
                                    </div>
                                    <p className="text-3xl font-black text-gray-900">
                                        Rs {parseFloat(hall.price).toLocaleString()}
                                        <span className="text-sm font-medium text-gray-400 ml-1">/ Hall Rent</span>
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <Users size={20} className="text-indigo-600 mb-2" />
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Capacity</p>
                                    <p className="text-lg font-bold text-gray-900">{hall.capacity}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <Banknote size={20} className="text-indigo-600 mb-2" />
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Plate Price</p>
                                    <p className="text-lg font-bold text-gray-900">Rs {hall.price_per_plate}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <Building2 size={20} className="text-indigo-600 mb-2" />
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</p>
                                    <p className="text-lg font-bold text-gray-900">Premium</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <CheckCircle size={20} className="text-indigo-600 mb-2" />
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
                                    <p className="text-lg font-bold text-green-600 font-bold">Available</p>
                                </div>
                            </div>

                            <div className="mb-10">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-indigo-50 w-fit">About Venue</h2>
                                <p className="text-gray-600 leading-loose text-lg whitespace-pre-line">{hall.description}</p>
                            </div>

                            {/* Calendar Section */}
                            <div className="mb-10">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Availability Calendar</h2>
                                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                    <Calendar
                                        onChange={handleDateChange}
                                        value={eventDate ? new Date(eventDate) : new Date()}
                                        tileDisabled={isDateBooked}
                                        tileClassName={({ date, view }) => {
                                            if (view === 'month' && isDateBooked({ date, view })) {
                                                return 'booked-date';
                                            }
                                            return null;
                                        }}
                                        minDate={new Date()}
                                        className="w-full border-none shadow-none bg-transparent"
                                    />
                                    <div className="mt-6 flex gap-6 text-sm font-bold border-t border-gray-200 pt-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-red-100 border-2 border-red-200 rounded-lg"></div>
                                            <span className="text-gray-500">Already Booked</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-indigo-600 rounded-lg"></div>
                                            <span className="text-gray-500">Your Selection</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Food Menu Section */}
                            {hall.menu && Object.keys(hall.menu).length > 0 && (
                                <div className="mt-12 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                                        <div className="p-2 bg-indigo-600 rounded-xl text-white">
                                            <Utensils size={24} />
                                        </div>
                                        Catering & Food Menu
                                    </h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {Object.entries(hall.menu).map(([category, items]) => (
                                            <div key={category} className="group">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <span className="w-1 h-6 bg-indigo-600 rounded-full group-hover:h-8 transition-all"></span>
                                                    <h3 className="text-lg font-black text-gray-800 uppercase tracking-wider">{category}</h3>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {items.map((item, idx) => (
                                                        <div key={idx} className="bg-gray-50 border border-gray-100 px-4 py-2 rounded-2xl flex items-center gap-2 hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all cursor-default">
                                                            <CheckCircle size={14} className="text-indigo-400" />
                                                            <span className="text-sm font-semibold text-gray-700">{item}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="mt-10 p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-start gap-4">
                                        <Info className="text-indigo-600 mt-1 flex-shrink-0" size={20} />
                                        <div>
                                            <p className="text-sm font-bold text-indigo-900 mb-1">Customizable Options</p>
                                            <p className="text-xs text-indigo-700 leading-relaxed font-medium">
                                                This menu can be fully customized to your guest's preferences. Discuss your specific requirements with the venue manager after booking.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Map Section */}
                            {hall.google_maps_link && (
                                <div className="mt-12">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <MapPin className="text-indigo-600" size={24} />
                                        Venue Map
                                    </h2>
                                    
                                    <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-gray-100">
                                        <iframe
                                            src={hall.google_maps_link}
                                            width="100%"
                                            height="450"
                                            style={{ border: 0 }}
                                            allowFullScreen=""
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            title="Venue Location"
                                        ></iframe>
                                    </div>
                                    
                                    {/* Direct Link Fallback (Only if help is needed) */}
                                    {!hall.google_maps_link.includes('embed') && (
                                        <div className="mt-4 text-center">
                                            <a 
                                                href={hall.google_maps_link} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-sm font-bold text-indigo-600 hover:underline flex items-center justify-center gap-1"
                                            >
                                                Open Interactive Map in New Tab <ArrowRight size={14} />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT SIDE - Booking Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-5 sticky top-20">
                            <h2 className="text-xl font-bold mb-5 text-gray-900">Book This Venue</h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Event Date */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <CalendarIcon size={14} className="inline mr-1" />
                                        Event Date
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                        value={eventDate}
                                        onChange={(e) => setEventDate(e.target.value)}
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    {eventDate && bookedDates.includes(new Date(eventDate).toDateString()) && (
                                        <p className="text-xs text-red-500 mt-1 font-medium">
                                            This date is already booked!
                                        </p>
                                    )}
                                </div>

                                {/* Guest Count */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <Users size={14} className="inline mr-1" />
                                        Number of Guests
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                        value={guestCount}
                                        onChange={(e) => setGuestCount(e.target.value)}
                                        required
                                        min="1"
                                        max={hall.capacity}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Max: {hall.capacity} guests
                                    </p>
                                </div>

                                {/* Services */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Additional Services (Optional)
                                    </label>
                                    
                                    {[
                                        { key: 'decoration', label: 'Decoration', price: hall.decoration_price },
                                        { key: 'dj', label: 'DJ / Sound System', price: hall.dj_price },
                                        { key: 'makeup', label: 'Makeup Artist', price: hall.makeup_price },
                                        { key: 'photography', label: 'Photography', price: hall.photography_price }
                                    ].map((service) => (
                                        <label
                                            key={service.key}
                                            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition ${
                                                selectedServices.includes(service.key) 
                                                ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                                                : 'border-gray-200 hover:border-indigo-200 bg-white'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedServices.includes(service.key)}
                                                    onChange={() => handleServiceChange(service.key)}
                                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                                />
                                                <span className="text-sm font-medium text-gray-700">{service.label}</span>
                                            </div>
                                            <span className="text-xs font-bold text-indigo-600">
                                                +Rs {parseFloat(service.price).toLocaleString()}
                                            </span>
                                        </label>
                                    ))}
                                </div>

                                {/* Price Summary */}
                                <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-4 rounded-xl border border-indigo-100/50">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between items-center text-gray-600">
                                            <span>Hall Rental Fee</span>
                                            <span className="font-semibold text-gray-900">Rs {parseFloat(hall.price).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-gray-600">
                                            <span>Food (Rs {hall.price_per_plate} × {guestCount})</span>
                                            <span className="font-semibold text-gray-900">Rs {(hall.price_per_plate * guestCount).toLocaleString()}</span>
                                        </div>
                                        {selectedServices.length > 0 && (
                                            <div className="flex justify-between items-center text-gray-600">
                                                <span>Add-ons</span>
                                                <span className="font-semibold text-gray-900">
                                                    Rs {(totalCost - (parseFloat(hall.price) + (hall.price_per_plate * guestCount))).toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                        <div className="border-t border-indigo-200 pt-3 mt-3 flex justify-between items-center">
                                            <span className="text-base font-bold text-gray-900">Estimated Total</span>
                                            <div className="text-right">
                                                <span className="block text-2xl font-black text-indigo-600">Rs {totalCost.toLocaleString()}</span>
                                                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Estimated by AI</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition font-semibold text-base shadow-md hover:shadow-lg"
                                >
                                    <CheckCircle size={18} className="inline mr-2" />
                                    Confirm Booking
                                </button>

                                <p className="text-xs text-gray-500 text-center">
                                    Request will be sent for approval
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VenueDetail;
