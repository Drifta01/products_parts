"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Product, Part, RequiredPart } from "@/lib/types";
import AddPartForm from "@/components/AddPartForm";
import EditPartForm from "@/components/EditPartForm";
import DeletePartFromProductModal from "@/components/DeletePartFromProductModal";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = parseInt(params.productId as string, 10);
  const [product, setProduct] = useState<Product | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [allParts, setAllParts] = useState<Part[]>([]);
  const [isAddingPart, setIsAddingPart] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [deletingPart, setDeletingPart] = useState<Part | null>(null);
  const [buildProduct, setBuildProduct] = useState<Product | null>(null);
  const [showImages, setShowImages] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [buildSummary, setBuildSummary] = useState<
    Array<{
      partId: number;
      partName: string;
      requiredQuantity: number;
      currentStock: number;
      remaining: number;
      reorder: boolean;
    }>
  >([]);
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
  const handleBuildProduct = async () => {
    if (!product) return;

    const summary = (product.requiredParts || []).map((requiredPart) => {
      const part = allParts.find((item) => item.id === requiredPart.partId);
      const currentStock = part?.quantity ?? 0;
      const remaining = currentStock - requiredPart.quantity;

      return {
        partId: requiredPart.partId,
        partName: part?.name ?? "Unknown part",
        requiredQuantity: requiredPart.quantity,
        currentStock,
        remaining,
        reorder: remaining <= 0,
      };
    });

    setBuildSummary(summary);

    const summaryPayload = {
      productName: product.name,
      items: summary,
    };

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        "buildProductSummary",
        JSON.stringify(summaryPayload),
      );
    }

    const updatedProduct = {
      ...product,
      inConstruction: (product.inConstruction || 0) + 1,
      completionPercentage: 0,
      buildProduct: true,
    };

    const res = await fetch(`/api/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProduct),
    });

    if (res.ok) {
      const nextProduct = await res.json();
      setProduct(nextProduct);
      router.push("/in-construction");
    }
  };
  const handleDeletePart = async (partId: number) => {
    if (!product) return;
    const updatedRequiredParts = (product.requiredParts || []).filter(
      (rp) => rp.partId !== partId,
    );
    await updateProductParts(updatedRequiredParts);
    setDeletingPart(null);
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !product) return;

    setIsUploadingImage(true);

    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const uploadData = await uploadRes.json();

    if (uploadData.success) {
      const updatedProduct = {
        ...product,
        imageUrls: [...(product.imageUrls || []), uploadData.url],
      };

      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      });

      if (res.ok) {
        const nextProduct = await res.json();
        setProduct(nextProduct);
      }
    }

    setIsUploadingImage(false);
    event.target.value = "";
  };

  const handleRemoveImage = async (imageUrlToRemove: string) => {
    if (!product) return;

    const nextImageUrls = (product.imageUrls || []).filter(
      (url) => url !== imageUrlToRemove,
    );

    const updatedProduct = {
      ...product,
      imageUrls: nextImageUrls,
    };

    const res = await fetch(`/api/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProduct),
    });

    if (res.ok) {
      const nextProduct = await res.json();
      setProduct(nextProduct);
      setSelectedImageIndex(null);
      setZoomLevel(1);
    }
  };

  const openImageViewer = (index: number) => {
    setSelectedImageIndex(index);
    setZoomLevel(1);
  };

  const closeImageViewer = () => {
    setSelectedImageIndex(null);
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
    setIsDragging(false);
  };

  const handleViewerMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    setDragStart({ x: event.clientX - panX, y: event.clientY - panY });
  };

  const handleViewerMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || zoomLevel <= 1) return;
    setPanX(event.clientX - dragStart.x);
    setPanY(event.clientY - dragStart.y);
  };

  const handleViewerMouseUp = () => {
    setIsDragging(false);
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  const getRequiredPart = (partId: number): RequiredPart | undefined => {
    return product.requiredParts.find(
      (rp: RequiredPart) => rp.partId === partId,
    );
  };

  const groupedParts: [string, Part[]][] = Object.entries(
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
    <div className="container mx-auto px-4 py-8 mb-10  bg-slate-950/95 p-14 shadow-2xl shadow-slate-950/40">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-white">
          Model
          <hr className="border " />
        </h1>
        <h1 className="text-4xl font-extrabold text-center mb-8 text-white">
          {product.name}
        </h1>
        <div className="flex justify-center mb-8">
          <button
            onClick={handleBuildProduct}
            className="inline-flex items-center gap-2 bg-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-500">
            Build Product
          </button>
        </div>
        <div className="mb-8 flex justify-center">
          <button
            onClick={() => setShowImages((current) => !current)}
            className=" border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
            {showImages ? "Hide product images" : "Show product images"}
          </button>
        </div>

        {showImages && (
          <div className="space-y-4 mb-8">
            <label className="flex cursor-pointer items-center justify-center rounded border border-dashed border-slate-400 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              {isUploadingImage ? "Uploading..." : "+ Add product image"}
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {product.imageUrls && product.imageUrls.length > 0 ?
                product.imageUrls.map((url, index) => (
                  <div
                    key={index}
                    className="group relative w-full h-96 overflow-hidden shadow-2xl">
                    <button
                      type="button"
                      onClick={() => openImageViewer(index)}
                      className="absolute align-text-bottom inset-0 z-10 flex h-full w-full items-center justify-center bg-slate-950/10 transition hover:bg-slate-950/20">
                      <span className="rounded bg-white/90 px-3 py-1 text-sm font-semibold text-slate-800 shadow">
                        Click to zoom
                      </span>
                    </button>
                    <Image
                      src={url}
                      alt={`${product.name} - image ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className=" object-cover transition duration-300 group-hover:scale-105"
                      loading="eager"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(url)}
                      className="absolute right-3 top-3 z-20 rounded bg-rose-600 px-3 py-1 text-sm font-semibold text-white shadow transition hover:bg-rose-500">
                      Remove
                    </button>
                  </div>
                ))
              : <div className="relative w-full h-96  border border-dashed border-slate-300 bg-slate-100">
                  <Image
                    src={(product as any).imageUrl || "/placeholder.jpg"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    loading="eager"
                  />
                </div>
              }
            </div>
          </div>
        )}

        {selectedImageIndex !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4"
            onClick={closeImageViewer}>
            <div
              className="relative w-full max-w-5xl"
              onClick={(event) => event.stopPropagation()}>
              <div className="absolute left-3 top-3 z-20 flex gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setZoomLevel((current) => Math.min(3, current + 0.25))
                  }
                  className="rounded bg-white/90 px-3 py-2 text-sm font-semibold text-slate-800 shadow transition hover:bg-white">
                  +
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setZoomLevel((current) => Math.max(1, current - 0.25))
                  }
                  className="rounded bg-white/90 px-3 py-2 text-sm font-semibold text-slate-800 shadow transition hover:bg-white">
                  -
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setZoomLevel(1);
                    setPanX(0);
                    setPanY(0);
                  }}
                  className="rounded bg-white/90 px-3 py-2 text-sm font-semibold text-slate-800 shadow transition hover:bg-white">
                  Reset
                </button>
                <button
                  type="button"
                  onClick={closeImageViewer}
                  className="rounded bg-white/90 px-3 py-2 text-sm font-semibold text-slate-800 shadow transition hover:bg-white">
                  Close
                </button>
              </div>
              <div
                className="relative h-[80vh] w-full cursor-grab overflow-hidden rounded-2xl bg-black"
                onMouseDown={handleViewerMouseDown}
                onMouseMove={handleViewerMouseMove}
                onMouseUp={handleViewerMouseUp}
                onMouseLeave={handleViewerMouseUp}>
                <div
                  className="absolute inset-0"
                  style={{
                    transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`,
                    transformOrigin: "center center",
                  }}>
                  <Image
                    src={
                      product.imageUrls?.[selectedImageIndex] ||
                      "/placeholder.jpg"
                    }
                    alt={`${product.name} - zoomed view`}
                    fill
                    sizes="100vw"
                    className="object-contain transition-transform duration-300"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="bg-slate-900 p-8 shadow-2xl rounded">
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
                className="inline-flex items-center gap-2 rounded bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400">
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
              <div className="rounded border border-slate-700 bg-slate-950/60 p-8 text-center text-slate-300">
                No required parts added yet.
              </div>
            : groupedParts.map(([category, partsInCategory]) => (
                <section
                  key={category}
                  className="rounded border border-slate-700 bg-slate-950/80 p-6 shadow-xl shadow-slate-950/20">
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
                    <span className="inline-flex rounded bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200">
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
                          className="rounded border border-slate-700 bg-slate-900 p-5 shadow-inner shadow-slate-950/20">
                          <div className="flex items-start gap-4">
                            <div className="flex h-16 w-16 items-center justify-center  bg-slate-800 text-slate-300">
                              {part.imageUrl ?
                                <img
                                  src={part.imageUrl}
                                  alt={part.name}
                                  className="h-full w-full  object-cover"
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
                              className={`inline-flex items-center rounded px-3 py-1 text-sm font-semibold ${
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
                                className="rounded bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
                                Edit
                              </button>
                              <button
                                onClick={() => setDeletingPart(part)}
                                className="rounded bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500">
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
