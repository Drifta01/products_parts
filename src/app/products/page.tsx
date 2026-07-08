"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Product, Part } from "@/lib/types";
import AddProductModal from "@/components/AddProductModal";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProductsAndParts = async () => {
    const productsRes = await fetch("/api/products");
    const productsData = await productsRes.json();
    setProducts(productsData);

    const partsRes = await fetch("/api/parts");
    const partsData = await partsRes.json();
    setParts(partsData);
  };

  useEffect(() => {
    fetchProductsAndParts();
  }, []);

  const handleSaveProduct = async (newProduct: Omit<Product, "id">) => {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    });

    if (res.ok) {
      setIsModalOpen(false);
      fetchProductsAndParts(); // Refresh products
    } else {
      console.error("Failed to save product");
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    const res = await fetch(`/api/products/${productId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setProducts((current) =>
        current.filter((product) => product.id !== productId),
      );
    } else {
      console.error("Failed to delete product");
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-10 rounded-4xl bg-slate-950/95 p-8 shadow-2xl shadow-slate-950/40">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-white">Products</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Browse product records, open each product page for required parts,
              and manage your catalog from a clean inventory dashboard.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400">
            Add Product
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <AddProductModal
            parts={parts}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveProduct}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product, index) => {
          const imageUrl =
            (product.imageUrls && product.imageUrls[0]) ||
            (product as any).imageUrl;
          const requiredCount = product.requiredParts?.length ?? 0;
          return (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group block overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950 shadow-xl shadow-slate-950/30 transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="relative h-72 overflow-hidden bg-slate-900">
                {imageUrl ?
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                : <div className="flex h-full items-center justify-center bg-slate-800 text-slate-500">
                    No image available
                  </div>
                }
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 to-transparent px-5 py-4">
                  <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">
                    Product
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    {product.name}
                  </h2>
                </div>
              </div>
              <div className="space-y-3 px-5 py-5">
                <div className="flex flex-col gap-3 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    {requiredCount} required part
                    {requiredCount !== 1 ? "s" : ""}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">
                      View details
                    </span>
                    <button
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleDeleteProduct(product.id);
                      }}
                      aria-label="Delete product"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-rose-600 text-white transition hover:bg-rose-500">
                      <span className="text-sm font-semibold">×</span>
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
