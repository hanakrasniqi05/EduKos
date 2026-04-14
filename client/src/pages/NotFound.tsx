import React from "react";
import { Link } from "react-router-dom";
import doodle from "../assets/404doodle.png";

const NotFound: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#F4F9F0] from-5% to-emerald-500 flex items-center justify-center m-0 p-0 overflow-hidden">
      <div className="text-center pt-12"> 
        <img
          src={doodle}
          alt="404 doodle"
          className="w-[80vw] max-w-2xl h-auto mx-auto"
        />
        <h1 className="text-white text-3xl md:text-4xl font-bold mt-6">
          You’ve wandered off the map!
        </h1>

        <p className="text-white mt-3 text-lg">
          The page you’re looking for doesn’t exist.
        </p>

        <Link
          to="/"
          className="inline-block mt-6 bg-white text-emerald-600 font-semibold px-6 py-3 rounded-xl shadow-md hover:scale-105 transition"
        >
          Take me home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;