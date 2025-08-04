import { useNavigate } from "react-router-dom";

interface Account {
  id: number;
  name: string;
  balance: number;
}

interface Props {
  account: Account;
}

export default function AccountCard({ account }: Props) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/account/${account.id}`)}
      className="relative overflow-hidden rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer group hover:scale-[1.01]"
    >
      <span className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-indigo-500 to-purple-400"></span>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <h3 className="text-lg font-semibold text-neutral-800 group-hover:text-indigo-600 transition-colors">
            {account.name}
          </h3>
          <p className="text-sm text-gray-400 group-hover:opacity-100 opacity-0 transition-opacity duration-200">
            ID conto: {account.id}
          </p>
        </div>
        <p className="text-emerald-600 text-base font-medium md:text-right">
          {account.balance.toFixed(2)} €
        </p>
      </div>
    </div>
  );
}
