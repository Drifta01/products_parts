"use client";

import { useState } from "react";
import { Product, Part, RequiredPart, PartCategory } from "@/lib/types";

interface AddProductModalProps {
  parts: Part[];
  onClose: () => void;
  onSave: (product: Omit<Product, "id">) => void;
}

export default function AddProductModal({
  parts,
  onClose,
  onSave,
}: AddProductModalProps) {
  const [name, setName] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [requiredParts, setRequiredParts] = useState<RequiredPart[]>([]);

  const handleSave = async () => {
    let newImageUrls: string[] = [];
    if (imageFiles.length > 0) {
      const uploadPromises = imageFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        return uploadRes.json();
      });

      const uploadResults = await Promise.all(uploadPromises);
      newImageUrls = uploadResults.map((res) => res.url);
    }

    onSave({
      name,
      imageUrls: newImageUrls,
      requiredParts,
      quantity: 0,
      inConstruction: 0,
    });
  };

  const handleRequiredPartChange = (partId: number, quantity: number) => {
    const updatedParts = requiredParts.map((p) =>
      p.partId === partId ? { ...p, quantity } : p,
    );
    setRequiredParts(updatedParts);
  };

  const addRequiredPart = (partId: number) => {
    if (!requiredParts.some((p) => p.partId === partId)) {
      setRequiredParts([...requiredParts, { partId, quantity: 1 }]);
    }
  };

  const removeRequiredPart = (partId: number) => {
    setRequiredParts(requiredParts.filter((p) => p.partId !== partId));
  };

  const groupedParts = parts
    .filter((p) => !requiredParts.some((rp) => rp.partId === p.id))
    .reduce(
      (acc, part) => {
        const category = part.category || "Other";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(part);
        return acc;
      },
      {} as Record<PartCategory, Part[]>,
    );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
        <div className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Product Name"
            className="input input-bordered w-full"
          />
          <input
            type="file"
            multiple
            onChange={(e) =>
              e.target.files && setImageFiles(Array.from(e.target.files))
            }
            className="file-input file-input-bordered w-full"
          />
        </div>
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-2">Required Parts</h3>
          <div className="space-y-2">
            {requiredParts.map((reqPart) => {
              const part = parts.find((p) => p.id === reqPart.partId);
              return (
                <div
                  key={reqPart.partId}
                  className="flex items-center justify-between">
                  <span>{part?.name}</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={reqPart.quantity}
                      onChange={(e) =>
                        handleRequiredPartChange(
                          reqPart.partId,
                          parseInt(e.target.value, 10) || 0,
                        )
                      }
                      className="input input-bordered w-20"
                    />
                    <button
                      onClick={() => removeRequiredPart(reqPart.partId)}
                      className="btn btn-sm btn-error">
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4">
            <select
              onChange={(e) => addRequiredPart(parseInt(e.target.value, 10))}
              className="select select-bordered w-full"
              defaultValue="">
              <option value="" disabled>
                Add a part
              </option>
              {Object.keys(groupedParts).map((category) => (
                <optgroup label={category} key={category}>
                  {groupedParts[category as PartCategory].map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
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
