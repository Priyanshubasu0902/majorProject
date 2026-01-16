import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_BACKEND_URL;

type Step = 1 | 2 | 3 | 4;
type Mode = "login" | "signup";

export default function PartnerAuth() {
  const [mode, setMode] = useState<Mode>("signup");
  const [step, setStep] = useState<Step>(1);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [orgName, setorgName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
  const [otp, setOtp] = useState('');
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [gstFile, setGstFile] = useState<File | null>(null);
  const [nablFile, setNablFile] = useState<File | null>(null);


  const handleNext = () => {
    if (step < 4) setStep((prev) => (prev + 1) as Step);
  };

  //  Handle OTP Sending
  const handleSendOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API}/partners/send-otp`, {
        email: formData.email,
        phone: formData.phone,
      });
      handleNext(); // Move to OTP step
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Verification
  const handleVerifyOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API}/partners/verify-otp`, {
        phone: formData.phone,
        otp: formData.otp,
      });
      handleNext(); // Move to document upload step
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Final Form Submission
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = new FormData();

      // Append fields (excluding OTP)
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "otp" && value) {
          data.append(key, value as any);
        }
      });

      await axios.post(`${API}/partners/register`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      handleNext(); // move to pending step
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to register");
    } finally {
      setLoading(false);
    }
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
            <p className="text-sm text-slate-500 mt-1">Partner Portal</p>
          </div>

          {/* Mode Switch */}
          <div className="flex mb-6 bg-slate-100 rounded-full p-1">
            <button
              className={`w-1/2 py-2 rounded-full text-sm ${
                mode === "signup" ? "bg-white shadow font-medium" : "text-slate-500"
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
                mode === "login" ? "bg-white shadow font-medium" : "text-slate-500"
              }`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm text-center mb-2">{error}</p>
          )}

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
              <Button
                className="w-full rounded-full py-6"
                onClick={() => navigate("/dashboard")}
              >
                Login
              </Button>
              <p className="text-xs text-center text-slate-500">
                Account pending approval? You’ll be notified once approved.
              </p>
            </div>
          )}

          {/* SIGNUP FLOW */}
          {mode === "signup" && (
            <>
              {step === 1 && (
                <div className="space-y-4">
                  <Input
                    placeholder="Organization Name"
                    value={formData.orgName}
                    onChange={(e) =>
                      setFormData({ ...formData, orgName: e.target.value })
                    }
                  />
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
                  <Button
                    className="w-full rounded-full py-6"
                    onClick={handleSendOtp}
                    disabled={loading}
                  >
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </Button>
                </div>
              )}

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
                    onClick={handleVerifyOtp}
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </Button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <p className="text-sm text-center text-slate-500">
                    Upload Required Documents
                  </p>

                  {/* License */}
                  <Input
                    type="file"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        licenseFile: e.target.files?.[0] || null,
                      })
                    }
                  />
                  <p className="text-xs text-slate-400">License Certificate</p>

                  {/* GST */}
                  <Input
                    type="file"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gstFile: e.target.files?.[0] || null,
                      })
                    }
                  />
                  <p className="text-xs text-slate-400">GST Certificate</p>

                  {/* NABL */}
                  <Input
                    type="file"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nablFile: e.target.files?.[0] || null,
                      })
                    }
                  />
                  <p className="text-xs text-slate-400">NABL Certificate</p>

                  <Button
                    className="w-full rounded-full py-6"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit for Approval"}
                  </Button>
                </div>
              )}

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