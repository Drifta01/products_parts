import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { Product, Part } from './types';

type DbData = {
    products: Product[];
    parts: Part[];
};

const defaultData: DbData = { products: [], parts: [] };

const adapter = new JSONFile<DbData>('db.json');
const db = new Low<DbData>(adapter, defaultData);

export const addProduct = async (product: Omit<Product, 'id' | 'requiredParts'>): Promise<Product> => {
    await db.read();
    const newProduct = { ...product, id: Date.now(), requiredParts: [], imageUrls: product.imageUrls || [] };
    db.data?.products.push(newProduct);
    await db.write();
    return newProduct;
};

export const getProducts = async (): Promise<Product[]> => {
    await db.read();
    return db.data?.products || [];
};

export const updateProduct = async (product: Product): Promise<Product> => {
    await db.read();
    const index = db.data.products.findIndex((p) => p.id === product.id);
    if (index !== -1) {
        db.data.products[index] = { ...db.data.products[index], ...product };
        await db.write();
    }
    return product;
};

export const deleteProduct = async (id: number): Promise<void> => {
    await db.read();
    db.data.products = db.data.products.filter((p) => p.id !== id);
    await db.write();
};

export const getParts = async (): Promise<Part[]> => {
    await db.read();
    return db.data?.parts || [];
};

export const getPartById = async (id: number): Promise<Part | undefined> => {
    await db.read();
    return db.data.parts.find((p) => p.id === id);
};

export const updatePart = async (part: Part): Promise<Part> => {
    await db.read();
    const index = db.data.parts.findIndex((p) => p.id === part.id);
    if (index !== -1) {
        db.data.parts[index] = part;
        await db.write();
    }
    return part;
};

export const deletePart = async (id: number): Promise<void> => {
    await db.read();
    db.data.parts = db.data.parts.filter((p) => p.id !== id);
    await db.write();
};

export const addPart = async (part: Omit<Part, 'id' | 'inStock' | 'productId'>): Promise<Part> => {
    await db.read();
    const newPart = { ...part, id: Date.now(), inStock: part.quantity > 0 };
    db.data?.parts.push(newPart);
    await db.write();
    return newPart;
};