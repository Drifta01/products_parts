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

  const preferredCategoryOrder = [
    "Bolts",
    "Washers",
    "Nuts",
    "Hardware Components",
    "Electrical Components",
  ];

  const partCategories = useMemo(() => {
    const categories = Array.from(
      new Set(parts.map((p) => p.category || "Other")),
    );
    return [...categories].sort((a, b) => {
      const aIndex = preferredCategoryOrder.indexOf(a);
      const bIndex = preferredCategoryOrder.indexOf(b);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.localeCompare(b);
    });
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

    Object.keys(grouped).forEach((cat) => {
      grouped[cat].sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  }, [parts]);

  useEffect(() => {
    console.log("Grouped parts updated:", groupedParts);
    for (const category in groupedParts) {
      const partIds = groupedParts[category].map((p) => p.id);
      const uniquePartIds = new Set(partIds);
      if (partIds.length !== uniquePartIds.size) {
        console.error(
          "Duplicate part IDs found in category:",
          category,
          partIds,
        );
      }
    }
  }, [groupedParts]);

  const sortedCategoryKeys = useMemo(() => {
    const keys = Object.keys(groupedParts);
    return keys.sort((a, b) => {
      const aIndex = preferredCategoryOrder.indexOf(a);
      const bIndex = preferredCategoryOrder.indexOf(b);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [groupedParts]);

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div className="w-full min-h-full -4xl border border-slate-800/80 bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/30 md:p-8 lg:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 -[28px] border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/30 md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Inventory
            </p>
            <h1 className="mt-2 text-4xl font-extrabold text-white">
              Inventory Management
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Organize your parts by category, keep stock levels accurate, and
              add inventory directly from the same interface.
            </p>
          </div>
          <button
            onClick={() => setIsAddPartFormVisible(!isAddPartFormVisible)}
            className="inline-flex items-center justify-center   bg-slate-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-400">
            {isAddPartFormVisible ? "Cancel" : "Add Part"}
          </button>
        </div>

        {isAddPartFormVisible && (
          <div className="-4xl bg-slate-950/95 p-8 shadow-2xl shadow-slate-950/40 mb-10 mt-8">
            <h2 className="text-2xl font-bold mb-6 text-white">Add New Part</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={newPartName}
                onChange={(e) => setNewPartName(e.target.value)}
                placeholder="Part Name"
                className="input input-bordered w-full bg-slate-900 border-slate-700 text-white placeholder-slate-400"
              />
              <input
                type="number"
                value={newPartQuantity}
                onChange={(e) =>
                  setNewPartQuantity(parseInt(e.target.value, 10) || 0)
                }
                placeholder="Quantity"
                className="input input-bordered w-full bg-slate-900 border-slate-700 text-white placeholder-slate-400"
              />
              <input
                type="file"
                onChange={(e) =>
                  e.target.files && setNewPartImageFile(e.target.files[0])
                }
                className="file-input file-input-bordered w-full bg-slate-900 border-slate-700 text-slate-400"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="select select-bordered w-full bg-slate-900 border-slate-700 text-white">
                <option value="" disabled className="text-slate-400">
                  Select a category
                </option>
                {partCategories.map((cat) => (
                  <option
                    key={cat}
                    value={cat}
                    className="text-white bg-slate-900">
                    {cat}
                  </option>
                ))}
                <option value="new" className="text-white bg-slate-900">
                  Add new category...
                </option>
              </select>
              {category === "new" && (
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="New Category Name"
                  className="input input-bordered w-full bg-slate-900 border-slate-700 text-white placeholder-slate-400"
                />
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setIsAddPartFormVisible(false)}
                className="btn bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                Cancel
              </button>
              <button
                onClick={handleAddPart}
                className="btn btn-primary bg-cyan-500 border-cyan-500 text-white hover:bg-cyan-400">
                Add Part
              </button>
            </div>
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-3xl text-white font-bold mb-6 text-center">
            Current Inventory
          </h2>

          <div className="space-y-6">
            {sortedCategoryKeys.map((category) => {
              const isOpen = openCategories[category] ?? true;
              const partsInCategory = groupedParts[category] ?? [];
              return (
                <section
                  key={category}
                  className="overflow-hidden -3xl border border-slate-800 bg-slate-900 shadow-xl shadow-slate-950/20">
                  <div className="flex flex-col gap-4 border-b border-slate-800 bg-slate-800/90 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-white text-2xl font-semibold ">
                        {category}
                      </h3>
                      <p className="mt-1 text-sm text-slate-200">
                        {partsInCategory.length} part
                        {partsInCategory.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex  bg-slate-700 px-3 py-1 text-lg  text-white ">
                        {partsInCategory.length > 0 ? "Active" : "Empty"}
                      </span>
                      <button
                        onClick={() => toggleCategory(category)}
                        className=" bg-slate-900 px-3 py-1 text-lg text-white transition hover:bg-slate-800">
                        {isOpen ? "Collapse" : "Expand"}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="divide-y divide-slate-800 px-4 py-1">
                      {partsInCategory.length === 0 ?
                        <div className="py-8 text-center text-slate-400 italic">
                          No parts in this category.
                        </div>
                      : partsInCategory.map((part) => (
                          <div
                            key={part.id}
                            className="flex flex-col gap-4 border-b border-slate-800 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                              <div className="h-16 w-16 overflow-hidden  bg-slate-800 flex items-center justify-center">
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
                                {part.partNumber && (
                                  <div className="text-sm text-slate-400 mt-1">
                                    Part #: {part.partNumber}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col items-start gap-3 sm:items-end">
                              <div className="text-right">
                                <div className="text-lg text-white">
                                  Qty: {part.quantity}
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-8 text-sm">
                                <span
                                  className={`inline-flex items-center justify-center w-28 px-4 py-1 ${
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
                                  className=" border border-slate-700 bg-slate-800 px-3 py-1 text-slate-200 hover:bg-slate-700">
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeletePart(part.id)}
                                  aria-label="Delete inventory part"
                                  className=" items-center justify-center px-3 bg-rose-600 text-slate-100 transition hover:bg-rose-500">
                                  <span className="text-sm font-semibold">
                                    Delete
                                  </span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </section>
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
    </div>
  );
}
