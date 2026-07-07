"use client";

import { useState } from "react";
import { Part, Product, PartCategory } from "@/lib/types";

interface EditPartModalProps {
  part: Part;
  products: Product[];
  partCategories: PartCategory[];
  onClose: () => void;
  onSave: (part: Part) => void;
}

export default function EditPartModal({
  part,
  products,
  partCategories,
  onClose,
  onSave,
}: EditPartModalProps) {
  const [name, setName] = useState(part.name);
  const [quantity, setQuantity] = useState(part.quantity);
  const [category, setCategory] = useState<PartCategory>(
    part.category || "Other",
  );
  const [newCategory, setNewCategory] = useState("");
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

    const finalCategory = category === "new" ? newCategory : category;

    onSave({ ...part, name, quantity, category: finalCategory, imageUrl });
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center">
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
            {partCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            <option value="new">Add new category...</option>
          </select>
          {category === "new" && (
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New Category Name"
              className="input input-bordered w-full"
            />
          )}
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
