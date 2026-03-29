import React, { useEffect } from "react";
import Footer from "../components/Footer";
import {  useLab } from "@/context/LabContext";

const Dashboard = () => {

  const { tests, orders } = useLab();
    const counts = {
    total:     orders.length,
    completed: orders.filter(o => ["completed", "results_delivered"].includes(o.currentStatus)).length,
    pending:   orders.filter(o => ["pending", "confirmed", "sample_collected", "processing", "results_ready"].includes(o.currentStatus)).length,
    cancelled: orders.filter(o => o.currentStatus === "cancelled").length,
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
        <main className="flex-1 px-12 py-10">
          
          {/* Header */}
          <h1 className="text-4xl font-light text-slate-900">
            Welcome to{" "}
            <span className="font-medium text-emerald-600">MedLux</span>{" "}
            Pharmacy
          </h1>

          <p className="mt-3 text-slate-600 max-w-xl">
            Manage your medicines, track orders, and serve patients securely.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-12">
            <DashboardCard title="Total Tests" value={tests.length} />
            <DashboardCard title="Total Orders" value={counts.total} />
            <DashboardCard title="Active Orders" value={counts.pending} />
            <DashboardCard title="Completed Orders" value={counts.completed} />
            <DashboardCard title="Canceled Orders" value={counts.cancelled}/>
          </div>

        </main>
      </div>

      <Footer />
    </>
  );
};

function DashboardCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg border border-slate-100 hover:shadow-xl transition">
      <p className="text-sm text-slate-500">{title}</p>
      <h3 className="text-3xl font-bold text-slate-900 mt-3">
        {value}
      </h3>
    </div>
  );
}

export default Dashboard;
