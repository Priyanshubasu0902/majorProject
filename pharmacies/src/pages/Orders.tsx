import React from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

const orders = [
  {
    id: "ORD-1023",
    customerName: "Aarav Sharma",
    phone: "+91 98765 43210",
    address: "Flat 402, Green Residency, BTM Layout, Bangalore",
    items: [
      { name: "Paracetamol 650mg", qty: "2 strips" },
      { name: "Vitamin C Tablets", qty: "1 bottle" },
    ],
    prescriptionProvided: false,
    status: "Delivered",
  },
  {
    id: "ORD-1045",
    customerName: "Neha Verma",
    phone: "+91 91234 56789",
    address: "House 18, Sector 22, Noida, Uttar Pradesh",
    items: [{ name: "Amoxicillin 500mg", qty: "1 strip" }],
    prescriptionProvided: true,
    status: "Processing",
  },
];

const Orders = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 px-12 py-10">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-light text-slate-900">
          Customer <span className="font-medium text-emerald-600">Orders</span>
        </h1>
        <p className="mt-2 text-slate-600">
          View and manage orders placed by customers
        </p>
      </div>

      {/* Orders List */}
      <div className="space-y-8">
        {orders.map((order) => (
          <Card
            key={order.id}
            className="rounded-3xl border border-slate-100 shadow-md hover:shadow-xl transition"
          >
            <CardContent className="p-8 space-y-6">
              
              {/* Order Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Order ID: {order.id}
                  </h2>
                  <p className="text-sm text-slate-500">
                    Customer: {order.customerName}
                  </p>
                </div>

                <span
                  className={`rounded-full px-4 py-1 text-xs font-medium ${
                    order.status === "Delivered"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              {/* Customer Details */}
              <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-700">
                <div>
                  <p className="font-medium text-slate-900 mb-1">
                    Contact Information
                  </p>
                  <p>📞 {order.phone}</p>
                  <p className="mt-1">📍 {order.address}</p>
                </div>

                <div>
                  <p className="font-medium text-slate-900 mb-1">
                    Prescription Status
                  </p>
                  {order.prescriptionProvided ? (
                    <span className="text-emerald-700 font-medium">
                      ✔ Prescription Uploaded
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">
                      ✖ Prescription Not Provided
                    </span>
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="font-medium text-slate-900 mb-2">
                  Ordered Medicines
                </p>
                <ul className="list-disc pl-6 text-sm text-slate-700 space-y-1">
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {item.name} — <span className="text-slate-500">{item.qty}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button variant="outline" className="rounded-xl">
                  View Details
                </Button>

                {order.status !== "Delivered" && (
                  <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                    Mark as Delivered
                  </Button>
                )}
              </div>

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Orders;
