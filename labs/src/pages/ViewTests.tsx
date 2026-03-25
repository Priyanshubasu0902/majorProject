import React, { useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useLab } from "@/context/LabContext";

const ViewTests = () => {
  const { tests, deleteTest, changeVisibility } = useLab();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 px-12 py-10">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-light text-slate-900">
          Your <span className="font-medium text-emerald-600">Tests</span>
        </h1>
        <p className="mt-2 text-slate-600">
          Manage tests available in your lab
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {tests.map((test) => (
          <Card
            key={test._id}
            className="rounded-3xl border border-slate-100 shadow-md hover:shadow-xl transition"
          >
            <CardContent className="p-6 flex flex-col h-full">

              {/* Title */}
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-slate-900">
                  {test.name}
                </h2>

                {test.visibility ? (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                    Visible
                  </span>
                ) : (
                  <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
                    Hidden
                  </span>
                )}
              </div>

              {/* Image */}
              {test.image && (
                <img
                  src={test.image}
                  alt={test.name}
                  className="h-40 w-full object-cover rounded-xl border"
                />
              )}

              {/* Info */}
              <div className="text-sm space-y-2 text-slate-700">

                <p><span className="font-medium">Description:</span> {test.description}</p>

                <p><span className="font-medium">Outcome:</span> {test.outcome}</p>

                <p><span className="font-medium">Type:</span> {test.type}</p>

                <p><span className="font-medium">Service No:</span> {test.serviceNo || "N/A"}</p>

                <p><span className="font-medium">Requirement:</span> {test.requirement}</p>

                <p><span className="font-medium">Price:</span> ₹{test.price}</p>

                <p><span className="font-medium">Discount:</span> {test.discount}%</p>

                <p>
                  <span className="font-medium">Test Duration:</span>{" "}
                  {test.duration_of_test?.value} {test.duration_of_test?.unit}
                </p>

                <p>
                  <span className="font-medium">Result Duration:</span>{" "}
                  {test.duration_of_result?.value} {test.duration_of_result?.unit}
                </p>

                <p>
                  <span className="font-medium">Visit Lab Required:</span>{" "}
                  {test.visitLab ? "Yes" : "No"}
                </p>

                {test.caution && (
                  <p className="text-amber-700">
                    <span className="font-medium">Caution:</span> {test.caution}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-4 mt-auto">

                <Button
                  variant="outline"
                  className="rounded-xl cursor-pointer"
                  onClick={() => console.log("Edit", test._id)}
                >
                  Edit
                </Button>

                <Button
                  variant="destructive"
                  className="rounded-xl cursor-pointer"
                  onClick={() => deleteTest(test._id)}
                >
                  Delete
                </Button>

                <Button
                  className="rounded-xl cursor-pointer col-span-2"
                  onClick={() => changeVisibility(test._id)}
                >
                  Toggle Visibility
                </Button>

              </div>

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ViewTests;