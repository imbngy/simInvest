import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/landing");
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-gray-900 tracking-tight">
          SimInvest
        </Link>

        {/* Hamburger button */}
        <button
          className="sm:hidden flex items-center text-gray-700 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center space-x-6 text-sm font-medium">
          {token && user && (
            <span className="text-gray-600">Ciao, {user.email}</span>
          )}

          {token ? (
            <>
              <Link to="/dashboard" className="text-gray-700 hover:text-black transition">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-black transition">
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition"
              >
                Registrati
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile nav */}
      {isOpen && (
        <div className="sm:hidden px-4 pb-4">
          <div className="flex flex-col space-y-3 text-sm font-medium">
            {token && user && (
              <span className="text-gray-600">Ciao, {user.email}</span>
            )}

            {token ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-black transition"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-black transition"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition"
                  onClick={() => setIsOpen(false)}
                >
                  Registrati
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
