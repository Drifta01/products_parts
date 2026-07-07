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
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg shadow-2xl"
                />
              </div>
            ))
          : <div className="relative w-full h-96">
              <Image
                src={(product as any).imageUrl || "/placeholder.jpg"}
                alt={product.name}
                layout="fill"
                objectFit="cover"
                className="rounded-lg shadow-2xl"
              />
            </div>
          }
        </div>
        <div className="bg-white p-6 shadow-md rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-700">Required Parts</h2>
            {!isAddingPart && (
              <button
                onClick={() => setIsAddingPart(true)}
                className="btn btn-primary btn-sm bg-slate-300 hover:bg-slate-500 rounded px-3">
                Add Part
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

          <ul className="space-y-3">
            {parts.map((part) =>
              editingPart && editingPart.id === part.id ?
                <EditPartForm
                  key={part.id}
                  part={part}
                  requiredPart={getRequiredPart(part.id)!}
                  onSave={handleEditPart}
                  onCancel={() => setEditingPart(null)}
                />
              : <li
                  key={part.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-lg font-medium text-gray-800">
                    {part.name} (Qty: {getRequiredPart(part.id)?.quantity || 0})
                  </span>
                  <div className="flex items-center space-x-8">
                    <button
                      onClick={() => setEditingPart(part)}
                      className="btn btn-sm btn-outline btn-info bg-slate-300 hover:bg-slate-500 rounded px-3">
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingPart(part)}
                      className="btn btn-sm btn-outline btn-error  hover:bg-red-500 px-3 rounded">
                      Delete
                    </button>
                  </div>
                </li>,
            )}
          </ul>
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
