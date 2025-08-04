import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function CreateAccount() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [balance, setInitialBalance] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || balance < 0) {
      setError("Nome obbligatorio e saldo iniziale non negativo.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, balance }),
      });

      if (!response.ok) {
        throw new Error("Errore nella creazione del conto");
      }

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Impossibile creare il conto. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 max-w-xl mx-auto px-6">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-800 mb-6 text-center">
        Crea un nuovo Conto
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-lg shadow"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome del conto
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Es. Conto Principale"
            required
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Saldo iniziale (€)
          </label>
          <input
            type="number"
            value={balance}
            onChange={(e) => setInitialBalance(parseFloat(e.target.value))}
            min="0"
            step="0.01"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition disabled:opacity-50"
        >
          {loading ? "Creazione in corso..." : "Crea Conto"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm text-gray-600 hover:text-blue-600 hover:underline transition"
        >
          ← Torna alla Dashboard
        </button>
      </div>
    </div>
  );
}
