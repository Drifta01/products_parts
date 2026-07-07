
export interface RequiredPart {
    partId: number;
    quantity: number;
}

export interface Product {
    id: number;
    name: string;
    imageUrls: string[];
    requiredParts: RequiredPart[];
    quantity: number;
    inConstruction: number;
    completionPercentage?: number;
    neededParts?: RequiredPart[];
}

export type PartCategory = string;

export interface Part {
    id: number;
    name: string;
    quantity: number;
    inStock: boolean;
    category: PartCategory;
    imageUrl?: string;
}