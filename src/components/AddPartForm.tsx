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
  const [category, setCategory] = useState("");
  const [selectedPartId, setSelectedPartId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPartId) {
      onSave(parseInt(selectedPartId, 10), quantity);
    }
  };

  const uniqueCategories = Array.from(
    new Set(allParts.map((part) => part.category)),
  );

  return (
    <form onSubmit={handleSubmit} className="bg-gray-100 p-4-lg my-2">
      <h3 className="text-xl font-bold mb-4">Add Part</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="select select-bordered w-full">
          <option disabled value="">
            Select a category
          </option>
          {uniqueCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          value={selectedPartId}
          onChange={(e) => setSelectedPartId(e.target.value)}
          className="select select-bordered w-full">
          <option disabled value="">
            Select a part
          </option>
          {allParts
            .filter((part) => part.category === category)
            .map((part) => (
              <option key={part.id} value={part.id}>
                {part.name}
              </option>
            ))}
        </select>

        <label>
          Quantity:
          <br />
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
            placeholder="Quantity"
            className="input input-bordered w-1/2"
            min="1"
          />
        </label>
        <div className="flex items-center space-x-2">
          <button
            type="submit"
            className="btn btn-primary text-blue-900 bg-slate-200 hover:bg-slate-400 px-3"
            disabled={!selectedPartId}>
            Add Part
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-primary text-blue-900 bg-slate-200 hover:bg-slate-400 px-3">
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
