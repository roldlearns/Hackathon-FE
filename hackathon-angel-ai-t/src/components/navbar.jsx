import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeartbeat } from '@fortawesome/free-solid-svg-icons';
const Navbar = () => {
  return (
    <nav className="flex items-center justify-between py-2 px-6 bg-white shadow-md ">
      <div className="flex items-center space-x-2">
       <FontAwesomeIcon icon={faHeartbeat} className="text-indigo-600 text-3xl mb-3 animate-pulse " />
        <h1 className="text-2xl font-bold text-indigo-700">Angel-AI-t</h1>
      </div>
      <div>
      </div>
    </nav>
  );
};

export default Navbar;