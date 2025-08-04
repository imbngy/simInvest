import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import AccountCard from "../components/AccountCard";
import InvestmentCard from "../components/InvestmentCard";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Account {
  id: number;
  name: string;
  balance: number;
}

interface Investment {
  id: number;
  asset: string;
  amount: number;
  durationMonths: number;
  interestRate: number;
  expectedReturn: number;
  confirmed: boolean;
}

export default function Dashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:8080/api/accounts", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setAccounts)
      .catch((err) => console.error("Errore accounts:", err));

    fetch("http://localhost:8080/api/simulations", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setInvestments)
      .catch((err) => console.error("Errore investments:", err));
  }, [token]);

  const CreateCard = ({ onClick, label }: { onClick: () => void; label: string }) => (
    <div
      onClick={onClick}
      className="relative overflow-hidden rounded-xl border border-dashed border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-300 cursor-pointer flex items-center justify-center text-gray-500 font-medium text-center"
    >
      + {label}
    </div>
  );

  const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);
  const totalInvested = investments.reduce((acc, i) => acc + i.amount, 0);
  const totalExpectedReturn = investments.reduce((acc, i) => acc + i.expectedReturn, 0);

  const [bgColors, setBgColors] = useState<(string | CanvasGradient)[]>([
    "#93c5fd", "#facc15", "#4ade80"
  ]);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = chartRef.current;
    const { ctx, chartArea } = chart;
    if (!chartArea) return;

    const createGradient = (color1: string, color2: string) => {
      const gradient = ctx.createLinearGradient(0, 0, chartArea.width, 0);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);
      return gradient;
    };

    setBgColors([
      "#93c5fd",
      createGradient("#facc15", "#fcd34d"),
      createGradient("#4ade80", "#22c55e"),
    ]);
  }, [chartRef.current, accounts, investments]);

  const chartData: ChartData<"doughnut"> = {
    labels: ["Conti", "Investito", "Guadagno"],
    datasets: [
      {
        data: [totalBalance, totalInvested, totalExpectedReturn],
        backgroundColor: bgColors,
        borderWidth: 6,
        hoverOffset: 8,
      },
    ],
  };

  const chartOptions: ChartOptions<"doughnut"> = {
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#374151",
          font: { size: 14 },
        },
      },
    },
  };

  return (
    <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800 mb-10 tracking-tight text-center sm:text-left">
        La tua Dashboard
      </h1>

      {/* Chart + Statistiche */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-10 mb-16">
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="w-64 sm:w-80">
            <Doughnut data={chartData} options={chartOptions} ref={chartRef} />
          </div>
        </div>
        <div className="w-full md:w-1/2 space-y-3 text-gray-800 text-base sm:text-lg">
          <p>
            💰 <span className="font-semibold">Totale saldo disponibile:</span> {totalBalance.toFixed(2)} €
          </p>
          <p>
            📊 <span className="font-semibold">Totale capitale investito:</span> {totalInvested.toFixed(2)} €
          </p>
          <p>
            📈 <span className="font-semibold">Guadagno atteso:</span> {totalExpectedReturn.toFixed(2)} €
          </p>
        </div>
      </section>

      {/* Conti */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-neutral-700 mb-4">Conti</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map((acc) => (
            <AccountCard key={acc.id} account={acc} />
          ))}
          <CreateCard onClick={() => navigate("/create/account")} label="Crea un nuovo conto" />
        </div>
      </section>

      {/* Investimenti Confermati */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-neutral-700 mb-4">Investimenti Confermati</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {investments.filter((inv) => inv.confirmed).map((inv) => (
            <InvestmentCard key={inv.id} investment={inv} />
          ))}
          <CreateCard onClick={() => navigate("/investments/new")} label="Crea un nuovo investimento" />
        </div>
      </section>

      {/* Investimenti non confermati */}
      <section className="mb-20">
        <h2 className="text-2xl font-semibold text-neutral-700 mb-4">Investimenti in Attesa di Conferma</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {investments.filter((inv) => !inv.confirmed).map((inv) => (
            <InvestmentCard key={inv.id} investment={inv} />
          ))}
          <CreateCard onClick={() => navigate("/investments/new")} label="Crea un nuovo investimento" />
        </div>
      </section>
    </div>
  );
}
