import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "./api/axiosInstance";

function HallList() {
  const [halls, setHalls] = useState([]);

  useEffect(() => {
    api.get("/halls/")
      .then(res => setHalls(res.data))
      .catch(err => console.error("Error fetching halls", err));
  }, []);

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      {halls.map(hall => (
        <div key={hall.id} className="border p-4 rounded shadow">
          <h2 className="text-xl font-bold">{hall.name}</h2>
          <p>📍 {hall.location}</p>
          <p>👥 Capacity: {hall.capacity}</p>
          <p>💰 Price: Rs {hall.price}</p>
          <p className="text-sm mt-2">{hall.description}</p>
          <Link to={`/book/${hall.id}`} className="mt-4 block bg-indigo-600 text-white text-center py-2 rounded hover:bg-indigo-700">
            Book Now
          </Link>
        </div>
      ))}
    </div>
  );
}

export default HallList;
