import dayjs from "dayjs";

interface TransactionProps {
  type: "DEPOSIT" | "WITHDRAWAL";
  amount: number;
  date: string;
}

const TRANSLATIONS: Record<TransactionProps["type"], string> = {
  DEPOSIT: "Deposito",
  WITHDRAWAL: "Prelievo",
};

export default function Transaction({ type, amount, date }: TransactionProps) {
  const isPositive = type === "DEPOSIT";

  const formattedDate = dayjs(date).isValid()
    ? dayjs(date).format("DD/MM/YYYY HH:mm")
    : "Data non valida";

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b py-3 px-2 sm:px-4">
      <div className="mb-2 sm:mb-0">
        <p className="font-medium text-sm sm:text-base">{TRANSLATIONS[type]}</p>
        <p className="text-xs text-gray-500">{formattedDate}</p>
      </div>
      <div
        className={`font-semibold text-sm sm:text-base ${
          isPositive ? "text-green-600" : "text-red-500"
        }`}
      >
        {isPositive ? "+" : "-"}€{amount.toFixed(2)}
      </div>
    </div>
  );
}
