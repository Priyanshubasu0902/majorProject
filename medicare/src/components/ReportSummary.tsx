import ResultCard from "./ResultCard";
import { Card, CardContent } from "./ui/card";

type ResultStatus = "low" | "normal" | "high";

interface ReportResult {
  name: string;
  value: string;
  status: ResultStatus;
}

interface ReportSummaryProps {
  data: ReportResult[] | null;
}

const ReportSummary = ({ data }: ReportSummaryProps) => {
  if (!data || data.length === 0) {
    return (
      <Card className="rounded-3xl shadow-lg bg-white">
        <CardContent className="p-8 text-slate-500 text-sm">
          Upload a report to view the simplified summary.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl shadow-lg bg-white">
      <CardContent className="p-8">
        <h2 className="text-xl font-semibold text-slate-800">
          Simplified Summary
        </h2>

        <div className="mt-6 space-y-4">
          {data.map((item, index) => (
            <ResultCard
              key={index}
              name={item.name}
              value={item.value}
              status={item.status}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportSummary;
