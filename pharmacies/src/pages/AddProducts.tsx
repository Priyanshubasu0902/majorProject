import React, { useState } from "react";
import axios from "axios";
import {  usePharmacy } from "@/context/PharmacyContext";

const API = import.meta.env.VITE_BACKEND_URL;

const AddProduct = () => {
  const { pharmacyToken } = usePharmacy();
  
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [productNo, setProductNo] = useState("");
  const [quantityAmount, setQuantityAmount] = useState("");
  const [quantityUnit, setQuantityUnit] = useState("tablet");
  const [no_of_product, setNo_of_Product] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [visibility, setVisibility] = useState("true");
  const [prescription_required, setPrescription_required] = useState("false");
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("type", type);
      formData.append("productNo", productNo);

      formData.append(
        "quantity",
        JSON.stringify({
          amount: Number(quantityAmount),
          unit: quantityUnit,
        }),
      );

      formData.append("no_of_Product", no_of_product);
      formData.append("price", price);
      formData.append("discount", discount);
      formData.append("companyName", companyName);

      formData.append("visibility", visibility);
      formData.append("prescription_required", prescription_required);

      if (image) formData.append("image", image);

      const {data} = await axios.post(
        `${API}/api/pharmacy/addProduct`,
        formData,
        { headers: {
          Authorization: `Bearer ${pharmacyToken}`,
        } },
      );

      if (data.success) {
        console.log("Product added successfully!");
        setName("");
        setType("");
        setProductNo("");
        setQuantityAmount("");
        setQuantityUnit("");
        setNo_of_Product("");
        setPrice("");
        setDiscount("");
        setCompanyName("");
        setVisibility("");
        setPrescription_required("");
        setImage(null);
      } else {
        console.log(data.message);
      }
    } catch (err: any) {
      console.log(err.response?.data?.message || "Upload failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 flex justify-center">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-3xl p-10">
        {/* Header */}
        <h1 className="text-3xl font-semibold text-slate-800">Add Product</h1>
        <p className="text-slate-500 mt-1 mb-8">
          Enter product details carefully for accurate listing.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="label">Product Name</label>
            <input
              className="input border rounded-md"
              placeholder="Medicine Name"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </div>

          {/* Type */}
          <div>
            <label className="label">Product Type:</label>
            <input
              className="input border rounded-md"
              placeholder="Type (Tablet/Syrup)"
              onChange={(e) => setType(e.target.value)}
              value={type}
            />
          </div>

          {/* Product Number */}
          <div>
            <label className="label">Product Number:</label>
            <input
              className="input border rounded-md"
              placeholder="Product Number"
              onChange={(e) => setProductNo(e.target.value)}
              value={productNo}
            />
          </div>

          {/* Company */}
          <div>
            <label className="label">Company Name:</label>
            <input
              className="input border rounded-md"
              placeholder="Company Name"
              onChange={(e) => setCompanyName(e.target.value)}
              value={companyName}
            />
          </div>

          {/* Quantity */}
          <div className="md:col-span-2">
            <label className="label">Quantity:</label>

            <div className="flex gap-3">
              {/* Amount */}
              <input
                className="input border rounded-md flex-1"
                placeholder="Quantity Amount"
                onChange={(e) => setQuantityAmount(e.target.value)}
                value={quantityAmount}
              />

              {/* Unit */}
              <select
                className="input border rounded-md w-32"
                onChange={(e) => setQuantityUnit(e.target.value)}
              >
                <option value="tablet">Tablet</option>
                <option value="ml">ML</option>
                <option value="items">Items</option>
              </select>
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="label">No. of Products:</label>
            <input
              className="input border rounded-md"
              placeholder="Number of Products"
              onChange={(e) => setNo_of_Product(e.target.value)}
              value={no_of_product}
            />
          </div>

          {/* Price */}
          <div>
            <label className="label">Price ₹:</label>
            <input
              className="input border rounded-md"
              placeholder="Price"
              onChange={(e) => setPrice(e.target.value)}
              value={price}
            />
          </div>

          {/* Discount */}
          <div>
            <label className="label">Discount %:</label>
            <input
              className="input border rounded-md"
              placeholder="Discount %"
              onChange={(e) => setDiscount(e.target.value)}
              value={discount}
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="label">Visibility:</label>
            <select
              className="input border rounded-md"
              onChange={(e) => setVisibility(e.target.value)}
            >
              <option value="true">Visible</option>
              <option value="false">Hidden</option>
            </select>
          </div>

          {/* Prescription */}
          <div className="md:col-span-2">
            <label className="label">Prescription Required:</label>
            <select
              className="input border rounded-md"
              onChange={(e) => setPrescription_required(e.target.value)}
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>

          {/* Image */}
          <div className="md:col-span-2">
            <label className="label">Product Image:</label>
            <input
              type="file"
              className="file border rounded-md"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="mt-10 w-full rounded-full bg-emerald-600 text-white py-4 text-lg font-medium hover:bg-emerald-700 transition"
        >
          Add Product
        </button>
      </div>
    </div>
  );
};

export default AddProduct;
