"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Product } from "@/lib/types";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    };

    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold text-center my-10">Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => {
          const imageUrl =
            (product.imageUrls && product.imageUrls[0]) ||
            (product as any).imageUrl;
          return (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="block border rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
              <div className="relative w-full h-64">
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="p-4">
                <h2 className="text-2xl font-bold">{product.name}</h2>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
