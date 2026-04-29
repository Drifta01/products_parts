import { NextRequest, NextResponse } from "next/server";
import {
    updateProduct,
    deleteProduct,
    getProducts,
    getParts,
    updatePart,
} from "@/lib/db";
import { RequiredPart } from "@/lib/types";

const getProductIdFromRequest = (request: NextRequest): number => {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const productIdString = pathSegments[pathSegments.length - 1];
    return parseInt(productIdString, 10);
};

export async function GET(request: NextRequest) {
    const products = await getProducts();
    const productId = getProductIdFromRequest(request);
    const product = products.find((p) => p.id === productId);

    if (product) {
        return NextResponse.json(product);
    }
    return new NextResponse("Product not found", { status: 404 });
}

export async function PUT(request: NextRequest) {
    const productId = getProductIdFromRequest(request);
    const newProductData = await request.json();

    const products = await getProducts();
    const oldProduct = products.find((p) => p.id === productId);

    if (!oldProduct) {
        return new NextResponse("Product not found", { status: 404 });
    }

    const oldPartQuantities = (oldProduct.requiredParts || []).reduce(
        (acc, part) => {
            acc[part.partId] = part.quantity;
            return acc;
        },
        {} as { [key: number]: number },
    );

    const newPartQuantities = (newProductData.requiredParts || []).reduce(
        (acc: { [key: number]: number }, part: RequiredPart) => {
            acc[part.partId] = part.quantity;
            return acc;
        },
        {} as { [key: number]: number },
    );

    const allPartIds = [
        ...new Set([
            ...Object.keys(oldPartQuantities).map(Number),
            ...Object.keys(newPartQuantities).map(Number),
        ]),
    ];

    const parts = await getParts();

    for (const partId of allPartIds) {
        const oldQuantity = oldPartQuantities[partId] || 0;
        const newQuantity = newPartQuantities[partId] || 0;
        const quantityDifference = newQuantity - oldQuantity;

        if (quantityDifference !== 0) {
            const partToUpdate = parts.find((p) => p.id === partId);
            if (partToUpdate) {
                partToUpdate.quantity -= quantityDifference;
                await updatePart(partToUpdate);
            }
        }
    }

    const updatedProduct = await updateProduct({ id: productId, ...newProductData });
    return NextResponse.json(updatedProduct);
}

export async function DELETE(request: NextRequest) {
    const productId = getProductIdFromRequest(request);
    await deleteProduct(productId);
    return NextResponse.json({ success: true });
}