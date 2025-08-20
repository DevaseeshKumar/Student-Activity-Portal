import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";

const AdminViewEvents = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventStudents, setSelectedEventStudents] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/admin/events", {
        withCredentials: true,
      });
      setEvents(res.data);
    } catch (err) {
      console.error("Error fetching events", err);
    }
  };

  const handleViewStudents = async (eventId) => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/admin/events/${eventId}/students`,
        { withCredentials: true }
      );

      // Ensure attendance field exists (fallback = null)
      const studentsWithAttendance = res.data.map((s) => ({
        ...s,
        attendance: s.attendance ?? null,
      }));

      setSelectedEventStudents(studentsWithAttendance);
      setShowPopup(true);
    } catch (err) {
      console.error("Error fetching students", err);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="p-6 bg-gray-100 dark:bg-[#0a192f] min-h-screen text-gray-900 dark:text-white">
        <h1 className="text-3xl font-bold mb-6 text-center">Manage Events</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white dark:bg-[#112240] p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400 mb-2">
                {event.name}
              </h2>
              <p className="mb-1">{event.description}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Date:</strong> {event.date}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Venue:</strong> {event.venue}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Faculty:</strong> {event.facultyName || "Unassigned"}
              </p>

              <button
                onClick={() => handleViewStudents(event.id)}
                className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded"
              >
                View Registered Students
              </button>
            </div>
          ))}
        </div>

        {/* Modal / Popup */}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[90%] max-w-lg shadow-xl overflow-y-auto max-h-[85vh] relative">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Registered Students
              </h2>
              {selectedEventStudents.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-300">
                  No students have registered for this event.
                </p>
              ) : (
                <ul className="space-y-4">
                  {selectedEventStudents.map((student) => (
                    <li
                      key={student.id}
                      className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md shadow"
                    >
                      <p>
                        <strong>Name:</strong> {student.name}
                      </p>
                      <p>
                        <strong>Email:</strong> {student.email}
                      </p>
                      <p>
                        <strong>Phone:</strong> {student.phone}
                      </p>
                      <p>
                        <strong>Department:</strong> {student.department}
                      </p>
                      <p>
                        <strong>Attendance:</strong>{" "}
                        {student.attendance === null
                          ? "Not Marked"
                          : student.attendance
                          ? "Present"
                          : "Absent"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <button
                onClick={() => setShowPopup(false)}
                className="mt-6 px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded w-full"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminViewEvents;
