import { useState } from "react";
import { Card, CardContent } from "./ui/card";

const ReportUpload = ({ onResult }: { onResult: any }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload a report first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("report", file);

      const res = await fetch("http://localhost:5000/api/scan-report", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Analysis failed");
      }

      const data = await res.json();
      onResult(data);
    } catch (err) {
      setError("Something went wrong while analyzing the report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-3xl shadow-lg border-slate-200 bg-white">
      <CardContent className="p-8">
        <h2 className="text-xl font-semibold text-slate-800">
          Upload Report
        </h2>

        <div className="mt-6 border-2 border-dashed rounded-2xl p-8 text-center">
          <input
            type="file"
            accept=".pdf,.jpg,.png"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
            id="reportUpload"
          />

          <label htmlFor="reportUpload" className="cursor-pointer text-emerald-600">
            Click to upload
          </label>

          {file && <p className="mt-3 text-sm">{file.name}</p>}
        </div>

        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="mt-6 w-full rounded-full bg-emerald-600 py-3 text-white"
        >
          {loading ? "Analyzing..." : "Analyze Report"}
        </button>
      </CardContent>
    </Card>
  );
};

export default ReportUpload;
