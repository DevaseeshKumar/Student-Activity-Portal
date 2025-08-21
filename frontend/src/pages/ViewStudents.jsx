import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import "react-toastify/dist/ReactToastify.css";

const ViewStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Session & error handler
  const handleSessionError = (err) => {
    if (err.response?.status === 401) {
      toast.error("Session expired. Redirecting to login...");
      setTimeout(() => navigate("/admin/login"), 2000);
    } else {
      toast.error(err.message || "An error occurred");
    }
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/admin/students", {
          withCredentials: true,
        });
        setStudents(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        handleSessionError(err);
      } finally {
        setLoading(false);
      }
    };

    // Validate session before fetching
    axios
      .get("http://localhost:8080/api/admin/me", { withCredentials: true })
      .then(() => fetchStudents())
      .catch((err) => handleSessionError(err));
  }, [navigate]);

  return (
    <>
      <AdminNavbar />
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="p-6 min-h-screen bg-gray-100">
        <h2 className="text-2xl font-semibold mb-4 text-center text-blue-700">
          All Registered Students
        </h2>

        {loading ? (
          <p className="text-center text-indigo-600">Loading students...</p>
        ) : students.length === 0 ? (
          <p className="text-center text-red-500">No students found.</p>
        ) : (
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full bg-white border">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="py-3 px-4 border">#</th>
                  <th className="py-3 px-4 border">Name</th>
                  <th className="py-3 px-4 border">Email</th>
                  <th className="py-3 px-4 border">Phone</th>
                  <th className="py-3 px-4 border">Gender</th>
                  <th className="py-3 px-4 border">Department</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student.id || index} className="hover:bg-gray-100 transition">
                    <td className="py-2 px-4 border text-center">{index + 1}</td>
                    <td className="py-2 px-4 border">{student.name}</td>
                    <td className="py-2 px-4 border">{student.email}</td>
                    <td className="py-2 px-4 border">{student.phone}</td>
                    <td className="py-2 px-4 border">{student.gender}</td>
                    <td className="py-2 px-4 border">{student.department}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default ViewStudents;
