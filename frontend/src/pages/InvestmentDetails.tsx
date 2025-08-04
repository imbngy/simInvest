import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Transaction from "../components/Transaction";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

interface Investment {
  id: number;
  asset: string;
  amount: number;
  interestRate: number;
  durationMonths: number;
  expectedReturn: number;
  simulatedAt: string;
  confirmed: boolean;
  monthlyContribution: number;
  account: {
    id: number;
    name: string;
  };
}

interface TransactionType {
  id: number;
  type: "DEPOSIT" | "WITHDRAWAL";
  amount: number;
  timestamp: string;
  description?: string;
}

export default function InvestmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);

  useEffect(() => {
    if (!id || !token) return;

    const fetchData = async () => {
      try {
        const [invRes, txRes] = await Promise.all([
          fetch(`http://localhost:8080/api/simulations/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:8080/api/simulations/${id}/transactions`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const [invData, txData] = await Promise.all([invRes.json(), txRes.json()]);
        setInvestment(invData);
        setTransactions(txData);
      } catch (err) {
        console.error("Errore nel caricamento dati:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const handleCloseInvestment = () => {
    if (!investment) return;
    if (!window.confirm("Sei sicuro di voler chiudere questo investimento?")) return;

    fetch(`http://localhost:8080/api/simulations/${investment.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) {
          alert("Investimento chiuso con successo.");
          navigate("/dashboard");
        } else {
          throw new Error("Errore nella chiusura dell'investimento.");
        }
      })
      .catch((err) => {
        console.error(err);
        alert(err.message || "Errore nella chiusura dell'investimento.");
      });
  };

  const handleConfirmInvestment = () => {
    if (!investment) return;
    if (!window.confirm("Sei sicuro di voler confermare questo investimento?")) return;

    fetch(`http://localhost:8080/api/simulations/${investment.id}/confirm`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.ok) {
          alert("Investimento confermato con successo.");
          navigate(`/investment/${investment.id}`);
          window.location.reload();
        } else {
          return res.text().then((text) => {
            alert(text);
            throw new Error(text);
          });
        }
      })
      .catch((err) => console.error(err));
  };

  const handleWithdraw = () => {
    if (!investment) return;
    if (!window.confirm("Sei sicuro di voler prelevare i fondi da questo investimento?")) return;

    fetch(`http://localhost:8080/api/simulations/${investment.id}/withdraw`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount: withdrawAmount }),
    })
      .then((res) => {
        if (res.ok) {
          alert("Prelievo effettuato con successo.");
          navigate("/dashboard");
        } else {
          return res.text().then((text) => {
            alert(text);
            throw new Error(text);
          });
        }
      })
      .catch((err) => console.error(err));
  };

  if (loading) return <p className="text-center py-10 text-gray-500">Caricamento...</p>;
  if (!investment) return <p className="text-center py-10 text-gray-500">Investimento non trovato</p>;

  const maturityDate = new Date(investment.simulatedAt);
  maturityDate.setMonth(maturityDate.getMonth() + investment.durationMonths);

  const years = Math.floor(investment.durationMonths / 12);
  const labels = Array.from({ length: years + 1 }, (_, i) => `${i}`);

  const annualGain = (investment.expectedReturn / years) || 0;
  const gainData = Array.from({ length: years + 1 }, (_, i) => Number((annualGain * i).toFixed(2)));
  const investedData = Array(labels.length).fill(investment.amount);
  const pacData = Array.from({ length: years + 1 }, (_, i) => Number((investment.amount + (investment.monthlyContribution * 12 * i)).toFixed(2)));

  const chartData = {
    labels,
    datasets: [
      {
        label: "Rendimento cumulato (€)",
        data: gainData,
        fill: true,
        borderColor: "#4ade80",
        backgroundColor: "rgba(74, 222, 128, 0.3)",
        tension: 0.3,
      },
      {
        label: "Capitale investito (€)",
        data: investedData,
        fill: false,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderDash: [5, 5],
        tension: 0.1,
      },
      {
        label: "PAC cumulato su Capitale investito (€)",
        data: pacData,
        fill: false,
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.2)",
        borderDash: [3, 3],
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="pt-24 max-w-5xl mx-auto px-6 space-y-16">
      <section className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-800 mb-4">
          {investment.asset}
        </h1>

        <div className="space-y-2 text-gray-700 text-lg">
          <p>Importo: <span className="font-medium">{investment.amount.toFixed(2)}€</span></p>
          <p>PAC mensile: <span className="font-medium">{investment.monthlyContribution.toFixed(2)}€</span></p>
          <p>Rendimento Atteso: <span className="text-green-600 font-medium">+{investment.expectedReturn.toFixed(2)}€</span></p>
          <p>Tasso d’interesse: {investment.interestRate}%</p>
          <p>Durata: {investment.durationMonths} mesi</p>
          <p>Data inizio: {new Date(investment.simulatedAt).toLocaleDateString("it-IT")}</p>
          <p>Scadenza: {maturityDate.toLocaleDateString("it-IT")}</p>
          <p>Conto collegato: #{investment.account.id} - <span className="font-medium">{investment.account.name}</span></p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-4">
          {investment.confirmed ? (
            <>
              <input
                type="number"
                placeholder="Importo da prelevare"
                className="border border-gray-300 rounded-md px-4 py-2 w-full sm:w-auto"
                min="0"
                max={investment.amount}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(parseFloat(e.target.value))}
              />
              <button
                onClick={handleWithdraw}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md font-medium transition"
              >
                Preleva
              </button>
            </>
          ) : (
            <button
              onClick={handleConfirmInvestment}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md font-medium transition"
            >
              Conferma Investimento
            </button>
          )}

          <button
            onClick={handleCloseInvestment}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-md font-medium transition"
          >
            Chiudi Investimento
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-200 hover:bg-gray-300 text-black px-5 py-2 rounded-md font-medium transition"
          >
            Torna alla Dashboard
          </button>
        </div>
      </section>

      <section className="bg-white p-6 rounded-lg shadow space-y-6">
        <h2 className="text-2xl font-semibold text-neutral-700">Proiezione rendimento annuale</h2>
        <Line data={chartData} />
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-neutral-700 mb-4">Transazioni</h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-500">Nessuna transazione disponibile.</p>
        ) : (
          <div className="rounded-lg border bg-white divide-y shadow-sm">
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
