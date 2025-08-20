import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNavbar from '../components/AdminNavbar';

function ViewAllFaculty() {
  const [faculties, setFaculties] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8080/api/admin/faculties')
      .then(response => {
        setFaculties(response.data);
      })
      .catch(error => {
        console.error("Error fetching faculty:", error);
      });
  }, []);

  return (
    <>
    <AdminNavbar />
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">All Faculty Members</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Phone</th>
            <th className="border p-2">Department</th>
            <th className="border p-2">Gender</th>
            <th className="border p-2">Approved</th>
          </tr>
        </thead>
        <tbody>
          {faculties.map(faculty => (
            <tr key={faculty.id}>
              <td className="border p-2">{faculty.id}</td>
              <td className="border p-2">{faculty.name}</td>
              <td className="border p-2">{faculty.email}</td>
              <td className="border p-2">{faculty.phone}</td>
              <td className="border p-2">{faculty.department}</td>
              <td className="border p-2">{faculty.gender}</td>
              <td className="border p-2">{faculty.approved ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}

export default ViewAllFaculty;
