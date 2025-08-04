import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  if (token) {
    useEffect(() => {
      navigate("/dashboard");
    }, [token, navigate]);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Registrazione fallita");
      }

      navigate("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl space-y-10">
        <h1 className="text-5xl font-light text-center tracking-tight text-gray-900">
          Crea un account
        </h1>

        {error && (
          <p className="text-center text-red-500 text-sm">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              required
              value={form.username}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              value={form.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white text-center py-3 rounded-lg hover:opacity-90 transition"
          >
            {loading ? "Registrazione in corso..." : "Registrati"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm">
          Hai già un account?{" "}
          <a href="/login" className="underline hover:text-black">
            Accedi
          </a>
        </p>
      </div>
    </div>
  );
}
