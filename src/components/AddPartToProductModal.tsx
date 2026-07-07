"use client";

import { useState, useEffect } from "react";
import { Part } from "@/lib/types";

interface AddPartToProductModalProps {
  allParts: Part[];
  onClose: () => void;
  onSave: (partId: number, quantity: number) => void;
}

export default function AddPartToProductModal({
  allParts,
  onClose,
  onSave,
}: AddPartToProductModalProps) {
  const [selectedPartId, setSelectedPartId] = useState("");
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Add Part to Product</h2>
        <div className="space-y-4">
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
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button onClick={onClose} className="btn">
            Cancel
          </button>
          <button
            onClick={() => {
              if (selectedPartId) {
                onSave(parseInt(selectedPartId, 10), quantity);
              }
            }}
            className="btn btn-primary"
            disabled={!selectedPartId}>
            Add Part
          </button>
        </div>
      </div>
    </div>
  );
}
