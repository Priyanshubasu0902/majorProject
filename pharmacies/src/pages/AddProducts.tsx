// src/pages/AddProducts.tsx
import React, { useState } from "react";
import axios from "axios";
import { usePharmacy } from "@/context/PharmacyContext";
import { toast } from "react-toastify";

const API = import.meta.env.VITE_BACKEND_URL;

const AddProduct = () => {
  const { pharmacyToken, fetchProducts } = usePharmacy();

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
        })
      );

      formData.append("no_of_Product", no_of_product);
      formData.append("price", price);
      formData.append("discount", discount);
      formData.append("companyName", companyName);
      formData.append("visibility", visibility);
      formData.append("prescription_required", prescription_required);

      if (image) formData.append("image", image);

      const { data } = await axios.post(
        `${API}/api/pharmacy/addProduct`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${pharmacyToken}`,
          },
        }
      );

      if (data.success) {
        toast.success("Product added successfully!"); // ✅ replaces alert()
        setName("");
        setType("");
        setProductNo("");
        setQuantityAmount("");
        setQuantityUnit("tablet");
        setNo_of_Product("");
        setPrice("");
        setDiscount("");
        setCompanyName("");
        setVisibility("true");
        setPrescription_required("false");
        setImage(null);
        fetchProducts();
      } else {
        toast.error(data.message || "Failed to add product."); // ✅ replaces alert(data.message)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Upload failed."); // ✅ replaces alert()
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-4xl bg-white shadow-xl rounded-3xl p-10"
      >
        <h1 className="text-3xl font-semibold text-slate-800">Add Product</h1>

        <div className="grid md:grid-cols-2 gap-6 mt-8">

          <Input label="Product Name" value={name} set={setName}/>
          <Input label="Type" value={type} set={setType}/>
          <Input label="Product Number" value={productNo} set={setProductNo}/>
          <Input label="Company Name" value={companyName} set={setCompanyName}/>

          {/* Quantity amount */}
          <Input label="Quantity Amount" value={quantityAmount} set={setQuantityAmount}/>

          {/* Quantity unit */}
          <Select label="Quantity Unit" value={quantityUnit} set={setQuantityUnit} options={["tablet","ml","items"]}/>

          <Input label="No. of Products" value={no_of_product} set={setNo_of_Product}/>
          <Input label="Price ₹" value={price} set={setPrice}/>
          <Input label="Discount %" value={discount} set={setDiscount}/>

          <Select label="Visibility" value={visibility} set={setVisibility} bool/>
          <Select label="Prescription Required" value={prescription_required} set={setPrescription_required} bool/>

          {/* file */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Image</label>
            <input
              type="file"
              className="mt-1 w-full border rounded-md p-2"
              onChange={(e)=> setImage(e.target.files?.[0] || null)}
            />
          </div>

        </div>

        <button className="mt-10 w-full rounded-full bg-emerald-600 text-white py-4 text-lg font-medium hover:bg-emerald-700 transition">
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProduct;


/* reusable components */

function Input({label,value,set}:{label:string,value:string,set:(v:string)=>void}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        className="mt-1 w-full border rounded-md p-2"
        value={value}
        onChange={(e)=>set(e.target.value)}
      />
    </div>
  );
}

function Select({
  label,
  value,
  set,
  bool=false,
  options=[]
}:{
  label:string,
  value:string,
  set:(v:string)=>void,
  bool?:boolean,
  options?:string[]
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <select
        className="mt-1 w-full border rounded-md p-2"
        value={value}
        onChange={(e)=>set(e.target.value)}
      >
        {bool ? (
          <>
            <option value="true">True</option>
            <option value="false">False</option>
          </>
        ) : (
          options.map(opt=>(
            <option key={opt} value={opt}>{opt}</option>
          ))
        )}
      </select>
    </div>
  );
}