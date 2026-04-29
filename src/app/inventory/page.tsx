"use client";

import { useState, useEffect } from "react";
import { Product, Part, PartCategory } from "@/lib/types";
import EditProductModal from "@/components/EditProductModal";
import EditPartModal from "@/components/EditPartModal";
import AddPartModal from "@/components/AddPartModal";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [newProductName, setNewProductName] = useState("");
  const [newProductImageFiles, setNewProductImageFiles] = useState<File[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [isAddPartModalOpen, setIsAddPartModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const productsRes = await fetch("/api/products");
      const productsData = await productsRes.json();
      setProducts(productsData);

      const partsRes = await fetch("/api/parts");
      const partsData = await partsRes.json();
      setParts(partsData);
    };

    fetchData();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || newProductImageFiles.length === 0) return;

    const uploadPromises = newProductImageFiles.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      return uploadRes.json();
    });

    const uploadResults = await Promise.all(uploadPromises);

    const newProduct = {
      name: newProductName,
      imageUrls: uploadResults.map((res) => res.url),
    };

    const productRes = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProduct),
    });

    const addedProduct = await productRes.json();
    setProducts([...products, addedProduct]);
    setNewProductName("");
    setNewProductImageFiles([]);
  };

  const handleAddPart = async (part: Omit<Part, "id">) => {
    const res = await fetch("/api/parts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(part),
    });

    const addedPart = await res.json();
    setParts([...parts, addedPart]);
    setIsAddPartModalOpen(false);
  };

  const handleDeleteProduct = async (id: number) => {
    await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleDeletePart = async (id: number) => {
    await fetch(`/api/parts/${id}`, {
      method: "DELETE",
    });
    setParts(parts.filter((p) => p.id !== id));
  };

  const handleUpdateProduct = async (product: Product) => {
    const res = await fetch(`/api/products/${product.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    });
    const updatedProduct = await res.json();
    setProducts(
      products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
    );
    setEditingProduct(null);
  };

  const handleUpdatePart = async (part: Part) => {
    const res = await fetch(`/api/parts/${part.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(part),
    });
    const updatedPart = await res.json();
    setParts(parts.map((p) => (p.id === updatedPart.id ? updatedPart : p)));
    setEditingPart(null);
  };

  const groupedParts = parts.reduce(
    (acc, part) => {
      const category = part.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(part);
      return acc;
    },
    {} as Record<PartCategory, Part[]>,
  );

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold text-center my-10">
        Inventory Management
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 hover:bg-slate-300">
            Add New Product
          </h2>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <input
              type="text"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              placeholder="Product Name"
              className="input input-bordered w-full"
            />
            <input
              type="file"
              multiple
              onChange={(e) =>
                e.target.files &&
                setNewProductImageFiles(Array.from(e.target.files))
              }
              className="file-input file-input-bordered w-full"
            />
            <button
              type="submit"
              className="btn btn-primary w-100 rounded-full hover:bg-slate-300  ">
              Add Product
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Add New Part</h2>
          <button
            onClick={() => setIsAddPartModalOpen(true)}
            className="btn btn-primary w-30 rounded-full hover:bg-slate-300 ">
            Add Part
          </button>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Current Inventory
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold mb-4">Products</h3>
            <ul className="space-y-3">
              {products.map((product) => (
                <li
                  key={product.id}
                  onClick={() => setEditingProduct(product)}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-100">
                  <span className="font-medium">{product.name}</span>
                  <div className="space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProduct(product.id);
                      }}
                      className="btn btn-sm btn-outline btn-error">
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold mb-4">Parts</h3>
            {Object.keys(groupedParts).map((category) => (
              <div key={category} className="mb-6">
                <h4 className="text-xl font-bold mb-2">{category}</h4>
                <ul className="space-y-3">
                  {groupedParts[category as PartCategory].map((part) => (
                    <li
                      key={part.id}
                      onClick={() => setEditingPart(part)}
                      className={`flex items-center justify-between p-3  cursor-pointer hover:bg-gray-100 ${
                        part.quantity <= 10 ? "bg-red-100" : ""
                      }`}>
                      <div className="flex items-center ">
                        {part.imageUrl && (
                          <img
                            src={part.imageUrl}
                            alt={part.name}
                            className="w-12 h-12 object-contain rounded-lg mr-4"
                          />
                        )}
                        <span className="font-medium">
                          {part.name} (Quantity: {part.quantity})
                          {part.quantity <= 10 && (
                            <span className="text-red-500 ml-2">
                              (Low Stock)
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePart(part.id);
                          }}
                          className="btn btn-sm btn-outline btn-error">
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          parts={parts}
          onClose={() => setEditingProduct(null)}
          onSave={handleUpdateProduct}
        />
      )}

      {editingPart && (
        <EditPartModal
          part={editingPart}
          products={products}
          onClose={() => setEditingPart(null)}
          onSave={handleUpdatePart}
        />
      )}

      {isAddPartModalOpen && (
        <AddPartModal
          products={products}
          onClose={() => setIsAddPartModalOpen(false)}
          onSave={handleAddPart}
        />
      )}
    </div>
  );
}
