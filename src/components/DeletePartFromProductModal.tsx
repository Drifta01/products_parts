"use client";

import { Part } from "@/lib/types";

interface DeletePartFromProductModalProps {
  part: Part;
  onClose: () => void;
  onConfirm: (partId: number) => void;
}

export default function DeletePartFromProductModal({
  part,
  onClose,
  onConfirm,
}: DeletePartFromProductModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Delete Part</h2>
        <p>
          Are you sure you want to remove <strong>{part.name}</strong> from this
          product?
        </p>
        <div className="mt-6 flex justify-end space-x-4">
          <button onClick={onClose} className="btn">
            Cancel
          </button>
          <button onClick={() => onConfirm(part.id)} className="btn btn-error">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
