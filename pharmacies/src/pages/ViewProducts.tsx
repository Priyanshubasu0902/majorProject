// src/pages/ViewProducts.tsx
import React, { useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { usePharmacy } from "@/context/PharmacyContext";

const ViewProducts = () => {
  const {
    products,
    deleteProduct,
    changeVisibility,
    incrementStock,
    decrementStock,
  } = usePharmacy();


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 px-12 py-10">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-light text-slate-900">
          Your <span className="font-medium text-emerald-600">Products</span>
        </h1>
        <p className="mt-2 text-slate-600">
          Manage medicines available in your pharmacy
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {products?.map((product) => (
          <Card
            key={product._id}
            className="rounded-3xl border border-slate-100 shadow-md hover:shadow-xl transition"
          >
            <CardContent className="p-6 flex flex-col h-full">

              {/* Title */}
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-slate-900">
                  {product.name}
                </h2>

                {product.visibility ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">Visible</span>
                  ) : (
                    <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-600">Hidden</span>
                  )}
              </div>

              {/* Image */}
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-40 w-full object-cover rounded-xl border"
                />
              )}

              {/* Info */}
              <div className="text-sm space-y-2 text-slate-700">
                <p><span className="font-medium">Company:</span> {product.companyName}</p>
                <p><span className="font-medium">Type:</span> {product.type}</p>
                <p>
                  <span className="font-medium">Quantity:</span>{" "}
                  {product.quantity.amount} {product.quantity.unit}
                </p>
                <p><span className="font-medium">Stock:</span> {product.no_of_Product}</p>
                <p><span className="font-medium">Price:</span> ₹{product.price}</p>
                <p><span className="font-medium">Discount:</span> {product.discount}%</p>

                <p>
                  <span className="font-medium">Prescription:</span>{" "}
                  {product.prescription_required ? (
                    <span className="text-emerald-600 font-medium">Required</span>
                  ) : (
                    <span className="text-slate-400">Not Required</span>
                  )}
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-4 mt-auto">

                <Button
                  variant="outline"
                  className="rounded-xl cursor-pointer"
                  onClick={() => console.log("Edit", product._id)}
                >
                  Edit
                </Button>

                <Button
                  variant="destructive"
                  className="rounded-xl cursor-pointer text-white bg-red-500"
                  onClick={() => deleteProduct(product._id)}
                >
                  Delete
                </Button>

                <Button
                  className="rounded-xl col-span-2 bg-black text-white cursor-pointer"
                  onClick={() => changeVisibility(product._id)}
                >
                  Toggle Visibility
                </Button>
                <div className="flex col-span-2 gap-2">
                  <Button
                    className="flex-1 rounded-xl bg-green-300 cursor-pointer"
                    onClick={() => incrementStock(product._id)}
                  >
                    + Stock
                  </Button>

                  <Button
                    variant="secondary"
                    className="flex-1 rounded-xl bg-red-300 cursor-pointer"
                    onClick={() => decrementStock(product._id)}
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

export default ViewProducts;