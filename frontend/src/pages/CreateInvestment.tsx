import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface Account {
  id: number;
  name: string;
  balance: number;
}

export default function CreateInvestment() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [asset, setAsset] = useState("");
  const [amount, setAmount] = useState(0);
  const [monthlyContribution, setMonthlyContribution] = useState<number | null>(null);
  const [interestRate, setInterestRate] = useState(5);
  const [durationMonths, setDurationMonths] = useState(12);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:8080/api/accounts", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setAccounts(data);
        if (data.length > 0) setAccountId(data[0].id);
      })
      .catch((err) => console.error("Errore nel caricamento conti:", err));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountId || !asset || amount <= 0) {
      setError("Compila tutti i campi obbligatori.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/simulations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId,
          asset,
          amount,
          interestRate,
          durationMonths,
          monthlyContribution,
        }),
      });

      if (!res.ok) throw new Error(res.statusText);

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Creazione fallita. Controlla i dati e riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 max-w-xl mx-auto px-4 sm:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-800 mb-6 text-center">
        Crea un Nuovo Investimento
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-5 sm:p-6 rounded-lg shadow"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Conto associato
          </label>
          <select
            value={accountId ?? ""}
            onChange={(e) => setAccountId(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} (Saldo: €{acc.balance.toFixed(2)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Asset
          </label>
          <input
            type="text"
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Es. ETF, BTC, Oro"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Importo iniziale (€)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            min={0}
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contributo Mensile (PAC)
          </label>
          <input
            type="number"
            value={monthlyContribution ?? ""}
            onChange={(e) => setMonthlyContribution(e.target.value === "" ? null : parseFloat(e.target.value))}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            min={0}
            step="0.01"
            placeholder="Facoltativo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tasso d'interesse annuo (%)
          </label>
          <input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(parseFloat(e.target.value))}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Durata (mesi)
          </label>
          <input
            type="number"
            value={durationMonths}
            onChange={(e) => setDurationMonths(parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            min={1}
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
          {loading ? "Creazione..." : "Crea Investimento"}
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
