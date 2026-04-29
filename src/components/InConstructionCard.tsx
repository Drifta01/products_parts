"use client";

import { useState, useEffect } from "react";
import { Product, Part, RequiredPart } from "@/lib/types";

interface InConstructionCardProps {
  product: Product;
  parts: Part[];
  onUpdate: (product: Product) => void;
}

export default function InConstructionCard({
  product,
  parts,
  onUpdate,
}: InConstructionCardProps) {
  const [completion, setCompletion] = useState(
    product.completionPercentage || 0,
  );
  const [neededParts, setNeededParts] = useState<RequiredPart[]>(
    product.neededParts || [],
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      if (completion !== product.completionPercentage) {
        onUpdate({ ...product, completionPercentage: completion });
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [completion, product, onUpdate]);

  const addNeededPart = (partId: number) => {
    if (!neededParts.some((p) => p.partId === partId)) {
      const newNeededParts = [...neededParts, { partId, quantity: 1 }];
      setNeededParts(newNeededParts);
      onUpdate({ ...product, neededParts: newNeededParts });
    }
  };

  const removeNeededPart = (partId: number) => {
    const newNeededParts = neededParts.filter((p) => p.partId !== partId);
    setNeededParts(newNeededParts);
    onUpdate({ ...product, neededParts: newNeededParts });
  };

  const handleNeededPartQuantityChange = (partId: number, quantity: number) => {
    const newNeededParts = neededParts.map((p) =>
      p.partId === partId ? { ...p, quantity } : p,
    );
    setNeededParts(newNeededParts);
    onUpdate({ ...product, neededParts: newNeededParts });
  };

  const availableParts = parts.filter(
    (p) => !neededParts.some((np) => np.partId === p.id),
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center space-x-6">
        <div className="w-32 h-32 flex-shrink-0">
          <img
            src={product.imageUrls[0] || "/placeholder.png"}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <div className="flex-grow">
          <h3 className="text-2xl font-semibold">{product.name}</h3>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Completion: {completion}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={completion}
              onChange={(e) => setCompletion(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-xl font-semibold mb-2">Needed Parts</h4>
        <div className="space-y-2">
          {neededParts.map((neededPart) => {
            const part = parts.find((p) => p.id === neededPart.partId);
            const isOutOfStock =
              part ? part.quantity < neededPart.quantity : true;
            return (
              <div
                key={neededPart.partId}
                className="flex items-center justify-between">
                <span>{part?.name}</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={neededPart.quantity}
                    onChange={(e) =>
                      handleNeededPartQuantityChange(
                        neededPart.partId,
                        parseInt(e.target.value, 10) || 0,
                      )
                    }
                    className="input input-bordered w-20"
                  />
                  {isOutOfStock && (
                    <span className="text-red-500 font-bold">Purchase Now</span>
                  )}
                  <button
                    onClick={() => removeNeededPart(neededPart.partId)}
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
            onChange={(e) => addNeededPart(parseInt(e.target.value, 10))}
            className="select select-bordered w-full"
            defaultValue="">
            <option value="" disabled>
              Add a needed part
            </option>
            {availableParts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (In Stock: {p.quantity})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
