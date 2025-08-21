import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import "react-toastify/dist/ReactToastify.css";

const ViewAllFaculty = () => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleSessionError = (err) => {
    if (err.response?.status === 401) {
      toast.error("Session expired. Redirecting to login...");
      setTimeout(() => navigate("/admin/login"), 2000);
    } else {
      toast.error(err.message || "An error occurred");
    }
  };

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/admin/faculties", {
          withCredentials: true,
        });
        setFaculties(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        handleSessionError(err);
      } finally {
        setLoading(false);
      }
    };

    axios
      .get("http://localhost:8080/api/admin/me", { withCredentials: true })
      .then(() => fetchFaculties())
      .catch((err) => handleSessionError(err));
  }, [navigate]);

  return (
    <>
      <AdminNavbar />
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="p-6 min-h-screen bg-gray-100">
        <h2 className="text-2xl font-semibold mb-4 text-center text-indigo-700">
          All Faculty Members
        </h2>

        {loading ? (
          <p className="text-center text-indigo-600">Loading faculties...</p>
        ) : faculties.length === 0 ? (
          <p className="text-center text-red-500">No faculties found.</p>
        ) : (
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full bg-white border">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="py-3 px-4 border">ID</th>
                  <th className="py-3 px-4 border">Name</th>
                  <th className="py-3 px-4 border">Email</th>
                  <th className="py-3 px-4 border">Phone</th>
                  <th className="py-3 px-4 border">Department</th>
                  <th className="py-3 px-4 border">Gender</th>
                  <th className="py-3 px-4 border">Approved</th>
                </tr>
              </thead>
              <tbody>
                {faculties.map((faculty, index) => (
                  <tr key={faculty.id || index} className="hover:bg-gray-100 transition">
                    <td className="py-2 px-4 border text-center">{faculty.id}</td>
                    <td className="py-2 px-4 border">{faculty.name}</td>
                    <td className="py-2 px-4 border">{faculty.email}</td>
                    <td className="py-2 px-4 border">{faculty.phone}</td>
                    <td className="py-2 px-4 border">{faculty.department}</td>
                    <td className="py-2 px-4 border">{faculty.gender}</td>
                    <td className="py-2 px-4 border text-center">
                      {faculty.approved ? "Yes" : "No"}
                    </td>
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

export default ViewAllFaculty;
