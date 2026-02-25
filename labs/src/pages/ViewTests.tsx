import React, { useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useLab } from "@/context/LabContext";

const ViewTests = () => {
  const {
    tests,
    fetchTests,
    // deleteProduct,
    // toggleVisibility,
    // incrementStock,
    // decrementStock,
  } = useLab();

  useEffect(() => {
    fetchTests();
  }, []);

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
            <CardContent className="p-6 space-y-4">

              {/* Title */}
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-slate-900">
                  {test.name}
                </h2>

                {test.prescription_required && (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
                    Rx Required
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
                <p><span className="font-medium">Company:</span> {test.companyName}</p>
                <p><span className="font-medium">Type:</span> {test.type}</p>
                
                <p><span className="font-medium">No of Tests:</span> {test.no_of_Test}</p>
                <p><span className="font-medium">Price:</span> ₹{test.price}</p>
                <p><span className="font-medium">Discount:</span> {test.discount}%</p>

                <p>
                  <span className="font-medium">Visibility:</span>{" "}
                  {test.visibility ? (
                    <span className="text-emerald-600 font-medium">Visible</span>
                  ) : (
                    <span className="text-slate-400">Hidden</span>
                  )}
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-4">

                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => console.log("Edit", test._id)}
                >
                  Edit
                </Button>

                <Button
                  variant="destructive"
                  className="rounded-xl"
                  // onClick={() => deleteProduct(test._id)}
                >
                  Delete
                </Button>

                <Button
                  className="rounded-xl"
                  // onClick={() => toggleVisibility(test._id)}
                >
                  Toggle Visibility
                </Button>

                <div className="flex flex-wrap gap-2">
                  <Button
                    className="flex-1 rounded-xl"
                    // onClick={() => incrementStock(test._id)}
                  >
                    + Stock
                  </Button>

                  <Button
                    variant="secondary"
                    className="flex-1 rounded-xl"
                    // onClick={() => decrementStock(product._id)}
                  >
                    − Stock
                  </Button>
                </div>

              </div>

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ViewTests;