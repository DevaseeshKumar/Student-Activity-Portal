import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const AdminDashboard = () => {
  const [faculties, setFaculties] = useState([]);
  const [students, setStudents] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [facRes, stuRes, evtRes] = await Promise.all([
          axios.get("http://localhost:8080/api/admin/faculties", { withCredentials: true }),
          axios.get("http://localhost:8080/api/admin/students", { withCredentials: true }),
          axios.get("http://localhost:8080/api/admin/events", { withCredentials: true }),
        ]);

        setFaculties(Array.isArray(facRes.data) ? facRes.data : []);
        setStudents(Array.isArray(stuRes.data) ? stuRes.data : []);
        setEvents(Array.isArray(evtRes.data) ? evtRes.data : []);
      } catch (err) {
        console.error("Error fetching admin data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) return <div className="p-6 text-center text-blue-600">Loading dashboard...</div>;

  // Compute statistics
  const approvedFaculties = faculties.filter(f => f.approved).length;
  const unapprovedFaculties = faculties.length - approvedFaculties;

  const pieDataFaculties = [
    { name: "Approved", value: approvedFaculties },
    { name: "Unapproved", value: unapprovedFaculties },
  ];

  const totalStudents = students.length;
  const totalEvents = events.length;

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-8">
          Admin Dashboard
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 max-w-6xl mx-auto">
          <div className="bg-blue-500 text-white p-6 rounded-2xl shadow-lg text-center">
            <h3 className="text-lg font-semibold">Total Faculties</h3>
            <p className="text-3xl font-bold mt-2">{faculties.length}</p>
          </div>
          <div className="bg-green-500 text-white p-6 rounded-2xl shadow-lg text-center">
            <h3 className="text-lg font-semibold">Approved Faculties</h3>
            <p className="text-3xl font-bold mt-2">{approvedFaculties}</p>
          </div>
          <div className="bg-yellow-400 text-white p-6 rounded-2xl shadow-lg text-center">
            <h3 className="text-lg font-semibold">Total Students</h3>
            <p className="text-3xl font-bold mt-2">{totalStudents}</p>
          </div>
          <div className="bg-red-500 text-white p-6 rounded-2xl shadow-lg text-center">
            <h3 className="text-lg font-semibold">Total Events</h3>
            <p className="text-3xl font-bold mt-2">{totalEvents}</p>
          </div>
        </div>

        

        {/* Pie Chart: Event Registration Status */}
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-lg mb-10">
          <h2 className="text-xl font-bold text-center mb-4 text-gray-700">
            Event Registration Overview
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Events", value: totalEvents },
                  { name: "Students", value: totalStudents },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                <Cell fill="#0088FE" />
                <Cell fill="#00C49F" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
