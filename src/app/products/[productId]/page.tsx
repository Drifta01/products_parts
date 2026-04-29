"use client";
import Image from "next/image";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Product, Part } from "@/lib/types";

export default function ProductPage() {
  const params = useParams();
  const productId = parseInt(params.productId as string, 10);
  const [product, setProduct] = useState<Product | null>(null);
  const [parts, setParts] = useState<Part[]>([]);

  useEffect(() => {
    if (!productId) return;

    const fetchData = async () => {
      const productRes = await fetch(`/api/products/${productId}`);
      const currentProduct: Product = await productRes.json();

      if (currentProduct && currentProduct.requiredParts) {
        const partsRes = await fetch("/api/parts");
        const allParts: Part[] = await partsRes.json();

        const requiredPartIds = new Set(
          currentProduct.requiredParts.map((rp) => rp.partId),
        );
        const productParts = allParts.filter((p) => requiredPartIds.has(p.id));

        setProduct(currentProduct);
        setParts(productParts);
      } else {
        setProduct(currentProduct || null);
        setParts([]);
      }
    };

    fetchData();
  }, [productId]);

  const handleCheckboxChange = async (partId: number) => {
    const partToUpdate = parts.find((p) => p.id === partId);
    if (partToUpdate) {
      const updatedPartData = {
        ...partToUpdate,
        inStock: !partToUpdate.inStock,
      };
      const res = await fetch(`/api/parts/${partId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPartData),
      });
      const updatedPart = await res.json();
      setParts((prevParts) =>
        prevParts.map((part) => (part.id === partId ? updatedPart : part)),
      );
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-800">
          {product.name}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {product.imageUrls && product.imageUrls.length > 0 ?
            product.imageUrls.map((url, index) => (
              <div key={index} className="relative w-full h-96">
                <Image
                  src={url}
                  alt={`${product.name} - image ${index + 1}`}
                  fill
                  className="object-cover rounded-lg shadow-2xl"
                />
              </div>
            ))
          : <div className="relative w-full h-96">
              <Image
                src={(product as any).imageUrl || ""}
                alt={product.name}
                fill
                className="object-cover rounded-lg shadow-2xl"
              />
            </div>
          }
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">
            Required Parts
          </h2>
          <ul className="space-y-3">
            {parts.map((part) => (
              <li
                key={part.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                <span className="text-lg font-medium text-gray-800">
                  {part.name}
                </span>
                <div className="flex items-center space-x-3">
                  <span className="text-gray-600">
                    In Stock: {part.inStock ? "Yes" : "No"}
                  </span>
                  <input
                    type="checkbox"
                    checked={part.inStock}
                    onChange={() => handleCheckboxChange(part.id)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
