import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, Phone, Mail, User, Calendar,
  Heart, Camera, ArrowRight, ArrowLeft, CheckCircle2,
  Loader2, Shield
} from "lucide-react";

type AuthMode = "login" | "signup";
type SignupStep = "basic" | "otp" | "profile";
type LoginMethod = "email" | "phone";

const MEDICAL_CONDITIONS = [
  "Diabetes", "Hypertension", "Asthma", "Heart Disease",
  "Thyroid", "Arthritis", "None"
];

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("email");
  const [signupStep, setSignupStep] = useState<SignupStep>("basic");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
  const [basicForm, setBasicForm] = useState({ fullName: "", mobile: "", email: "", password: "" });
  const [profileForm, setProfileForm] = useState({
    age: "", gender: "", conditions: [] as string[], avatar: null as string | null
  });

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleOtpKey = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      document.getElementById(`otp-${index - 1}`)?.focus();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProfileForm(p => ({ ...p, avatar: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const toggleCondition = (c: string) => {
    if (c === "None") { setProfileForm(p => ({ ...p, conditions: ["None"] })); return; }
    setProfileForm(p => ({
      ...p,
      conditions: p.conditions.includes(c)
        ? p.conditions.filter(x => x !== c)
        : [...p.conditions.filter(x => x !== "None"), c]
    }));
  };

  const fake = async (ms = 1000) => { setLoading(true); await new Promise(r => setTimeout(r, ms)); setLoading(false); };

  const inputCls = "w-full py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition placeholder:text-slate-400";
  const btnCls = "w-full bg-slate-900 text-white py-3.5 rounded-2xl font-medium text-sm hover:bg-slate-800 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-60";

  const slideV = {
    enter: (d: number) => ({ x: d * 50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d * -50, opacity: 0 })
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-100 flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-200/60 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-50/40 rounded-full blur-2xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-wide text-slate-900">
            Med<span className="text-emerald-600">Lux</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 tracking-wide">Your health, our priority</p>
        </div>

        <div className="bg-white/75 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-slate-200/60 border border-white/80 overflow-hidden">
          {/* Tab toggle */}
          <div className="flex border-b border-slate-100">
            {(["login", "signup"] as AuthMode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setSignupStep("basic"); setOtp(["","","","","",""]); }}
                className={`flex-1 py-4 text-sm font-medium capitalize transition-all ${
                  mode === m
                    ? "text-emerald-600 border-b-2 border-emerald-600 -mb-px bg-emerald-50/40"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          <div className="p-7">
            <AnimatePresence mode="wait" custom={1}>

              {/* ── LOGIN ── */}
              {mode === "login" && (
                <motion.div key="login" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
                  <h2 className="text-xl font-semibold text-slate-800 mb-0.5">Welcome back</h2>
                  <p className="text-sm text-slate-400 mb-6">Sign in to continue your care journey</p>

                  <div className="flex bg-slate-100 rounded-2xl p-1 mb-5">
                    {(["email", "phone"] as LoginMethod[]).map(m => (
                      <button key={m} onClick={() => setLoginMethod(m)}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${loginMethod === m ? "bg-white shadow text-slate-800" : "text-slate-500"}`}>
                        {m === "email" ? "📧 Email" : "📱 Phone"}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3.5">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        {loginMethod === "email" ? <Mail size={15} /> : <Phone size={15} />}
                      </div>
                      <input type={loginMethod === "email" ? "email" : "tel"}
                        placeholder={loginMethod === "email" ? "Email address" : "Mobile number"}
                        value={loginForm.identifier}
                        onChange={e => setLoginForm(p => ({ ...p, identifier: e.target.value }))}
                        className={`${inputCls} pl-10 pr-4`} />
                    </div>

                    <div className="relative">
                      <Shield size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input type={showPass ? "text" : "password"} placeholder="Password"
                        value={loginForm.password}
                        onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                        className={`${inputCls} pl-10 pr-10`} />
                      <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>

                    <div className="text-right -mt-1">
                      <button className="text-xs text-emerald-600 hover:underline">Forgot password?</button>
                    </div>

                    <button onClick={async () => { await fake(); navigate("/home"); }} disabled={loading} className={btnCls}>
                      {loading ? <Loader2 size={15} className="animate-spin" /> : <>Sign In <ArrowRight size={15} /></>}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── SIGNUP STEP 1 ── */}
              {mode === "signup" && signupStep === "basic" && (
                <motion.div key="s1" custom={1} variants={slideV} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28 }}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="text-xl font-semibold text-slate-800">Create account</h2>
                    <StepBadge current={1} total={3} />
                  </div>
                  <p className="text-sm text-slate-400 mb-6">Let's get you started</p>

                  <div className="space-y-3.5">
                    {[
                      { icon: <User size={15}/>, placeholder: "Full name", type: "text", key: "fullName" },
                      { icon: <Phone size={15}/>, placeholder: "Mobile number", type: "tel", key: "mobile" },
                      { icon: <Mail size={15}/>, placeholder: "Email address", type: "email", key: "email" },
                    ].map(f => (
                      <div key={f.key} className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">{f.icon}</div>
                        <input type={f.type} placeholder={f.placeholder}
                          value={(basicForm as any)[f.key]}
                          onChange={e => setBasicForm(p => ({ ...p, [f.key]: e.target.value }))}
                          className={`${inputCls} pl-10 pr-4`} />
                      </div>
                    ))}

                    <div className="relative">
                      <Shield size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input type={showPass ? "text" : "password"} placeholder="Create password"
                        value={basicForm.password}
                        onChange={e => setBasicForm(p => ({ ...p, password: e.target.value }))}
                        className={`${inputCls} pl-10 pr-10`} />
                      <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>

                    <button onClick={async () => { await fake(800); setSignupStep("otp"); }} disabled={loading} className={btnCls}>
                      {loading ? <Loader2 size={15} className="animate-spin" /> : <>Send OTP <ArrowRight size={15} /></>}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── SIGNUP STEP 2: OTP ── */}
              {mode === "signup" && signupStep === "otp" && (
                <motion.div key="s2" custom={1} variants={slideV} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28 }}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="text-xl font-semibold text-slate-800">Verify email</h2>
                    <StepBadge current={2} total={3} />
                  </div>
                  <p className="text-sm text-slate-400 mb-1">We sent a 6-digit code to</p>
                  <p className="text-sm font-semibold text-slate-700 mb-8">{basicForm.email || "your email"}</p>

                  <div className="flex gap-2 justify-center mb-8">
                    {otp.map((digit, i) => (
                      <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1}
                        value={digit} onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKey(i, e)}
className="w-10 h-10 text-center text-base font-bold rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition"                      />
                    ))}
                  </div>

                  <button onClick={async () => { await fake(800); setSignupStep("profile"); }}
                    disabled={loading || otp.some(d => !d)} className={btnCls}>
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <><CheckCircle2 size={15} /> Verify & Continue</>}
                  </button>

                  <div className="flex justify-between mt-4">
                    <button onClick={() => setSignupStep("basic")} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
                      <ArrowLeft size={11} /> Back
                    </button>
                    <button className="text-xs text-emerald-600 hover:underline">Resend OTP</button>
                  </div>
                </motion.div>
              )}

              {/* ── SIGNUP STEP 3: PROFILE ── */}
              {mode === "signup" && signupStep === "profile" && (
                <motion.div key="s3" custom={1} variants={slideV} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28 }}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="text-xl font-semibold text-slate-800">Health profile</h2>
                    <StepBadge current={3} total={3} />
                  </div>
                  <p className="text-sm text-slate-400 mb-6">Personalise your experience</p>

                  {/* Avatar */}
                  <div className="flex justify-center mb-6">
                    <label className="relative cursor-pointer group">
                      <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 group-hover:border-emerald-400 transition flex items-center justify-center overflow-hidden shadow-sm">
                        {profileForm.avatar
                          ? <img src={profileForm.avatar} alt="avatar" className="w-full h-full object-cover" />
                          : <Camera size={22} className="text-slate-400 group-hover:text-emerald-500 transition" />}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 rounded-full p-1.5 shadow">
                        <Camera size={9} className="text-white" />
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <Calendar size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input type="number" placeholder="Age"
                          value={profileForm.age}
                          onChange={e => setProfileForm(p => ({ ...p, age: e.target.value }))}
                          className={`${inputCls} pl-10 pr-4`} />
                      </div>
                      <select value={profileForm.gender}
                        onChange={e => setProfileForm(p => ({ ...p, gender: e.target.value }))}
                        className={`${inputCls} px-4 text-slate-600`}>
                        <option value="">Gender</option>
                        <option>Male</option><option>Female</option>
                        <option>Other</option><option>Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <Heart size={13} className="text-rose-400" />
                        <p className="text-xs font-medium text-slate-500">Medical conditions (optional)</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {MEDICAL_CONDITIONS.map(c => (
                          <button key={c} onClick={() => toggleCondition(c)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                              profileForm.conditions.includes(c)
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-600"
                            }`}>{c}</button>
                        ))}
                      </div>
                    </div>

                    <button onClick={async () => { await fake(); navigate("/home"); }} disabled={loading}
                      className="w-full bg-emerald-600 text-white py-3.5 rounded-2xl font-medium text-sm hover:bg-emerald-700 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-60">
                      {loading ? <Loader2 size={15} className="animate-spin" /> : <><CheckCircle2 size={15} /> Complete Setup</>}
                    </button>
                  </div>

                  <button onClick={() => setSignupStep("otp")} className="mt-4 text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
                    <ArrowLeft size={11} /> Back
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          By continuing, you agree to MedLux's{" "}
          <span className="underline cursor-pointer hover:text-slate-600">Terms</span> &{" "}
          <span className="underline cursor-pointer hover:text-slate-600">Privacy Policy</span>
        </p>
      </motion.div>
    </div>
  );
}

function StepBadge({ current, total }: { current: number; total: number }) {
  return (
    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
      {current}/{total}
    </span>
  );
}