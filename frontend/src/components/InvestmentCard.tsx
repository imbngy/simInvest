import { useNavigate } from "react-router-dom";

interface Investment {
  id: number;
  asset: string;
  amount: number;
  expectedReturn: number;
  durationMonths: number;
  interestRate: number;
}

interface Props {
  investment: Investment;
}

export default function InvestmentCard({ investment }: Props) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/investment/${investment.id}`)}
      className="relative overflow-hidden rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01] cursor-pointer group"
    >
      <span className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-rose-400 to-fuchsia-500"></span>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-neutral-800 group-hover:text-rose-600 transition-colors">
            {investment.asset}
          </h3>
          <p className="text-sm text-gray-400 group-hover:opacity-100 opacity-0 transition-opacity duration-200">
            {investment.durationMonths} mesi • {investment.interestRate}% annuo
          </p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-blue-600 font-medium">
            Investito: {investment.amount.toFixed(2)} €
          </p>
          <p className="text-green-600 text-sm font-medium">
            Guadagno: +{investment.expectedReturn.toFixed(2)} €
          </p>
        </div>
      </div>
    </div>
  );
}
