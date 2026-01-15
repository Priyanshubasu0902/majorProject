import React from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

const products = [
  {
    id: 1,
    name: "Paracetamol 650mg",
    quantity: "10 tablets / strip",
    prescription: false,
    description: "Used for fever and mild to moderate pain",
    benefits: "Relieves pain and reduces fever",
    cautions: "Do not exceed recommended dosage",
    allergies: "Avoid if allergic to acetaminophen",
  },
  {
    id: 2,
    name: "Amoxicillin 500mg",
    quantity: "15 capsules",
    prescription: true,
    description: "Antibiotic for bacterial infections",
    benefits: "Treats respiratory & urinary infections",
    cautions: "Complete full course",
    allergies: "Penicillin allergy",
  },
];

const ViewProducts = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 px-12 py-10">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-light text-slate-900">
          Your <span className="font-medium text-emerald-600">Products</span>
        </h1>
        <p className="mt-2 text-slate-600">
          View medicines currently available in your pharmacy
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {products.map((product) => (
          <Card
            key={product.id}
            className="rounded-3xl border border-slate-100 shadow-md hover:shadow-xl transition"
          >
            <CardContent className="p-6 space-y-4">
              
              {/* Title */}
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-slate-900">
                  {product.name}
                </h2>

                {product.prescription && (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
                    Prescription Required
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-500">
                Quantity: {product.quantity}
              </p>

              <div className="text-sm space-y-2 text-slate-700">
                <p>
                  <span className="font-medium">Description:</span>{" "}
                  {product.description}
                </p>
                <p>
                  <span className="font-medium">Benefits:</span>{" "}
                  {product.benefits}
                </p>
                <p className="text-amber-700">
                  <span className="font-medium">Caution:</span>{" "}
                  {product.cautions}
                </p>
                <p className="text-red-600">
                  <span className="font-medium">Allergy Info:</span>{" "}
                  {product.allergies}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="rounded-xl">
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  className="rounded-xl"
                >
                  Remove
                </Button>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ViewProducts;
