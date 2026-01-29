import React from "react";
import Footer from "../components/Footer"; 

const Dashboard = () => {
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
            <DashboardCard title="Total Products" value="24" />
            <DashboardCard title="Active Orders" value="6" />
            <DashboardCard title="Completed Orders" value="128" />
            <DashboardCard title="Canceled Orders" value="20" />
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
  value: string;
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
