import React from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useLab } from "@/context/LabContext";

const Profile = () => {
  const { labData } = useLab();

  if (!labData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading pharmacy profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 px-12 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-light text-slate-900">
          Lab <span className="font-medium text-emerald-600">Profile</span>
        </h1>
        <p className="mt-2 text-slate-600">
          View your registered lab details and store location
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Lab Details */}
        <Card className="lg:col-span-2 rounded-3xl shadow-lg border border-slate-100">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Lab Information
            </h2>

            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <ProfileItem label="Lab Name" value={labData?.name} />
              <ProfileItem label="Owner Name" value={labData?.ownerName} />
              <ProfileItem
                label="License Number"
                value={labData?.licenseNumber}
              />
              <ProfileItem label="Gst Number" value={labData?.gstNumber} />
              <ProfileItem
                label="Verification Status"
                value={labData?.isApproved ? "Approved" : "Not Approved"}
              />
              <ProfileItem label="Contact Number" value={labData?.number} />
              <ProfileItem label="Email Address" value={labData?.email} />
              <ProfileItem label="Address" value={labData?.address} full />
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
                src={`https://www.google.com/maps?q=${labData.location.coordinates[1]},${labData.location.coordinates[0]}&z=15&output=embed`}
                className="w-full h-64"
                loading="lazy"
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
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-900">{value}</p>
    </div>
  );
}

export default Profile;
