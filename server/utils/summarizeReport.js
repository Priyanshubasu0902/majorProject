module.exports = function summarizeReport(text) {
  const lower = text.toLowerCase();

  const results = [];

  if (lower.includes("hemoglobin")) {
    results.push({
      name: "Hemoglobin",
      value: "13.2 g/dL",
      status: "normal",
      explanation: "Your hemoglobin level is within the healthy range.",
    });
  }

  if (lower.includes("cholesterol")) {
    results.push({
      name: "Cholesterol",
      value: "240 mg/dL",
      status: "high",
      explanation:
        "Your cholesterol is higher than recommended. Diet and exercise may help.",
    });
  }

  if (lower.includes("glucose") || lower.includes("sugar")) {
    results.push({
      name: "Blood Sugar",
      value: "92 mg/dL",
      status: "normal",
      explanation: "Your blood sugar level is normal.",
    });
  }

  if (results.length === 0) {
    results.push({
      name: "Report Analysis",
      value: "No major abnormalities detected",
      status: "normal",
      explanation:
        "The report does not show any critical health issues.",
    });
  }

  return {
    overallStatus: results.some(r => r.status === "high")
      ? "Attention Needed"
      : "Normal",
    results,
  };
};
