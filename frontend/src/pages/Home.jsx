import React from "react";
import MainNavbar from "../components/MainNavbar";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <>
      <MainNavbar />

      {/* Hero Section */}
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-white px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-gray-900">
          Welcome to{" "}
          <span className="text-indigo-600 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
            Student Activity Portal
          </span>
        </h1>
        <p className="text-lg md:text-xl mb-8 text-gray-700 max-w-2xl">
          A simple, centralized platform to manage, organize, and participate in all your college events.
        </p>
        <Link to="/features">
          <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-lg font-semibold shadow-lg transition transform hover:scale-105">
            Explore Features
          </button>
        </Link>
      </div>

      {/* Floating Help Button */}
      <Link
        to="/contact"
        className="fixed bottom-6 right-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 p-4 rounded-full shadow-xl flex items-center justify-center transition transform hover:scale-110 z-50"
        title="Help & Support"
      >
        <span className="text-sm font-bold">HELP?</span>
      </Link>
    </>
  );
};

export default Home;
