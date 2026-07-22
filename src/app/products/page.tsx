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
    <div className="w-full min-h-full   gap-4 border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/30 md:flex-row md:items-center md:justify-between">
      <div className="border border-slate-800/80 bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/30 md:p-8 lg:p-10">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Catalog
            </p>
            <h1 className="mt-2 text-4xl font-extrabold text-white">
              Products
            </h1>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center  bg-cyan-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400">
            Add Product
          </button>
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
            const imageUrl = product.imageUrls && product.imageUrls[0];

            const requiredCount = product.requiredParts?.length ?? 0;
            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group block overflow-hidden  border border-slate-800 bg-slate-950 shadow-xl shadow-slate-950/30 ">
                <div className="relative h-52 overflow-hidden bg-slate-900">
                  {imageUrl ?
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      sizes="max-w-fit"
                      className="object-cover  "
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                  : <div className="flex h-full items-center justify-center bg-slate-800 text-slate-500">
                      No image available
                    </div>
                  }
                  <div className="absolute  bottom-0 bg-linear-to-t from-slate-950/95 to-transparent px-5 py-4"></div>
                </div>
                <h2 className="mt-2 ml-4 text-2xl font-semibold text-white">
                  {product.name}
                </h2>
                <div className="space-y-3 px-5 py-5">
                  <div className="flex flex-col gap-3 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      {requiredCount} required part
                      {requiredCount !== 1 ? "s" : ""}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className=" bg-slate-800 px-3  text-slate-200">
                        View details
                      </span>
                      <button
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          handleDeleteProduct(product.id);
                        }}
                        aria-label="Delete product"
                        className="ml-4 items-center justify-center px-3 py-1 bg-rose-600 text-white transition hover:bg-rose-500">
                        <span className="text-sm font-semibold">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
