"use client";

import { useState } from "react";
import { Part, RequiredPart } from "@/lib/types";

interface EditPartInProductModalProps {
  part: Part;
  requiredPart: RequiredPart;
  onClose: () => void;
  onSave: (partId: number, quantity: number) => void;
}

export default function EditPartInProductModal({
  part,
  requiredPart,
  onClose,
  onSave,
}: EditPartInProductModalProps) {
  const [quantity, setQuantity] = useState(requiredPart.quantity);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8  shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Edit Part Quantity</h2>
        <p className="mb-4">
          Editing quantity for: <strong>{part.name}</strong>
        </p>
        <div className="space-y-4">
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
            placeholder="Quantity"
            className="input input-bordered w-full"
            min="1"
          />
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button onClick={onClose} className="btn">
            Cancel
          </button>
          <button
            onClick={() => onSave(part.id, quantity)}
            className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
