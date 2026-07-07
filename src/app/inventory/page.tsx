"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Part, PartCategory } from "@/lib/types";
import EditPartModal from "@/components/EditPartModal";

export default function InventoryPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [isAddPartFormVisible, setIsAddPartFormVisible] = useState(false);
  const [newPartName, setNewPartName] = useState("");
  const [newPartQuantity, setNewPartQuantity] = useState(0);
  const [category, setCategory] = useState<PartCategory>("");
  const [newCategory, setNewCategory] = useState("");
  const [newPartImageFile, setNewPartImageFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchParts = async () => {
      const partsRes = await fetch("/api/parts");
      const partsData = await partsRes.json();
      setParts(partsData);
    };

    fetchParts();
  }, []);

  const partCategories = useMemo(() => {
    const categories = new Set(parts.map((p) => p.category));
    return Array.from(categories);
  }, [parts]);

  const handleAddPart = async () => {
    let imageUrl: string | undefined = undefined;
    if (newPartImageFile) {
      const formData = new FormData();
      formData.append("file", newPartImageFile);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await uploadRes.json();
      imageUrl = result.url;
    }

    const finalCategory = category === "new" ? newCategory : category;

    const res = await fetch("/api/parts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newPartName,
        quantity: newPartQuantity,
        inStock: true,
        category: finalCategory,
        imageUrl,
      }),
    });

    const addedPart = await res.json();
    setParts([...parts, addedPart]);
    setIsAddPartFormVisible(false);
    setNewPartName("");
    setNewPartQuantity(0);
    setCategory("");
    setNewCategory("");
    setNewPartImageFile(null);
  };

  const handleDeletePart = async (id: number) => {
    await fetch(`/api/parts/${id}`, {
      method: "DELETE",
    });
    setParts(parts.filter((p) => p.id !== id));
  };

  const handleUpdatePart = async (part: Part) => {
    const res = await fetch(`/api/parts/${part.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(part),
    });
    const updatedPart = await res.json();
    setParts(parts.map((p) => (p.id === updatedPart.id ? updatedPart : p)));
    setEditingPart(null);
  };

  const groupedParts = parts.reduce(
    (acc, part) => {
      const category = part.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(part);
      return acc;
    },
    {} as Record<string, Part[]>,
  );

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold text-center my-10">Inventory</h1>

      <div className="text-center mb-10"></div>
      <button
        onClick={() => setIsAddPartFormVisible(!isAddPartFormVisible)}
        className="btn btn-primary w-30 btn btn-primary text-blue-600 bg-slate-400 hover:bg-slate-300 px-3 rounded ">
        {isAddPartFormVisible ? "Cancel" : "Add Part"}
      </button>

      {isAddPartFormVisible && (
        <div className="bg-white p-8 rounded-lg shadow-lg mb-10">
          <h2 className="text-2xl font-bold mb-4">Add New Part</h2>
          <div className="space-y-4">
            <input
              type="text"
              value={newPartName}
              onChange={(e) => setNewPartName(e.target.value)}
              placeholder="Part Name"
              className="input input-bordered w-full"
            />
            <input
              type="number"
              value={newPartQuantity}
              onChange={(e) =>
                setNewPartQuantity(parseInt(e.target.value, 10) || 0)
              }
              placeholder="Quantity"
              className="input input-bordered w-full"
            />
            <input
              type="file"
              onChange={(e) =>
                e.target.files && setNewPartImageFile(e.target.files[0])
              }
              className="file-input file-input-bordered w-full"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="select select-bordered w-full">
              <option value="" disabled>
                Select a category
              </option>
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
            <button
              onClick={() => setIsAddPartFormVisible(false)}
              className="btn">
              Cancel
            </button>
            <button onClick={handleAddPart} className="btn btn-primary">
              Add Part
            </button>
          </div>
        </div>
      )}

      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Current Inventory
        </h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-base-200">
                  <th className="p-4">Part Name</th>
                  <th className="p-4">Image</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(groupedParts).map((category) => (
                  <React.Fragment key={category}>
                    <tr className="bg-base-300">
                      <td colSpan={5} className="font-bold text-lg p-4">
                        {category}
                      </td>
                    </tr>
                    {groupedParts[category].length === 0 ?
                      <tr>
                        <td colSpan={5} className="text-center italic p-4">
                          No parts in this category.
                        </td>
                      </tr>
                    : groupedParts[category].map((part) => (
                        <tr key={part.id} className="hover">
                          <td className="align-middle p-4">{part.name}</td>
                          <td className="align-middle p-4">
                            {part.imageUrl && (
                              <img
                                src={part.imageUrl}
                                alt={part.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                          </td>
                          <td className="align-middle p-4">{part.quantity}</td>
                          <td className="align-middle p-4">
                            {part.quantity <= 10 ?
                              <span className="badge badge-warning badge-sm">
                                Low Stock
                              </span>
                            : <span className="badge badge-success badge-sm">
                                In Stock
                              </span>
                            }
                          </td>
                          <td className="space-x-4 align-middle p-4">
                            <button
                              onClick={() => setEditingPart(part)}
                              className="btn btn-sm btn-outline btn-info">
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePart(part.id);
                              }}
                              className="btn btn-sm btn-outline btn-error">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    }
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingPart && (
        <EditPartModal
          part={editingPart}
          products={[]}
          partCategories={partCategories}
          onClose={() => setEditingPart(null)}
          onSave={handleUpdatePart}
        />
      )}
    </div>
  );
}
