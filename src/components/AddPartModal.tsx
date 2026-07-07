"use client";

import { useState } from "react";
import { Product, Part, PartCategory } from "@/lib/types";

interface AddPartModalProps {
  products: Product[];
  onClose: () => void;
  onSave: (part: Omit<Part, "id">) => void;
}

export default function AddPartModal({
  products,
  onClose,
  onSave,
}: AddPartModalProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [category, setCategory] = useState<PartCategory>("Other");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<
    number | undefined
  >(undefined);

  const handleSave = async () => {
    let imageUrl: string | undefined = undefined;
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
    onSave({ name, quantity, inStock: true, category, imageUrl });
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Add New Part</h2>
        <div className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Part Name"
            className="input input-bordered w-full"
          />
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
            placeholder="Quantity"
            className="input input-bordered w-full"
          />
          <input
            type="file"
            onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
            className="file-input file-input-bordered w-full"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as PartCategory)}
            className="select select-bordered w-full">
            <option value="Nuts & Bolts">Nuts & Bolts</option>
            <option value="Electrical Components">Electrical Components</option>
            <option value="Other">Other</option>
          </select>
          <select
            value={selectedProductId || ""}
            onChange={(e) =>
              setSelectedProductId(
                e.target.value ? parseInt(e.target.value, 10) : undefined,
              )
            }
            className="select select-bordered w-full">
            <option value="">No Associated Product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button onClick={onClose} className="btn">
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            Add Part
          </button>
        </div>
      </div>
    </div>
  );
}
