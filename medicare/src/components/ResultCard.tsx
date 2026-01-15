interface Props {
  name: string;
  value: string;
  status: "low" | "normal" | "high";
}

const statusStyles = {
  low: "bg-yellow-50 text-yellow-700",
  normal: "bg-green-50 text-green-700",
  high: "bg-red-50 text-red-700",
};

const ResultCard = ({ name, value, status }: Props) => {
  return (
    <div
      className={`flex justify-between items-center rounded-2xl px-5 py-4 ${statusStyles[status]}`}
    >
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs opacity-80">{value}</p>
      </div>

      <span className="text-xs font-semibold uppercase">
        {status}
      </span>
    </div>
  );
};

export default ResultCard;
