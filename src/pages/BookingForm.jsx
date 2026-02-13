import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const BookingForm = () => {
    const { hallId } = useParams();
    const navigate = useNavigate();
    const [hall, setHall] = useState(null);
    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [eventDate, setEventDate] = useState('');
    const [guestCount, setGuestCount] = useState(100);
    const [totalCost, setTotalCost] = useState(0);

    useEffect(() => {
        // Fetch Hall Details
        api.get(`/halls/${hallId}/`).then(res => setHall(res.data));
        // Fetch Services
        api.get('/services/').then(res => setServices(res.data));
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

    if (!hall) return <div>Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow-md mt-10">
            <h2 className="text-2xl font-bold mb-4">Book {hall.name}</h2>
            <div className="mb-4">
                <p><strong>Base Price:</strong> Rs {hall.price}</p>
                <p><strong>Capacity:</strong> {hall.capacity}</p>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block mb-2">Event Date</label>
                    <input type="date" className="w-full p-2 border rounded" value={eventDate} onChange={e => setEventDate(e.target.value)} required />
                </div>
                <div className="mb-4">
                    <label className="block mb-2">Guest Count</label>
                    <input type="number" className="w-full p-2 border rounded" value={guestCount} onChange={e => setGuestCount(e.target.value)} required />
                </div>
                <div className="mb-4">
                    <label className="block mb-2">Select Services</label>
                    <div className="grid grid-cols-2 gap-2">
                        {services.map(service => (
                            <label key={service.id} className="flex items-center space-x-2">
                                <input type="checkbox" value={service.id} onChange={handleServiceChange} />
                                <span>{service.name} (Rs {service.price})</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="mb-6 p-4 bg-gray-100 rounded">
                    <h3 className="text-xl font-bold">Estimated Total: Rs {totalCost}</h3>
                </div>
                <button type="submit" className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700">Confirm Booking</button>
            </form>
        </div>
    );
};

export default BookingForm;
