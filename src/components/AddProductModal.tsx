"use client";

import { useState } from "react";
import { Product, Part, RequiredPart } from "@/lib/types";

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
      {} as Record<string, Part[]>,
    );

  const groupedRequiredParts = requiredParts.reduce(
    (acc, reqPart) => {
      const part = parts.find((p) => p.id === reqPart.partId);
      if (part) {
        const category = part.category || "Other";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(reqPart);
      }
      return acc;
    },
    {} as Record<string, RequiredPart[]>,
  );

  const sortedGroups = Object.keys(groupedParts).sort((a, b) =>
    a.localeCompare(b),
  );
  const sortedRequiredGroups = Object.keys(groupedRequiredParts).sort((a, b) =>
    a.localeCompare(b),
  );

  return (
    <div className="max-h-[90vh] overflow-y-auto">
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
          {/* <input
            type="file"
            multiple
            onChange={(e) =>
              e.target.files && setImageFiles(Array.from(e.target.files))
            }
            className="file-input file-input-bordered w-full"
          /> */}
        </div>
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-2">Inventory Parts</h3>
          <div className="space-y-2">
            {sortedGroups.length === 0 ?
              <div className="rounded-2xl border border-slate-200/10 bg-slate-100/80 p-4 text-sm text-slate-500">
                No inventory parts are available to add.
              </div>
            : sortedGroups.map((category) => (
                <div key={category}>
                  <h4 className="font-bold text-lg mt-2">{category}</h4>
                  {groupedParts[category].map((part, index) => (
                    <div
                      key={`${part.id}-${index}`}
                      className="flex items-center justify-between rounded-xl border border-slate-200/10 bg-slate-50 px-3 py-2">
                      <span>{part.name}</span>
                      <button
                        type="button"
                        onClick={() => addRequiredPart(part.id)}
                        className="btn btn-sm btn-primary">
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              ))
            }
          </div>
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-2">Required Parts</h3>
            <div className="space-y-2">
              {sortedRequiredGroups.length === 0 ?
                <div className=" border border-slate-200/10 bg-slate-100/80 p-4 text-sm text-slate-500">
                  No required parts selected yet.
                </div>
              : sortedRequiredGroups.map((category) => (
                  <div key={category}>
                    <h4 className="font-bold text-lg mt-2">{category}</h4>
                    {groupedRequiredParts[category].map((reqPart, index) => {
                      const part = parts.find((p) => p.id === reqPart.partId);
                      return (
                        <div
                          key={`${reqPart.partId}-${index}`}
                          className="flex items-center justify-between rounded-xl border border-slate-200/10 bg-slate-50 px-3 py-2">
                          <span>{part?.name}</span>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min={1}
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
                              type="button"
                              onClick={() => removeRequiredPart(reqPart.partId)}
                              className="btn btn-sm btn-error">
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              }
            </div>
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
