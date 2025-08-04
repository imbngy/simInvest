import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
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
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Errore di accesso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl space-y-10">
        <h1 className="text-5xl font-light text-center tracking-tight text-gray-900">
          Accedi al tuo account
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
            {loading ? "Accesso in corso..." : "Accedi"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm">
          Non hai un account?{" "}
          <a href="/register" className="underline hover:text-black">
            Registrati
          </a>
        </p>
      </div>
    </div>
  );
}
