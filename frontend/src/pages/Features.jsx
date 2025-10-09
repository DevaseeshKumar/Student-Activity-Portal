import React from "react";
import MainNavbar from "../components/MainNavbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { FaUserTie, FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa";

const Features = () => {
  return (
    <>
      <MainNavbar />

      {/* Features Section */}
      <section className="bg-gray-50 px-6 py-12">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">
            Platform Roles & Features
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Admin */}
            <div className="bg-white p-6 rounded-xl flex flex-col items-center">
              <FaUserTie className="text-4xl text-indigo-600 mb-3" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Admin</h3>
              <p className="text-gray-600 text-sm text-center">
                Manage users, create events, assign faculty, and configure platform settings.
              </p>
            </div>

            {/* Faculty */}
            <div className="bg-white p-6 rounded-xl flex flex-col items-center">
              <FaChalkboardTeacher className="text-4xl text-emerald-600 mb-3" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Faculty</h3>
              <p className="text-gray-600 text-sm text-center">
                View assigned events, conduct events, and manage student attendance.
              </p>
            </div>

            {/* Student */}
            <div className="bg-white p-6 rounded-xl flex flex-col items-center">
              <FaUserGraduate className="text-4xl text-yellow-500 mb-3" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Student</h3>
              <p className="text-gray-600 text-sm text-center">
                Discover, register, and attend events. Track your participation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section className="bg-gray-100 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Ready to Get Started?</h2>
        <p className="text-gray-700 mb-4">Join your college community and start participating in events!</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/student/signup">
            <button className="px-6 py-2 bg-yellow-400 text-gray-900 rounded font-semibold">
              Student Signup
            </button>
          </Link>
          <Link to="/faculty/register">
            <button className="px-6 py-2 bg-emerald-400 text-gray-900 rounded font-semibold">
              Faculty Register
            </button>
          </Link>
        </div>
      </section>

    </>
  );
};

export default Features;
