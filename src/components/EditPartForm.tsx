"use client";

import { useState } from "react";
import { Part, RequiredPart } from "@/lib/types";

interface EditPartFormProps {
  part: Part;
  requiredPart: RequiredPart;
  onSave: (partId: number, quantity: number) => void;
  onCancel: () => void;
}

export default function EditPartForm({
  part,
  requiredPart,
  onSave,
  onCancel,
}: EditPartFormProps) {
  const [quantity, setQuantity] = useState(requiredPart.quantity);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(part.id, quantity);
  };

  return (
    <li className="bg-gray-100 p-4 rounded-lg my-2">
      <h3 className="text-red-600 text-lg font-bold mb-2">
        Editing:<span className="m-6">{part.name}</span>
      </h3>
      <form onSubmit={handleSubmit} className="flex items-center space-x-4">
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
          placeholder="Quantity"
          className="input input-bordered w-full max-w-xs"
          min="1"
        />
        <button
          type="submit"
          className="btn btn-primary text-blue-600 bg-slate-400 hover:bg-slate-300 px-3 rounded">
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn  text-blue-600 bg-slate-400 hover:bg-slate-300 px-3 rounded">
          Cancel
        </button>
      </form>
    </li>
  );
}
