import React, { useState } from "react";

const AddProduct = () => {
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    dosage: "",
    strength: "",
    quantity: "",
    price: "",
    prescriptionRequired: "yes",
    cautions: "",
    allergies: "",
    usage: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log("Product Submitted:", form);
    alert("Product added successfully!");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-10 py-8">
      <h1 className="text-3xl font-light text-slate-900">
        Add Medicine / Product
      </h1>
      <p className="mt-2 text-slate-600 max-w-2xl">
        Add medicines available in your pharmacy. Clearly specify prescription
        requirements, dosage, and safety information.
      </p>

      <div className="mt-8 bg-white rounded-3xl shadow-lg p-8 max-w-4xl">
        {/* Product Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700">
            Medicine Name
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="input"
            placeholder="e.g. Paracetamol"
          />
        </div>

        {/* Category */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700">
            Category
          </label>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            className="input"
            placeholder="Tablet / Syrup / Injection"
          />
        </div>

        {/* Dosage & Strength */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Dosage
            </label>
            <input
              name="dosage"
              value={form.dosage}
              onChange={handleChange}
              className="input"
              placeholder="e.g. 1 tablet twice a day"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Strength
            </label>
            <input
              name="strength"
              value={form.strength}
              onChange={handleChange}
              className="input"
              placeholder="e.g. 500 mg"
            />
          </div>
        </div>

        {/* Quantity & Price */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Quantity Available
            </label>
            <input
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              className="input"
              placeholder="e.g. 100 strips"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Price (₹)
            </label>
            <input
              name="price"
              value={form.price}
              onChange={handleChange}
              className="input"
              placeholder="e.g. 35"
            />
          </div>
        </div>

        {/* Prescription Required */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700">
            Prescription Required?
          
          <select
            name="prescriptionRequired"
            value={form.prescriptionRequired}
            onChange={handleChange}
            className="input"
          >
            <option value="yes">Yes (Doctor Prescription Required)</option>
            <option value="no">No (OTC Medicine)</option>
                      </select>
                      </label>

          {form.prescriptionRequired === "yes" && (
            <p className="mt-2 text-sm text-red-600">
              ⚠ This medicine cannot be purchased without a valid prescription.
            </p>
          )}
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700">
            Product Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="textarea"
            placeholder="Short description of the medicine"
          />
        </div>

        {/* Usage */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700">
            Usage Instructions
          </label>
          <textarea
            name="usage"
            value={form.usage}
            onChange={handleChange}
            rows={3}
            className="textarea"
            placeholder="How and when should this medicine be used"
          />
        </div>

        {/* Cautions */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700">
            Cautions / Warnings
          </label>
          <textarea
            name="cautions"
            value={form.cautions}
            onChange={handleChange}
            rows={3}
            className="textarea"
            placeholder="e.g. Not for children below 12 years"
          />
        </div>

        {/* Allergies */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-700">
            Allergy Information
          </label>
          <textarea
            name="allergies"
            value={form.allergies}
            onChange={handleChange}
            rows={2}
            className="textarea"
            placeholder="Who should avoid this medicine?"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full rounded-full bg-emerald-600 text-white py-4 text-lg font-medium hover:bg-emerald-700 transition"
        >
          Add Product
        </button>
      </div>
    </div>
  );
};

export default AddProduct;
