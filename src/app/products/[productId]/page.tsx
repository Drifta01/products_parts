"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Product, Part, RequiredPart } from "@/lib/types";
import AddPartForm from "@/components/AddPartForm";
import EditPartForm from "@/components/EditPartForm";
import DeletePartFromProductModal from "@/components/DeletePartFromProductModal";

export default function ProductPage() {
  const params = useParams();
  const productId = parseInt(params.productId as string, 10);
  const [product, setProduct] = useState<Product | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [allParts, setAllParts] = useState<Part[]>([]);
  const [isAddingPart, setIsAddingPart] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [deletingPart, setDeletingPart] = useState<Part | null>(null);

  useEffect(() => {
    if (!productId) return;

    const fetchData = async () => {
      const productRes = await fetch(`/api/products/${productId}`);
      const currentProduct: Product = await productRes.json();

      const allPartsRes = await fetch("/api/parts");
      const allPartsData: Part[] = await allPartsRes.json();
      setAllParts(allPartsData);

      if (currentProduct && currentProduct.requiredParts) {
        const requiredPartIds = new Set(
          currentProduct.requiredParts.map((rp) => rp.partId),
        );
        const productParts = allPartsData.filter((p) =>
          requiredPartIds.has(p.id),
        );

        setProduct(currentProduct);
        setParts(productParts);
      } else {
        setProduct(currentProduct || null);
        setParts([]);
      }
    };

    fetchData();
  }, [productId]);

  const updateProductParts = async (requiredParts: RequiredPart[]) => {
    if (!product) return;
    const updatedProduct = { ...product, requiredParts };
    const res = await fetch(`/api/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProduct),
    });
    const newProduct = await res.json();
    setProduct(newProduct);
    // Refresh parts list
    const requiredPartIds = new Set(
      newProduct.requiredParts.map((rp: RequiredPart) => rp.partId),
    );
    const productParts = allParts.filter((p) => requiredPartIds.has(p.id));
    setParts(productParts);
  };

  const handleAddPart = async (partId: number, quantity: number) => {
    if (!product) return;
    const newRequiredPart = { partId, quantity };
    const updatedRequiredParts = [
      ...(product.requiredParts || []),
      newRequiredPart,
    ];
    await updateProductParts(updatedRequiredParts);
    setIsAddingPart(false);
  };

  const handleEditPart = async (partId: number, quantity: number) => {
    if (!product) return;
    const updatedRequiredParts = (product.requiredParts || []).map((rp) =>
      rp.partId === partId ? { ...rp, quantity } : rp,
    );
    await updateProductParts(updatedRequiredParts);
    setEditingPart(null);
  };

  const handleDeletePart = async (partId: number) => {
    if (!product) return;
    const updatedRequiredParts = (product.requiredParts || []).filter(
      (rp) => rp.partId !== partId,
    );
    await updateProductParts(updatedRequiredParts);
    setDeletingPart(null);
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  const getRequiredPart = (partId: number) => {
    return product.requiredParts.find((rp) => rp.partId === partId);
  };

  const groupedParts = Object.entries(
    parts.reduce((acc: Record<string, Part[]>, part) => {
      const cat = part.category || "Uncategorized";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(part);
      return acc;
    }, {}),
  )
    .map(
      ([category, partsInCategory]) =>
        [
          category,
          [...partsInCategory].sort((a, b) => a.name.localeCompare(b.name)),
        ] as [string, Part[]],
    )
    .sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-800">
          {product.name}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {product.imageUrls && product.imageUrls.length > 0 ?
            product.imageUrls.map((url, index) => (
              <div key={index} className="relative w-full h-96">
                <Image
                  src={url}
                  alt={`${product.name} - image ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="rounded-lg shadow-2xl object-cover"
                />
              </div>
            ))
          : <div className="relative w-full h-96">
              <Image
                src={(product as any).imageUrl || "/placeholder.jpg"}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="rounded-lg shadow-2xl object-cover"
              />
            </div>
          }
        </div>
        <div className="bg-slate-900 p-8 shadow-2xl rounded-3xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-semibold text-white">
                Required Parts
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                All parts grouped by category for this product. Update
                quantities and stock directly from inventory.
              </p>
            </div>
            {!isAddingPart && (
              <button
                onClick={() => setIsAddingPart(true)}
                className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400">
                + Add Required Part
              </button>
            )}
          </div>

          {isAddingPart && (
            <AddPartForm
              allParts={allParts.filter(
                (p) => !parts.some((pp) => pp.id === p.id),
              )}
              onSave={handleAddPart}
              onCancel={() => setIsAddingPart(false)}
            />
          )}

          <div className="space-y-6">
            {parts.length === 0 ?
              <div className="rounded-3xl border border-slate-700 bg-slate-950/60 p-8 text-center text-slate-300">
                No required parts added yet.
              </div>
            : groupedParts.map(([category, partsInCategory]) => (
                <section
                  key={category}
                  className="rounded-3xl border border-slate-700 bg-slate-950/80 p-6 shadow-xl shadow-slate-950/20">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-2xl font-semibold text-white">
                        {category}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {partsInCategory.length} required part
                        {partsInCategory.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className="inline-flex rounded-full bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200">
                      {partsInCategory.length} items
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {partsInCategory.map((part) =>
                      editingPart && editingPart.id === part.id ?
                        <EditPartForm
                          key={part.id}
                          part={part}
                          requiredPart={getRequiredPart(part.id)!}
                          onSave={handleEditPart}
                          onCancel={() => setEditingPart(null)}
                        />
                      : <article
                          key={part.id}
                          className="rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-inner shadow-slate-950/20">
                          <div className="flex items-start gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-800 text-slate-300">
                              {part.imageUrl ?
                                <img
                                  src={part.imageUrl}
                                  alt={part.name}
                                  className="h-full w-full rounded-3xl object-cover"
                                />
                              : <span className="text-sm">No image</span>}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-lg font-semibold text-white">
                                {part.name}
                              </p>
                              <p className="text-sm text-slate-400 mt-1">
                                Quantity required:{" "}
                                <span className="font-semibold text-white">
                                  {getRequiredPart(part.id)?.quantity || 0}
                                </span>
                              </p>
                              <p className="text-sm text-slate-400">
                                Current stock:{" "}
                                <span className="font-semibold text-white">
                                  {part.quantity}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-3 items-center justify-between">
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                                part.quantity > 5 ?
                                  "bg-emerald-100 text-emerald-900"
                                : part.quantity > 0 ?
                                  "bg-amber-100 text-amber-900"
                                : "bg-rose-100 text-rose-900"
                              }`}>
                              {part.quantity > 5 ?
                                "Healthy stock"
                              : part.quantity > 0 ?
                                "Low stock"
                              : "Out of stock"}
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingPart(part)}
                                className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
                                Edit
                              </button>
                              <button
                                onClick={() => setDeletingPart(part)}
                                className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500">
                                Remove
                              </button>
                            </div>
                          </div>
                        </article>,
                    )}
                  </div>
                </section>
              ))
            }
          </div>
        </div>
      </div>

      {deletingPart && (
        <DeletePartFromProductModal
          part={deletingPart}
          onClose={() => setDeletingPart(null)}
          onConfirm={handleDeletePart}
        />
      )}
    </div>
  );
}
