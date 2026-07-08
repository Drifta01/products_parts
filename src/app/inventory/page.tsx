"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Part } from "@/lib/types";
import EditPartModal from "@/components/EditPartModal";

export default function InventoryPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [isAddPartFormVisible, setIsAddPartFormVisible] = useState(false);
  const [newPartName, setNewPartName] = useState("");
  const [newPartQuantity, setNewPartQuantity] = useState(0);
  const [category, setCategory] = useState<string>("");
  const [newCategory, setNewCategory] = useState("");
  const [newPartImageFile, setNewPartImageFile] = useState<File | null>(null);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    const fetchParts = async () => {
      const partsRes = await fetch("/api/parts");
      const partsData = await partsRes.json();
      setParts(partsData);
    };

    fetchParts();
  }, []);

  const partCategories = useMemo(() => {
    const categories = Array.from(
      new Set(parts.map((p) => p.category || "Other")),
    );
    return categories.sort((a, b) => a.localeCompare(b));
  }, [parts]);

  const handleAddPart = async () => {
    if (!newPartName.trim() || newPartQuantity <= 0) return;

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
    const existingPart = parts.find(
      (p) => p.name.trim().toLowerCase() === newPartName.trim().toLowerCase(),
    );

    if (existingPart) {
      const updatedPart = {
        ...existingPart,
        quantity: existingPart.quantity + newPartQuantity,
        inStock: existingPart.quantity + newPartQuantity > 0,
        category: finalCategory || existingPart.category || "Other",
        imageUrl: existingPart.imageUrl || imageUrl,
      };

      const res = await fetch(`/api/parts/${existingPart.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPart),
      });

      const updated = await res.json();
      setParts(parts.map((p) => (p.id === updated.id ? updated : p)));
    } else {
      const res = await fetch("/api/parts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newPartName,
          quantity: newPartQuantity,
          inStock: newPartQuantity > 0,
          category: finalCategory || "Other",
          imageUrl,
        }),
      });

      const addedPart = await res.json();
      setParts([...parts, addedPart]);
    }

    setIsAddPartFormVisible(false);
    setNewPartName("");
    setNewPartQuantity(0);
    setCategory("");
    setNewCategory("");
    setNewPartImageFile(null);
  };

  const handleDeletePart = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this inventory part? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

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

  const groupedParts = useMemo(() => {
    const grouped = parts.reduce(
      (acc, part) => {
        const category = part.category || "Other";
        if (!acc[category]) acc[category] = [];
        acc[category].push(part);
        return acc;
      },
      {} as Record<string, Part[]>,
    );

    // Sort parts by name within each category
    Object.keys(grouped).forEach((cat) => {
      grouped[cat].sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  }, [parts]);

  const sortedCategoryKeys = useMemo(
    () => Object.keys(groupedParts).sort((a, b) => a.localeCompare(b)),
    [groupedParts],
  );

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="rounded-[32px] bg-slate-950/95 p-8 shadow-2xl shadow-slate-950/40">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-white">
              Inventory Management
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl">
              Organize your parts by category, keep stock levels accurate, and
              add inventory directly from the same interface.
            </p>
          </div>
          <button
            onClick={() => setIsAddPartFormVisible(!isAddPartFormVisible)}
            className="btn btn-primary rounded-full bg-cyan-500 px-6 py-3 text-white hover:bg-cyan-400 transition">
            {isAddPartFormVisible ? "Cancel" : "Add Part"}
          </button>
        </div>
      </div>

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
        <h2 className="text-3xl text-white font-bold mb-6 text-center">
          Current Inventory
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedCategoryKeys.map((category) => {
            const isOpen = openCategories[category] ?? true;
            const partsInCategory = groupedParts[category] ?? [];
            return (
              <div
                key={category}
                className="overflow-hidden rounded-[28px] border border-slate-800 bg-slate-900 shadow-xl shadow-slate-950/20">
                <div className="flex items-center justify-between gap-4 bg-slate-800 px-5 py-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {category}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {partsInCategory.length} part
                      {partsInCategory.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex rounded-full bg-slate-700 px-3 py-1 text-sm text-slate-200">
                      {partsInCategory.length > 0 ? "Active" : "Empty"}
                    </span>
                    <button
                      onClick={() => toggleCategory(category)}
                      className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800">
                      {isOpen ? "Collapse" : "Expand"}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="divide-y divide-slate-800 px-5 py-4">
                    {partsInCategory.length === 0 ?
                      <div className="py-8 text-center text-slate-400 italic">
                        No parts in this category.
                      </div>
                    : partsInCategory.map((part) => (
                        <div
                          key={part.id}
                          className="flex flex-col gap-4 border-b border-slate-800 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 overflow-hidden rounded-3xl bg-slate-800 flex items-center justify-center">
                              {part.imageUrl ?
                                <img
                                  src={part.imageUrl}
                                  alt={part.name}
                                  className="h-full w-full object-cover"
                                />
                              : <span className="text-xs text-slate-500">
                                  No image
                                </span>
                              }
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-white">
                                {part.name}
                              </div>
                              <div className="text-sm text-slate-500">
                                ID: {part.id}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-start gap-3 sm:items-end">
                            <div className="text-right">
                              <div className="text-xl font-semibold text-white">
                                {part.quantity}
                              </div>
                              <div className="text-sm text-slate-400">Qty</div>
                            </div>
                            <div className="flex flex-wrap gap-2 text-sm">
                              <span
                                className={`inline-flex items-center rounded-full px-3 py-1 ${
                                  part.quantity > 5 ?
                                    "bg-emerald-100 text-emerald-900"
                                  : part.quantity > 0 ?
                                    "bg-amber-100 text-amber-900"
                                  : "bg-rose-100 text-rose-900"
                                }`}>
                                {part.quantity > 5 ?
                                  "In stock"
                                : part.quantity > 0 ?
                                  "Low stock"
                                : "Out of stock"}
                              </span>
                              <button
                                onClick={() => setEditingPart(part)}
                                className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-slate-200 hover:bg-slate-700">
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeletePart(part.id)}
                                aria-label="Delete inventory part"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-rose-600 text-slate-100 transition hover:bg-rose-500">
                                <span className="text-sm font-semibold">×</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            );
          })}
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
