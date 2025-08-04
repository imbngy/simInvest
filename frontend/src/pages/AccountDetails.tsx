import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Transaction from "../components/Transaction";
import { useAuth } from "../context/AuthContext";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

interface Account {
  id: number;
  name: string;
  balance: number;
}

interface Investment {
  id: number;
  asset: string;
  amount: number;
  expectedReturn: number;
  confirmed: boolean;
}

interface TransactionType {
  id: number;
  type: "DEPOSIT" | "WITHDRAWAL";
  amount: number;
  timestamp: string;
  description?: string;
}

export default function AccountDetails() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);

  useEffect(() => {
    if (!id || !token) return;

    const fetchData = async () => {
      try {
        const [accRes, txRes, invRes] = await Promise.all([
          fetch(`http://localhost:8080/api/accounts/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:8080/api/accounts/${id}/transactions`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:8080/api/accounts/${id}/investments`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const [accData, txData, invData] = await Promise.all([
          accRes.json(),
          txRes.json(),
          invRes.json(),
        ]);

        setAccount(accData);
        setTransactions(txData);
        setInvestments(invData);
      } catch (err) {
        console.error("Errore nel caricamento dati:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const handleCloseAccount = async () => {
    if (!token) return;

    const confirmClose = window.confirm("Sei sicuro di voler chiudere questo conto?");
    if (!confirmClose) return;

    try {
      const res = await fetch(`http://localhost:8080/api/accounts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Errore nella chiusura del conto");

      navigate("/dashboard");
    } catch (err) {
      console.error("Errore nella chiusura del conto:", err);
    }
  };

  const handleTransaction = async (type: "DEPOSIT" | "WITHDRAWAL", amount: number) => {
    if (!token || !id || amount <= 0) return;

    const confirmMsg = type === "DEPOSIT" ? "Confermi il deposito?" : "Confermi il prelievo?";
    if (!window.confirm(confirmMsg)) return;
    
    if (type === "WITHDRAWAL") {
      try {
        const res = await fetch(`http://localhost:8080/api/accounts/${id}/withdraw`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ type, amount }),
        });

        if (!res.ok) throw new Error("Errore nella transazione");

        window.location.reload();
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        const res = await fetch(`http://localhost:8080/api/accounts/${id}/deposit`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ type, amount }),
        });

        if (!res.ok) throw new Error("Errore nella transazione");

        window.location.reload();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) return <p className="text-center py-10 text-gray-500">Caricamento...</p>;
  if (!account) return <p className="text-center py-10 text-gray-500">Conto non trovato</p>;

  // Prepara dati grafico
  const sortedTx = [...transactions].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  let runningBalance = 0;
  const labels = sortedTx.map((tx) => new Date(tx.timestamp).toLocaleDateString("it-IT"));
  const dataPoints = sortedTx.map((tx) => {
    if (tx.type === "DEPOSIT" ) runningBalance += tx.amount;
    else if (tx.type === "WITHDRAWAL") runningBalance -= tx.amount;
    return runningBalance;
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: "Saldo nel tempo (€)",
        data: dataPoints,
        fill: false,
        borderColor: "#6366F1",
        backgroundColor: "#6366F1",
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
    scales: {
      y: {
        ticks: {
          callback: (tickValue: string | number) => `${tickValue}€`,
        },
      },
    },
  };

 return (
    <div className="pt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <section>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-800 mb-2">{account.name}</h1>
        <p className="text-base sm:text-lg text-gray-700 mb-6">
          Saldo attuale: <span className="font-semibold">{account.balance.toFixed(2)}€</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm mb-1">Deposita (€)</label>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(parseFloat(e.target.value))}
              className="w-full border rounded px-3 py-2"
              min={0}
            />
            <button
              onClick={() => handleTransaction("DEPOSIT", depositAmount)}
              className="mt-2 w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Deposita
            </button>
          </div>

          <div>
            <label className="block text-sm mb-1">Preleva (€)</label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(parseFloat(e.target.value))}
              className="w-full border rounded px-3 py-2"
              min={0}
              max={account.balance}
            />
            <button
              onClick={() => handleTransaction("WITHDRAWAL", withdrawAmount)}
              className="mt-2 w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Preleva
            </button>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-semibold text-neutral-700 mb-4">Investimenti collegati</h2>
        {investments.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Nessun investimento trovato.</p>
            <div
              onClick={() => navigate("/investments/new")}
              className="border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition rounded p-4 cursor-pointer flex items-center justify-center text-gray-500 hover:text-indigo-600 font-medium text-center"
            >
              + Crea nuovo investimento
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {investments.map((inv) => (
              <div
                key={inv.id}
                onClick={() => navigate(`/investment/${inv.id}`)}
                className={`rounded-lg p-5 shadow cursor-pointer transition border
                  ${inv.confirmed ? "border-green-400 hover:bg-green-50" : "border-blue-400 hover:bg-blue-50"}`}
              >
                <h3 className="text-lg font-semibold text-neutral-800">{inv.asset}</h3>
                <p className="text-gray-700">Importo: {inv.amount.toFixed(2)}€</p>
                <p className="text-gray-700">Rendimento atteso: {inv.expectedReturn.toFixed(2)}€</p>
                <p className={`mt-2 text-sm font-medium ${inv.confirmed ? "text-green-600" : "text-blue-600"}`}>
                  {inv.confirmed ? "Investimento confermato" : "Investimento non confermato"}
                </p>
              </div>
            ))}
            <div
              onClick={() => navigate("/investments/new")}
              className="border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition rounded p-4 cursor-pointer flex items-center justify-center text-gray-500 hover:text-indigo-600 font-medium text-center"
            >
              + Crea nuovo investimento
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleCloseAccount}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-md font-medium transition"
          >
            Chiudi Conto
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-200 hover:bg-gray-300 text-black px-5 py-2 rounded-md font-medium transition"
          >
            Torna alla Dashboard
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-xl sm:text-2xl font-semibold text-neutral-700 mb-4">Andamento del Saldo</h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-500">Dati insufficienti per mostrare un grafico.</p>
        ) : (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 overflow-x-auto">
            <Line data={chartData} options={chartOptions} />
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl sm:text-2xl font-semibold text-neutral-700 mb-4">Storico Transazioni</h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-500">Nessuna transazione registrata.</p>
        ) : (
          <div className="rounded-lg border bg-white divide-y shadow-sm overflow-x-auto">
            {transactions.map((tx) => (
              <Transaction
                key={tx.id}
                type={tx.type}
                amount={tx.amount}
                date={tx.timestamp}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}