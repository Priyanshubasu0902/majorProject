import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Step = 1 | 2 | 3 | 4;
type Mode = "login" | "signup";

export default function PartnerAuth() {
  const [mode, setMode] = useState<Mode>("signup");
  const [step, setStep] = useState<Step>(1);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    orgName: "",
    businessType: "Diagnostic Lab",
    phone: "",
    otp: "",
    gstNumber: "",
    licenseNumber: "",
    licenseFile: null as File | null,
    gstFile: null as File | null,
    nablFile: null as File | null,
  });

  const handleNext = () => {
    if (step < 4) setStep((prev) => (prev + 1) as Step);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white px-6">
      <Card className="w-full max-w-md rounded-3xl shadow-xl border-slate-200">
        <CardContent className="p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold">
              Med<span className="text-emerald-600">Lux</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Partner Portal (Labs & Pharmacies)
            </p>
          </div>

          {/* Mode Switch */}
          <div className="flex mb-6 bg-slate-100 rounded-full p-1">
            <button
              className={`w-1/2 py-2 rounded-full text-sm ${
                mode === "signup"
                  ? "bg-white shadow font-medium"
                  : "text-slate-500"
              }`}
              onClick={() => {
                setMode("signup");
                setStep(1);
              }}
            >
              Sign Up
            </button>
            <button
              className={`w-1/2 py-2 rounded-full text-sm ${
                mode === "login"
                  ? "bg-white shadow font-medium"
                  : "text-slate-500"
              }`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
          </div>

          {/* LOGIN */}
          {mode === "login" && (
            <div className="space-y-5">
              <Input
                placeholder="Business Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <Button className="w-full rounded-full py-6">
                Login
              </Button>
              <p className="text-xs text-center text-slate-500">
                Account pending approval? You’ll be notified once approved.
              </p>
            </div>
          )}

          {/* SIGN UP */}
          {mode === "signup" && (
            <>
              {/* STEP 1 – BASIC DETAILS */}
              {step === 1 && (
                <div className="space-y-4">
                  <Input
                    placeholder="Organization Name"
                    value={formData.orgName}
                    onChange={(e) =>
                      setFormData({ ...formData, orgName: e.target.value })
                    }
                  />

                  <select 
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    value={formData.businessType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessType: e.target.value,
                      })
                    }
                  >
                    <option>Diagnostic Lab</option>
                    <option>Pharmaceutical</option>
                    <option>Clinic / Hospital</option>
                  </select>

                  <Input
                    placeholder="Business Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />

                  <Input
                    type="password"
                    placeholder="Create Password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />

                  <Input
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />

                  <Input
                    placeholder="GST Number"
                    value={formData.gstNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gstNumber: e.target.value.toUpperCase(),
                      })
                    }
                  />

                  <Input
                    placeholder="License Number"
                    value={formData.licenseNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        licenseNumber: e.target.value,
                      })
                    }
                  />

                  <Button
                    className="w-full rounded-full py-6"
                    onClick={handleNext}
                  >
                    Send OTP
                  </Button>
                </div>
              )}

              {/* STEP 2 – OTP */}
              {step === 2 && (
                <div className="space-y-5">
                  <p className="text-sm text-center text-slate-500">
                    Enter OTP sent to <b>{formData.phone}</b>
                  </p>
                  <Input
                    placeholder="OTP"
                    value={formData.otp}
                    onChange={(e) =>
                      setFormData({ ...formData, otp: e.target.value })
                    }
                  />
                  <Button
                    className="w-full rounded-full py-6"
                    onClick={handleNext}
                  >
                    Verify OTP
                  </Button>
                </div>
              )}

              {/* STEP 3 – DOCUMENTS */}
              {step === 3 && (
                <div className="space-y-4">
                  <p className="text-sm text-center text-slate-500">
                    Upload Required Documents
                  </p>

                  <Input type="file" />
                  <p className="text-xs text-slate-400">
                    License Certificate
                  </p>

                  <Input type="file" />
                  <p className="text-xs text-slate-400">GST Certificate</p>

                  <Input type="file" />
                  <p className="text-xs text-slate-400">
                    NABL Certificate (optional)
                  </p>

                  <Button
                    className="w-full rounded-full py-6"
                    onClick={handleNext}
                  >
                    Submit for Approval
                  </Button>
                </div>
              )}

              {/* STEP 4 – PENDING */}
              {step === 4 && (
                <div className="text-center space-y-4">
                  <p className="text-lg">🎉 Application Submitted</p>
                  <p className="text-sm text-slate-500">
                    Your account is under review. Approval takes 24–48 hours.
                  </p>
                  <Button disabled className="w-full rounded-full py-6">
                    Awaiting Approval
                  </Button>
                </div>
              )}

              {/* Step indicators */}
              <div className="mt-6 flex justify-center gap-2">
                {[1, 2, 3, 4].map((s) => (
                  <span
                    key={s}
                    className={`h-2 w-2 rounded-full ${
                      step === s ? "bg-emerald-600" : "bg-slate-300"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
