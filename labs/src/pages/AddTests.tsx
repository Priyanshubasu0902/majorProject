import React, { useState } from "react";
import axios from "axios";
import { useLab } from "@/context/LabContext";

const API = import.meta.env.VITE_BACKEND_URL;

const AddTest = () => {
  const { labToken, fetchTests } = useLab();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [outcome, setOutcome] = useState("");
  const [type, setType] = useState("");
  const [serviceNo, setServiceNo] = useState("");
  const [requirement, setRequirement] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [testDurationValue, setTestDurationValue] = useState("");
  const [testDurationUnit, setTestDurationUnit] = useState("hours");
  const [resultDurationValue, setResultDurationValue] = useState("");
  const [resultDurationUnit, setResultDurationUnit] = useState("hours");
  const [visitLab, setVisitLab] = useState("false");
  const [caution, setCaution] = useState("");
  const [visibility, setVisibility] = useState("true");
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("description", description);
      formData.append("outcome", outcome);
      formData.append("type", type);
      formData.append("serviceNo", serviceNo);
      formData.append("requirement", requirement);
      formData.append("price", price);
      formData.append("discount", discount);

      // nested objects
      formData.append("duration_of_test[value]", testDurationValue);
      formData.append("duration_of_test[unit]", testDurationUnit);

      formData.append("duration_of_result[value]", resultDurationValue);
      formData.append("duration_of_result[unit]", resultDurationUnit);

      formData.append("visitLab", visitLab);
      formData.append("caution", caution);
      formData.append("visibility", visibility);

      if (image) formData.append("image", image);

      const { data } = await axios.post(
        `${API}/api/lab/addTest`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${labToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        alert("Service Added Successfully");

        // reset form
        setName("");
        setDescription("");
        setOutcome("");
        setType("");
        setServiceNo("");
        setRequirement("");
        setPrice("");
        setDiscount("");
        setTestDurationValue("");
        setResultDurationValue("");
        setCaution("");
        setImage(null);
        fetchTests();
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Upload failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-4xl bg-white shadow-xl rounded-3xl p-10"
      >
        <h1 className="text-3xl font-semibold text-slate-800">Add Test</h1>

        <div className="grid md:grid-cols-2 gap-6 mt-8">

          <Input label="Name" value={name} set={setName}/>
          <Input label="Description" value={description} set={setDescription}/>
          <Input label="Outcome" value={outcome} set={setOutcome}/>
          <Input label="Type" value={type} set={setType}/>
          <Input label="Service No" value={serviceNo} set={setServiceNo}/>
          <Input label="Requirement" value={requirement} set={setRequirement}/>
          <Input label="Price ₹" value={price} set={setPrice}/>
          <Input label="Discount %" value={discount} set={setDiscount}/>

          {/* duration test */}
          <Input label="Test Duration Value" value={testDurationValue} set={setTestDurationValue}/>
          <Select label="Test Duration Unit" value={testDurationUnit} set={setTestDurationUnit}/>

          {/* duration result */}
          <Input label="Result Duration Value" value={resultDurationValue} set={setResultDurationValue}/>
          <Select label="Result Duration Unit" value={resultDurationUnit} set={setResultDurationUnit}/>

          {/* booleans */}
          <Select label="Visit Lab" value={visitLab} set={setVisitLab} bool/>
          <Select label="Visibility" value={visibility} set={setVisibility} bool/>

          <Input label="Caution" value={caution} set={setCaution}/>

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
          Add Service
        </button>
      </form>
    </div>
  );
};

export default AddTest;

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

function Select({label,value,set,bool=false}:{label:string,value:string,set:(v:string)=>void,bool?:boolean}) {
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
          <>
            <option value="hours">hours</option>
            <option value="minutes">minutes</option>
            <option value="seconds">seconds</option>
          </>
        )}
      </select>
    </div>
  );
}