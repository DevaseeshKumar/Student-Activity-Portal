import { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UnapprovedFaculties = () => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUnapprovedFaculties = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/admin/unapproved-faculties", {
        withCredentials: true,
      });
      setFaculties(res.data);
    } catch (err) {
      toast.error("Error fetching unapproved faculties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnapprovedFaculties();
  }, []);

  const handleApprove = async (id, email) => {
    try {
      await axios.put(
        `http://localhost:8080/api/admin/approve-faculty/${id}`,
        null,
        { withCredentials: true }
      );
      toast.success("Faculty approved and email sent");
      fetchUnapprovedFaculties();
    } catch (err) {
      toast.error("Error approving faculty");
    }
  };

  const handleReject = async (id, email) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      await axios.put(
        `http://localhost:8080/api/admin/reject-faculty/${id}`,
        null,
        {
          params: { reason },
          withCredentials: true,
        }
      );
      toast.success("Faculty rejected and email sent");
      fetchUnapprovedFaculties();
    } catch (err) {
      toast.error("Error rejecting faculty");
    }
  };

  return (
    <>
      <AdminNavbar />
      <ToastContainer />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-8">Pending Faculty Approvals</h1>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : faculties.length === 0 ? (
          <p className="text-center text-gray-600">No pending faculty approvals.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {faculties.map((faculty, index) => (
              <motion.div
                key={faculty.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-md p-6 transition-all duration-300"
              >
                <h2 className="text-xl font-semibold text-blue-800 dark:text-white">{faculty.name}</h2>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                  <strong>Email:</strong> {faculty.email}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Department:</strong> {faculty.department}
                </p>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleApprove(faculty.id, faculty.email)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(faculty.id, faculty.email)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition"
                  >
                    Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default UnapprovedFaculties;
