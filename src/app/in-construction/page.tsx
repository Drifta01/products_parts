"use client";

import { useState, useEffect } from "react";
import { Product, Part } from "@/lib/types";
import Link from "next/link";
import InConstructionCard from "@/components/InConstructionCard";

export default function InConstructionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [parts, setParts] = useState<Part[]>([]);

  useEffect(() => {
    const fetchProductsAndParts = async () => {
      const [productsRes, partsRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/parts"),
      ]);
      const [productsData, partsData] = await Promise.all([
        productsRes.json(),
        partsRes.json(),
      ]);
      setProducts(productsData);
      setParts(partsData);
    };

    fetchProductsAndParts();
  }, []);

  const handleUpdateProduct = async (updatedProduct: Product) => {
    const res = await fetch(`/api/products/${updatedProduct.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedProduct),
    });

    const returnedProduct = await res.json();
    setProducts(
      products.map((p) => (p.id === returnedProduct.id ? returnedProduct : p)),
    );
  };

  const inConstructionProducts = products.filter((p) => p.inConstruction > 0);

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold text-center my-10">
        Products In Construction
      </h1>
      <div className="text-center mb-10">
        <Link href="/inventory" className="btn btn-primary">
          Back to Inventory
        </Link>
      </div>

      <div className="space-y-6">
        {inConstructionProducts.length > 0 ?
          inConstructionProducts.map((product) => (
            <InConstructionCard
              key={product.id}
              product={product}
              parts={parts}
              onUpdate={handleUpdateProduct}
            />
          ))
        : <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p>No products are currently in construction.</p>
          </div>
        }
      </div>
    </div>
  );
}
