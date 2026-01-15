import { useState } from "react";
import ReportUpload from "../components/ReportUpload";
import ReportSummary from "../components/ReportSummary";

const ScanReport = () => {
  const [summary, setSummary] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 px-10 py-12">
      <h1 className="text-4xl font-light text-slate-900">
        
        Scan Medical <span className="text-emerald-600 font-medium">Report</span>
      </h1>

      <p className="mt-3 text-slate-600 max-w-2xl">
        Upload your medical report and get an easy-to-understand summary.
      </p>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <ReportUpload onResult={setSummary} />
        <ReportSummary data={summary} />
      </div>
    </div>
  );
};

export default ScanReport;
