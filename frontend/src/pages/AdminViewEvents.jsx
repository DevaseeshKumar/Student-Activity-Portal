import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AdminNavbar from "../components/AdminNavbar";
import "react-toastify/dist/ReactToastify.css";

const AdminViewEvents = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventStudents, setSelectedEventStudents] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchingStudents, setFetchingStudents] = useState(false);
  const navigate = useNavigate();

  // ✅ Session & error handler
  const handleSessionError = (err) => {
    if (err.response?.status === 401) {
      toast.error("Session expired. Redirecting to login...", { autoClose: 2000 });
      setTimeout(() => navigate("/admin/login"), 2000);
    } else {
      toast.error(err.response?.data || err.message || "An error occurred");
    }
    setLoading(false);
  };

  // Fetch all events
  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/admin/events", {
        withCredentials: true,
      });
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      handleSessionError(err);
    } finally {
      setLoading(false);
    }
  };

  // Validate session first
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/admin/me", { withCredentials: true })
      .then(() => fetchEvents())
      .catch(handleSessionError);
  }, [navigate]);

  // View students for a specific event
  const handleViewStudents = async (eventId) => {
    setFetchingStudents(true);
    try {
      const res = await axios.get(
        `http://localhost:8080/api/admin/events/${eventId}/students`,
        { withCredentials: true }
      );

      const studentsWithAttendance = res.data.map((s) => ({
        ...s,
        attendance: s.attendance ?? null,
      }));

      setSelectedEventStudents(studentsWithAttendance);
      setShowPopup(true);
    } catch (err) {
      handleSessionError(err);
    } finally {
      setFetchingStudents(false);
    }
  };

  if (loading)
    return (
      <>
        <ToastContainer position="top-center" autoClose={3000} theme="light" />
        <p className="text-center mt-10 text-indigo-600 text-lg">Loading events...</p>
      </>
    );

  return (
    <>
      <AdminNavbar />
      <ToastContainer position="top-center" autoClose={3000} theme="light" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-6 bg-gray-100 min-h-screen text-gray-900"
      >
        <h1 className="text-3xl font-bold mb-6 text-center">Manage Events</h1>

        {events.length === 0 ? (
          <p className="text-center text-red-500">No events found.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
              >
                <h2 className="text-xl font-semibold text-blue-700 mb-2">
                  {event.name}
                </h2>
                <p className="mb-1">{event.description}</p>
                <p className="text-sm text-gray-600">
                  <strong>Date:</strong> {event.date}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Venue:</strong> {event.venue}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Faculty:</strong> {event.facultyName || "Unassigned"}
                </p>

                <button
                  onClick={() => handleViewStudents(event.id)}
                  disabled={fetchingStudents}
                  className={`mt-4 w-full py-2 rounded-lg text-white font-medium transition ${
                    fetchingStudents
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {fetchingStudents ? "Fetching Students..." : "View Registered Students"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Modal / Popup */}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-[90%] max-w-lg shadow-xl overflow-y-auto max-h-[85vh] relative">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Registered Students
              </h2>

              {selectedEventStudents.length === 0 ? (
                <p className="text-center text-gray-500">
                  No students have registered for this event.
                </p>
              ) : (
                <ul className="space-y-4">
                  {selectedEventStudents.map((student) => (
                    <li
                      key={student.id}
                      className="bg-gray-100 p-4 rounded-md shadow"
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
      </motion.div>
    </>
  );
};

export default AdminViewEvents;
