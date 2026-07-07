"use client";

import { useState, useEffect } from "react";
import { Product } from "@/lib/types";

export default function InConstructionPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch("/api/products");
      const data = await res.json();
      // Filter products that are in construction
      const inConstructionProducts = data.filter(
        (p: Product) => p.inConstruction > 0,
      );
      setProducts(inConstructionProducts);
    };

    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold text-center my-10">
        Products In Construction
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.id} className="card bg-base-100 shadow-xl">
            <figure>
              <img
                src={product.imageUrls[0] || "/placeholder.jpg"}
                alt={product.name}
                className="h-48 w-full object-cover"
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title">{product.name}</h2>
              <p>Quantity in construction: {product.inConstruction}</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{
                    width: `${product.completionPercentage || 0}%`,
                  }}></div>
              </div>
              <p className="text-sm text-right">
                {Math.round(product.completionPercentage || 0)}% Complete
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
