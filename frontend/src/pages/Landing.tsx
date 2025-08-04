import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

export default function Landing() {
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  }, [token, navigate]);

  return (
    <main className="relative isolate min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-32 bg-white text-black">
      {/* Sfondo */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-40 -z-10 overflow-hidden blur-3xl sm:-top-80"
      >
        <div
          className="relative left-[calc(50%-6rem)] aspect-[1155/678] w-[56rem] -translate-x-1/2 rotate-[30deg]
          bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 
          sm:left-[calc(50%-30rem)] sm:w-[72rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      {/* Contenuto principale */}
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-10 bg-gradient-to-r from-orange-700 via-blue-500 to-green-400 text-transparent bg-clip-text bg-300% animate-gradient">
          SimInvest
        </h1>
        <p className="text-base sm:text-xl lg:text-2xl leading-relaxed mb-10 text-gray-700">
          Simula investimenti. Gestisci il tuo denaro. Osserva il rendimento dei tuoi risparmi. Senza complicazioni.
        </p>

        <Link
          to="/register"
          className="inline-block rounded-lg bg-indigo-600 px-6 py-3 text-sm sm:text-base font-semibold text-white shadow hover:bg-indigo-700 transition"
        >
          Inizia Ora
        </Link>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 w-full text-center text-xs sm:text-sm text-gray-400">
        &copy; {new Date().getFullYear()} SimInvest. Tutti i diritti riservati.
      </footer>
    </main>
  );
}
