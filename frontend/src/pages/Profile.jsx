import React, { useEffect, useState } from "react";
import axios from "axios";
import StudentNavbar from "../components/StudentNavbar";

const Profile = () => {
  const [student, setStudent] = useState(null);
  const [totalEvents, setTotalEvents] = useState(0);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch student info
        const studentRes = await axios.get(
          "http://localhost:8080/api/students/profile",
          { withCredentials: true }
        );
        setStudent(studentRes.data);

        // Fetch all events
        const allEventsRes = await axios.get(
          "http://localhost:8080/api/students/events",
          { withCredentials: true }
        );
        setTotalEvents(allEventsRes.data.length);

        // Fetch registered events
        const regRes = await axios.get(
          "http://localhost:8080/api/students/registered-events",
          { withCredentials: true }
        );

        const data = Array.isArray(regRes.data) ? regRes.data : [regRes.data];

        // Fetch attendance for each event
        const eventsWithAttendance = await Promise.all(
          data.map(async (event) => {
            try {
              const attRes = await axios.get(
                `http://localhost:8080/api/students/events/${event.id}/attendance`,
                { withCredentials: true }
              );

              // Set attendance: true => Present, false or undefined/null => Not Marked
              return {
                ...event,
                attendance:
                  attRes.data === true
                    ? true
                    : attRes.data === false
                    ? false
                    : null,
              };
            } catch {
              return { ...event, attendance: null };
            }
          })
        );

        setRegisteredEvents(eventsWithAttendance);
      } catch (err) {
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <>
        <StudentNavbar />
        <div className="text-center py-10 text-blue-600 text-lg font-medium">
          Loading profile...
        </div>
      </>
    );
  }

  if (!student) {
    return (
      <>
        <StudentNavbar />
        <div className="text-center py-10 text-red-500">
          Failed to load profile.
        </div>
      </>
    );
  }

  return (
    <>
      <StudentNavbar />

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Welcome, {student.name}
          </h1>
          <p className="text-gray-600"><strong>Email:</strong> {student.email}</p>
          <p className="text-gray-600"><strong>Phone:</strong> {student.phone}</p>
          <p className="text-gray-600"><strong>Gender:</strong> {student.gender}</p>
          <p className="text-gray-600"><strong>Department:</strong> {student.department}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
            <h2 className="text-lg font-semibold">Total Events</h2>
            <p className="text-3xl font-bold mt-2">{totalEvents}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
            <h2 className="text-lg font-semibold">Your Registrations</h2>
            <p className="text-3xl font-bold mt-2">{registeredEvents.length}</p>
          </div>
        </div>

        {/* Registered Events List */}
        <div className="bg-white rounded-2xl shadow-md p-6 border">
          <h2 className="text-2xl font-bold text-blue-700 mb-6">
            Your Registered Events
          </h2>

          {registeredEvents.length === 0 ? (
            <p className="text-gray-500">You haven’t registered for any events yet.</p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {registeredEvents.map((event, index) => (
                <div
                  key={index}
                  className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-5"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {event.name}
                  </h3>
                  <p className="text-gray-600 mb-1">
                    <strong>Description:</strong> {event.description || "N/A"}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <strong>Date:</strong> {event.date}
                  </p>
                  <p className="text-gray-600 mb-3">
                    <strong>Venue:</strong> {event.venue}
                  </p>

                  <p className="text-sm">
                    <strong>Attendance:</strong>{" "}
                    {event.attendance === null
                      ? "Not Marked"
                      : event.attendance
                      ? "✅ Present"
                      : "❌ Absent"}
                  </p>

                  <div className="mt-3 border-t pt-3">
                    <h4 className="text-sm font-semibold text-blue-600 mb-1">
                      Faculty Info
                    </h4>
                    <p className="text-gray-700 text-sm">
                      <strong>Name:</strong> {event.facultyName || "N/A"}
                    </p>
                    <p className="text-gray-700 text-sm">
                      <strong>Email:</strong> {event.facultyEmail || "N/A"}
                    </p>
                    <p className="text-gray-700 text-sm">
                      <strong>Department:</strong>{" "}
                      {event.facultyDepartment || "N/A"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
