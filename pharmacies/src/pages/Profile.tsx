import React from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

const Profile = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 px-12 py-10">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-light text-slate-900">
          Pharmacy <span className="font-medium text-emerald-600">Profile</span>
        </h1>
        <p className="mt-2 text-slate-600">
          View your registered pharmacy details and store location
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left: Pharmacy Details */}
        <Card className="lg:col-span-2 rounded-3xl shadow-lg border border-slate-100">
          <CardContent className="p-8 space-y-6">
            
            <h2 className="text-xl font-semibold text-slate-900">
              Pharmacy Information
            </h2>

            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <ProfileItem label="Pharmacy Name" value="MedLux Pharmacy" />
              <ProfileItem label="Owner Name" value="Nandini Das" />
              <ProfileItem label="License Number" value="PHARMA-IND-45219" />
              <ProfileItem label="Verification Status" value="Verified ✅" />
              <ProfileItem label="Contact Number" value="+91 98765 43210" />
              <ProfileItem label="Email Address" value="medlux.pharma@gmail.com" />
              <ProfileItem
                label="Address"
                value="BTM Layout, 2nd Stage, Bangalore, Karnataka - 560076"
                full
              />
            </div>

           
          </CardContent>
        </Card>

        {/* Right: Map */}
        <Card className="rounded-3xl shadow-lg border border-slate-100">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Store Location
            </h2>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <iframe
                title="Pharmacy Location"
                src="https://www.google.com/maps?q=BTM+Layout+Bangalore&output=embed"
                className="w-full h-64"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <p className="text-xs text-slate-500">
              Location shown based on registered address
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

function ProfileItem({
  label,
  value,
  full = false,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-medium text-slate-900">
        {value}
      </p>
    </div>
  );
}

export default Profile;
