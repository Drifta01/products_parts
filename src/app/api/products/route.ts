import { NextResponse } from 'next/server';
import { getProducts, addProduct } from '@/lib/db';
import { Product } from '@/lib/types';

export async function GET() {
    const products = await getProducts();
    return NextResponse.json(products);
}

export async function POST(request: Request) {
    const product: Omit<Product, 'id'> = await request.json();
    const newProduct = await addProduct(product);
    return NextResponse.json(newProduct, { status: 201 });
}