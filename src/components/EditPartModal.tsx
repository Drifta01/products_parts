"use client";

import { useState } from "react";
import { Part, Product, PartCategory } from "@/lib/types";

interface EditPartModalProps {
  part: Part;
  products: Product[];
  onClose: () => void;
  onSave: (part: Part) => void;
}

export default function EditPartModal({
  part,
  products,
  onClose,
  onSave,
}: EditPartModalProps) {
  const [name, setName] = useState(part.name);
  const [quantity, setQuantity] = useState(part.quantity);
  const [category, setCategory] = useState<PartCategory>(
    part.category || "Other",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSave = async () => {
    let imageUrl = part.imageUrl;
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await uploadRes.json();
      imageUrl = result.url;
    }
    onSave({ ...part, name, quantity, category, imageUrl });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Edit Part</h2>
        <div className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input input-bordered w-full"
          />
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
            className="input input-bordered w-full"
          />
          <input
            type="file"
            onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
            className="file-input file-input-bordered w-full"
          />
          {part.imageUrl && (
            <div className="w-max h-150">
              <img
                src={part.imageUrl}
                alt={part.name}
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          )}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as PartCategory)}
            className="select select-bordered w-full">
            <option value="Nuts & Bolts">Nuts & Bolts</option>
            <option value="Electrical Components">Electrical Components</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button onClick={onClose} className="btn">
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
