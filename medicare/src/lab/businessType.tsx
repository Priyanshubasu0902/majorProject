import { Card, CardContent } from "@/components/ui/card";

export default function BusinessType() {
  const handleRedirect = (url: string) => {
    window.location.href = url;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white px-6">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-semibold text-center mb-10">
          Join <span className="text-emerald-600">MedLux</span> As
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PHARMACY */}
          <Card
            onClick={() =>
  handleRedirect(import.meta.env.VITE_PHARMACY_APP_URL)
}

            className="cursor-pointer rounded-3xl border hover:shadow-xl transition"
          >
            <CardContent className="p-8 text-center space-y-4">
              <div className="text-5xl">💊</div>
              <h2 className="text-xl font-semibold">Pharmacy</h2>
              <p className="text-sm text-slate-500">
                Sell medicines, manage prescriptions, fulfill orders
              </p>
            </CardContent>
          </Card>

          {/* DIAGNOSTIC LAB */}
          <Card
            onClick={() =>
              handleRedirect("https://lab.medicare.com")
            }
            className="cursor-pointer rounded-3xl border hover:shadow-xl transition"
          >
            <CardContent className="p-8 text-center space-y-4">
              <div className="text-5xl">🧪</div>
              <h2 className="text-xl font-semibold">Diagnostic Lab</h2>
              <p className="text-sm text-slate-500">
                Upload reports, manage test bookings, analytics
              </p>
            </CardContent>
          </Card>

          {/* DOCTOR */}
          <Card
            onClick={() =>
              handleRedirect("https://doctor.medicare.com")
            }
            className="cursor-pointer rounded-3xl border hover:shadow-xl transition"
          >
            <CardContent className="p-8 text-center space-y-4">
              <div className="text-5xl">👨‍⚕️</div>
              <h2 className="text-xl font-semibold">Doctor</h2>
              <p className="text-sm text-slate-500">
                Consult patients, manage appointments, prescriptions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
