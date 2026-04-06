//majorProject/users/src/pages/ProfilePage.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Mail, Phone, Calendar, User, MapPin, Heart, Edit2, Check, X } from "lucide-react";
import TopBar from "../components/TopBar";
import { useUser } from "../context/UserContext";

export default function ProfilePage() {
  const { user, setUser } = useUser();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...user });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setDraft(p => ({ ...p, avatar: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const save = () => { setUser(draft); setEditing(false); };
  const cancel = () => { setDraft({ ...user }); setEditing(false); };

  const inputCls = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition";

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-800">My Profile</h2>
            {!editing
              ? <button onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 text-sm text-emerald-600 border border-emerald-200 px-4 py-2 rounded-xl hover:bg-emerald-50 transition">
                  <Edit2 size={14} /> Edit
                </button>
              : <div className="flex gap-2">
                  <button onClick={cancel} className="flex items-center gap-1 text-sm text-slate-500 border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 transition">
                    <X size={14} /> Cancel
                  </button>
                  <button onClick={save} className="flex items-center gap-1 text-sm text-white bg-emerald-600 px-3 py-2 rounded-xl hover:bg-emerald-700 transition">
                    <Check size={14} /> Save
                  </button>
                </div>
            }
          </div>

          {/* Avatar card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-4">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                  {(editing ? draft.avatar : user.avatar)
                    ? <img src={editing ? draft.avatar! : user.avatar!} alt="avatar" className="w-full h-full object-cover" />
                    : <User size={32} className="text-emerald-600" />}
                </div>
                {editing && (
                  <label className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1.5 cursor-pointer shadow-md">
                    <Camera size={12} className="text-white" />
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{user.fullName}</h3>
                <p className="text-sm text-slate-400">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100 font-medium">
                    {user.gender || "Not set"}
                  </span>
                  <span className="text-xs text-slate-400">• {user.age ? `${user.age} years` : "Age not set"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-4">
            <h4 className="text-sm font-semibold text-slate-600 mb-4 flex items-center gap-2">
              <User size={14} /> Personal Information
            </h4>
            <div className="space-y-4">
              <Field icon={<User size={14}/>} label="Full Name" value={editing ? draft.fullName : user.fullName}
                editing={editing} onChange={v => setDraft(p => ({ ...p, fullName: v }))} />
              <Field icon={<Mail size={14}/>} label="Email" value={editing ? draft.email : user.email}
                editing={editing} onChange={v => setDraft(p => ({ ...p, email: v }))} type="email" />
              <Field icon={<Phone size={14}/>} label="Mobile" value={editing ? draft.mobile : user.mobile}
                editing={editing} onChange={v => setDraft(p => ({ ...p, mobile: v }))} />
              <div className="grid grid-cols-2 gap-4">
                <Field icon={<Calendar size={14}/>} label="Age" value={editing ? draft.age : user.age}
                  editing={editing} onChange={v => setDraft(p => ({ ...p, age: v }))} type="number" />
                {editing
                  ? <div>
                      <p className="text-xs text-slate-400 mb-1.5">Gender</p>
                      <select value={draft.gender} onChange={e => setDraft(p => ({ ...p, gender: e.target.value }))}
                        className={inputCls}>
                        <option value="">Select</option>
                        <option>Male</option><option>Female</option>
                        <option>Other</option><option>Prefer not to say</option>
                      </select>
                    </div>
                  : <Field icon={<User size={14}/>} label="Gender" value={user.gender} editing={false} onChange={() => {}} />
                }
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-4">
            <h4 className="text-sm font-semibold text-slate-600 mb-4 flex items-center gap-2">
              <MapPin size={14} /> Saved Addresses
            </h4>
            <div className="space-y-3">
              {user.addresses.map((addr, i) => (
                <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm ${
                  user.defaultAddress === addr ? "border-emerald-200 bg-emerald-50" : "border-slate-100 bg-slate-50"
                }`}>
                  <MapPin size={14} className={`mt-0.5 shrink-0 ${user.defaultAddress === addr ? "text-emerald-600" : "text-slate-400"}`} />
                  <div className="flex-1">
                    <p className={user.defaultAddress === addr ? "text-emerald-800 font-medium" : "text-slate-600"}>{addr}</p>
                    {user.defaultAddress === addr && <p className="text-xs text-emerald-500 mt-0.5">Default address</p>}
                  </div>
                </div>
              ))}
              <button className="w-full py-2.5 text-sm text-emerald-600 font-medium border border-dashed border-emerald-200 rounded-xl hover:bg-emerald-50 transition">
                + Add new address
              </button>
            </div>
          </div>

          {/* Health Info */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <h4 className="text-sm font-semibold text-slate-600 mb-4 flex items-center gap-2">
              <Heart size={14} className="text-rose-400" /> Health Information
            </h4>
            <div>
              <p className="text-xs text-slate-400 mb-2">Medical Conditions</p>
              <div className="flex flex-wrap gap-2">
                {(user.conditions.length ? user.conditions : ["None"]).map(c => (
                  <span key={c} className="px-3 py-1.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function Field({ icon, label, value, editing, onChange, type = "text" }: {
  icon: React.ReactNode; label: string; value: string;
  editing: boolean; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-1.5 flex items-center gap-1">{icon} {label}</p>
      {editing
        ? <input type={type} value={value} onChange={e => onChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition" />
        : <p className="text-sm text-slate-700 font-medium">{value || <span className="text-slate-300 font-normal">Not set</span>}</p>
      }
    </div>
  );
}