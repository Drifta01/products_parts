"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Product } from "@/lib/types";

export default function InConstructionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [progressValues, setProgressValues] = useState<Record<number, number>>(
    {},
  );

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch("/api/products");
      const data = await res.json();
      const inConstructionProducts = data
        .filter((p: Product) => p.inConstruction > 0)
        .sort(
          (a: Product, b: Product) =>
            (b.completionPercentage || 0) - (a.completionPercentage || 0),
        );

      setProducts(inConstructionProducts);
      setProgressValues(
        inConstructionProducts.reduce(
          (acc: Record<number, number>, product: Product) => {
            acc[product.id] = product.completionPercentage ?? 0;
            return acc;
          },
          {},
        ),
      );
    };

    fetchProducts();
  }, []);

  const handleProgressChange = (productId: number, value: number) => {
    setProgressValues((current) => ({
      ...current,
      [productId]: value,
    }));
  };

  const handleSaveProgress = async (product: Product) => {
    const updatedValue = progressValues[product.id] ?? 0;
    const updatedProduct = {
      ...product,
      completionPercentage: updatedValue,
    };

    const res = await fetch(`/api/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProduct),
    });

    if (res.ok) {
      setProducts((current) =>
        current.map((item) =>
          item.id === product.id ?
            { ...item, completionPercentage: updatedValue }
          : item,
        ),
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="rounded-[32px] bg-slate-900/90 p-10 shadow-2xl shadow-slate-950/40">
          <div className="max-w-4xl">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
              Construction Dashboard
            </p>
            <h1 className="mt-4 text-5xl font-extrabold tracking-tight">
              Products In Construction
            </h1>
            <p className="mt-4 text-lg text-slate-400 leading-8">
              Monitor work in progress, see completion status at a glance, and
              keep production moving with a polished construction overview.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.length === 0 ?
            <div className="rounded-[28px] border border-slate-800 bg-slate-900/95 p-12 text-center text-slate-400 shadow-xl shadow-slate-950/20">
              <p className="text-xl font-semibold text-white">
                No products currently in construction.
              </p>
              <p className="mt-3 text-sm leading-6">
                Once products enter the construction phase, they will appear
                here with progress details and quantity information.
              </p>
            </div>
          : products.map((product) => {
              const progress = Math.round(product.completionPercentage || 0);
              return (
                <div
                  key={product.id}
                  className="overflow-hidden rounded-[28px] border border-slate-800 bg-slate-900/95 shadow-xl shadow-slate-950/20">
                  <div className="relative h-56 w-full overflow-hidden bg-slate-800">
                    <Image
                      src={product.imageUrls?.[0] || "/placeholder.jpg"}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="inline-flex rounded-full bg-cyan-500/15 px-3 py-1 text-sm font-semibold text-cyan-200">
                        In Construction
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4 p-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-white">
                        {product.name}
                      </h2>
                      <p className="mt-2 text-sm text-slate-400">
                        {product.inConstruction} unit
                        {product.inConstruction !== 1 ? "s" : ""} currently in
                        production.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-slate-400">
                          <span>Completion</span>
                          <span className="font-semibold text-white">
                            {progress}%
                          </span>
                        </div>
                        <div className="w-full rounded-full bg-slate-800 h-3">
                          <div
                            className="h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                            style={{
                              width: `${Math.min(Math.max(progress, 0), 100)}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={progressValues[product.id] ?? 0}
                            onChange={(e) =>
                              handleProgressChange(
                                product.id,
                                Number(e.target.value),
                              )
                            }
                            className="range range-primary w-full"
                          />
                          <div className="flex items-center gap-3">
                            <label className="text-sm text-slate-400">
                              Exact
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={progressValues[product.id] ?? 0}
                              onChange={(e) => {
                                const value = Math.min(
                                  100,
                                  Math.max(0, Number(e.target.value) || 0),
                                );
                                handleProgressChange(product.id, value);
                              }}
                              className="input input-bordered w-20 bg-slate-950 text-white"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm text-slate-400">
                            Use the slider or enter a value directly.
                          </p>
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() => handleSaveProgress(product)}
                              className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-400">
                              Save Progress
                            </button>
                            <Link
                              href={`/products/${product.id}`}
                              className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
                              View Product
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
                      <p className="font-semibold text-slate-100">
                        Estimated completion
                      </p>
                      <p className="mt-2 leading-6 text-slate-400">
                        Tracking progress across required builds helps you keep
                        resources aligned and avoid delays.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
    </div>
  );
}
