import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { MapPin, Users, Banknote, Calendar as CalendarIcon, CheckCircle, XCircle, Info } from 'lucide-react';
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

    // Booking form state
    const [services, setServices] = useState([]);
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

                const servicesRes = await api.get('/services/');
                setServices(servicesRes.data);

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
            let cost = parseFloat(hall.price);
            const servicesCost = selectedServices.reduce((acc, serviceId) => {
                const service = services.find(s => s.id === parseInt(serviceId));
                return acc + (service ? parseFloat(service.price) : 0);
            }, 0);
            setTotalCost(cost + servicesCost);
        }
    }, [hall, selectedServices, services]);

    const handleServiceChange = (e) => {
        const value = parseInt(e.target.value);
        if (e.target.checked) {
            setSelectedServices([...selectedServices, value]);
        } else {
            setSelectedServices(selectedServices.filter(id => id !== value));
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
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            {/* Hall Image - Reduced Height */}
                            <div className="h-72 bg-gray-200 relative">
                                {hall.image ? (
                                    <img
                                        src={hall.image}
                                        alt={hall.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        <div className="text-center">
                                            <MapPin size={48} className="opacity-50 mx-auto mb-2" />
                                            <span className="text-sm">No Image Available</span>
                                        </div>
                                    </div>
                                )}

                                {/* Event Types Badge */}
                                {((hall.event_types && hall.event_types.length > 0) || hall.event_type) && (
                                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                                        {(hall.event_types && hall.event_types.length > 0
                                            ? hall.event_types
                                            : [hall.event_type]
                                        ).map((type, idx) => (
                                            <span
                                                key={idx}
                                                className="bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-indigo-600 shadow-sm"
                                            >
                                                {type}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Hall Information - Compact */}
                            <div className="p-6">
                                {/* Header with Name and Price */}
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-5 pb-5 border-b border-gray-100">
                                    <div className="flex-1">
                                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{hall.name}</h1>
                                        <div className="flex items-center text-gray-600">
                                            <MapPin size={16} className="mr-1.5 text-indigo-500" />
                                            <span className="text-sm">{hall.location}</span>
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="text-xs text-gray-500 mb-0.5">Starting from</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            Rs {parseFloat(hall.price).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Quick Stats - Compact */}
                                <div className="grid grid-cols-2 gap-3 mb-5 p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-white p-2 rounded-lg shadow-sm">
                                            <Users size={18} className="text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Capacity</p>
                                            <p className="text-sm font-bold text-gray-900">{hall.capacity} Guests</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="bg-white p-2 rounded-lg shadow-sm">
                                            <Banknote size={18} className="text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Base Price</p>
                                            <p className="text-sm font-bold text-gray-900">Rs {parseFloat(hall.price).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Description - Compact */}
                                <div className="mb-5">
                                    <h2 className="text-lg font-bold text-gray-900 mb-2">About This Venue</h2>
                                    <p className="text-gray-600 leading-relaxed text-sm">{hall.description}</p>
                                </div>

                                {/* Availability Calendar Section */}
                                <div className="mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-bold text-gray-900">Check Availability</h2>
                                        <div className="flex gap-4 text-xs font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-3 h-3 bg-red-100 border border-red-200 rounded-sm"></div>
                                                <span className="text-gray-500">Booked</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-3 h-3 bg-indigo-600 rounded-sm"></div>
                                                <span className="text-gray-500">Selected</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="calendar-container overflow-hidden rounded-lg">
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
                                            className="w-full border-none shadow-none"
                                        />
                                    </div>

                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-3">
                                        <Info size={18} className="text-blue-500 mt-0.5 shrink-0" />
                                        <p className="text-xs text-blue-700 leading-normal">
                                            Dates highlighted in red are already booked or have pending requests.
                                            Please select an available date for your event.
                                        </p>
                                    </div>
                                </div>

                                {/* Google Map Embed - Smaller */}
                                {hall.map_link && (
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 mb-2">Location</h2>
                                        <div className="rounded-lg overflow-hidden shadow-sm border border-gray-200">
                                            <iframe
                                                src={hall.map_link}
                                                width="100%"
                                                height="280"
                                                style={{ border: 0 }}
                                                allowFullScreen=""
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                            ></iframe>
                                        </div>
                                    </div>
                                )}
                            </div>
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
                                {services.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Additional Services
                                        </label>
                                        <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                                            {services.map((service) => (
                                                <label
                                                    key={service.id}
                                                    className="flex items-start space-x-2 p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        value={service.id}
                                                        onChange={handleServiceChange}
                                                        className="mt-0.5 w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {service.name}
                                                        </p>
                                                        <p className="text-xs text-green-600 font-semibold">
                                                            +Rs {parseFloat(service.price).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Price Summary */}
                                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100">
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-600">Hall Price:</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                Rs {parseFloat(hall.price).toLocaleString()}
                                            </span>
                                        </div>
                                        {selectedServices.length > 0 && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-600">Services:</span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    Rs {(totalCost - parseFloat(hall.price)).toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="border-t border-indigo-200 pt-2.5 mt-2.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-gray-900">Total:</span>
                                            <span className="text-xl font-bold text-indigo-600">
                                                Rs {totalCost.toLocaleString()}
                                            </span>
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
