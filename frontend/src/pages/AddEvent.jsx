import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AdminNavbar from "../components/AdminNavbar";
const AddEvent = () => {
  const [eventData, setEventData] = useState({
    name: "",
    description: "",
    date: "",
    venue: "",
    facultyId: "",
  });

  const [faculties, setFaculties] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/admin/faculties", {
        withCredentials: true,
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setFaculties(res.data);
        } else {
          console.error("Expected array, got:", res.data);
          setFaculties([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching faculties:", err);
        toast.error("Failed to load faculties");
      });
  }, []);

  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post("http://localhost:8080/api/admin/create-event", eventData, {
        withCredentials: true,
      })
      .then((res) => {
        toast.success("Event created successfully!");
        setEventData({
          name: "",
          description: "",
          date: "",
          venue: "",
          facultyId: "",
        });
      })
      .catch((err) => {
        console.error("Error adding event:", err);
        toast.error("Error adding event");
      });
  };

  return (
    <>
    <AdminNavbar />
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded-md dark:bg-gray-900 dark:text-white">
      <h2 className="text-2xl font-bold mb-6">Create New Event</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Event Name"
          value={eventData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded-md dark:bg-gray-800"
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          value={eventData.description}
          onChange={handleChange}
          className="w-full p-2 border rounded-md dark:bg-gray-800"
          required
        />

        <input
          type="date"
          name="date"
          value={eventData.date}
          onChange={handleChange}
          className="w-full p-2 border rounded-md dark:bg-gray-800"
          required
        />

        <input
          type="text"
          name="venue"
          placeholder="Venue"
          value={eventData.venue}
          onChange={handleChange}
          className="w-full p-2 border rounded-md dark:bg-gray-800"
          required
        />

        <select
          name="facultyId"
          value={eventData.facultyId}
          onChange={handleChange}
          className="w-full p-2 border rounded-md dark:bg-gray-800"
          required
        >
          <option value="">-- Select Faculty --</option>
          {Array.isArray(faculties) &&
            faculties.map((faculty) => (
              <option key={faculty.id} value={faculty.id}>
                {faculty.name} - {faculty.department}
              </option>
            ))}
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Add Event
        </button>
      </form>
    </div>
    </>
  );
};

export default AddEvent;
