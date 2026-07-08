"use client";

import { useState, useEffect } from "react";
import { Product, Part, RequiredPart } from "@/lib/types";

interface EditProductModalProps {
  product: Product;
  parts: Part[];
  onClose: () => void;
  onSave: (product: Product) => void;
}

export default function EditProductModal({
  product,
  parts,
  onClose,
  onSave,
}: EditProductModalProps) {
  const [name, setName] = useState(product.name);
  const [quantity, setQuantity] = useState(product.quantity);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>(product.imageUrls || []);
  const [requiredParts, setRequiredParts] = useState<RequiredPart[]>(
    product.requiredParts || [],
  );

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
      ...product,
      name,
      quantity,
      imageUrls: [...imageUrls, ...newImageUrls],
      requiredParts,
    });
  };

  const handleRemoveImage = (url: string) => {
    setImageUrls(imageUrls.filter((u) => u !== url));
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

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
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
            multiple
            onChange={(e) =>
              e.target.files && setImageFiles(Array.from(e.target.files))
            }
            className="file-input file-input-bordered w-full"
          />
        </div>
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-2">Current Images</h3>
          <div className="grid grid-cols-3 gap-4">
            {imageUrls.length > 0 ?
              imageUrls.map((url, index) => (
                <div key={index} className="relative w-full h-24">
                  <img
                    src={url}
                    alt={`image ${index + 1}`}
                    className="w-350 h-300 "
                  />
                  <button
                    onClick={() => handleRemoveImage(url)}
                    className="absolute top-1 right-1 btn btn-xs btn-error">
                    X
                  </button>
                </div>
              ))
            : <div className="relative w-full h-24">
                <img
                  src={(product as any).imageUrl || "null"}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            }
          </div>
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
                  {groupedParts[category].map((p) => (
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
