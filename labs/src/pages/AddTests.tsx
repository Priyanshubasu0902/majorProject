import React, { useState } from "react";
import axios from "axios";
import { useLab } from "@/context/LabContext";

const API = import.meta.env.VITE_BACKEND_URL;

const AddProduct = () => {
  const { labToken } = useLab();
  
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [TestNo, setTestNo] = useState("");
  const [no_of_Test, setNo_of_Test] = useState("");
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
      formData.append("TestNo", TestNo);


      formData.append("no_of_Test", no_of_Test);
      formData.append("price", price);
      formData.append("discount", discount);
      formData.append("companyName", companyName);

      formData.append("visibility", visibility);
      formData.append("prescription_required", prescription_required);

      if (image) formData.append("image", image);

      const {data} = await axios.post(
        `${API}/api/lab/addTest`,
        formData,
        { headers: {
          Authorization: `Bearer ${labToken}`,
        } },
      );

      if (data.success) {
        console.log("Product added successfully!");
        setName("");
        setType("");
        setTestNo("");
        setNo_of_Test("");
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
        <h1 className="text-3xl font-semibold text-slate-800">Add Test</h1>
        <p className="text-slate-500 mt-1 mb-8">
          Enter test details carefully for accurate listing.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="label">Test Name</label>
            <input
              className="input border rounded-md"
              placeholder="Test Name"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </div>

          {/* Type */}
          <div>
            <label className="label">Test Type:</label>
            <input
              className="input border rounded-md"
              placeholder="Type (before having food/after having food)"
              onChange={(e) => setType(e.target.value)}
              value={type}
            />
          </div>

          {/* Test Number */}
          <div>
            <label className="label">Test Number:</label>
            <input
              className="input border rounded-md"
              placeholder="Test Number"
              onChange={(e) => setTestNo(e.target.value)}
              value={no_of_Test}
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
1

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
