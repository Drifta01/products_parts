"use client";

import { useState } from "react";
import { Part } from "@/lib/types";

interface AddPartFormProps {
  allParts: Part[];
  onSave: (partId: number, quantity: number) => void;
  onCancel: () => void;
}

export default function AddPartForm({
  allParts,
  onSave,
  onCancel,
}: AddPartFormProps) {
  const [selectedPartId, setSelectedPartId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPartId) {
      onSave(parseInt(selectedPartId, 10), quantity);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-100 p-4 rounded-lg my-4">
      <h3 className="text-xl font-bold mb-4">Add New Part</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          value={selectedPartId}
          onChange={(e) => setSelectedPartId(e.target.value)}
          className="select select-bordered w-full">
          <option disabled value="">
            Select a part
          </option>
          {allParts.map((part) => (
            <option key={part.id} value={part.id}>
              {part.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
          placeholder="Quantity"
          className="input input-bordered w-full"
          min="1"
        />
        <div className="flex items-center space-x-2">
          <button
            type="submit"
            className="btn btn-primary text-blue-900 bg-slate-200 hover:bg-slate-400 px-3 rounded"
            disabled={!selectedPartId}>
            Save Part
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-primary text-blue-900 bg-slate-200 hover:bg-slate-400 px-3 rounded">
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
