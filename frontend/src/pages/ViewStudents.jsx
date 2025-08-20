import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";

const ViewStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/admin/students", { withCredentials: true })
      .then((res) => {
        setStudents(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching students", err);
        setStudents([]);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <AdminNavbar />
      <div className="p-6 min-h-screen bg-gray-100">
        <h2 className="text-2xl font-semibold mb-4 text-center text-blue-700">
          All Registered Students
        </h2>

        {loading ? (
          <p className="text-center">Loading students...</p>
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
