
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

export type PartCategory = {
    partName: string;
    partCategory: string;
    partQuantity: number;
}

export interface Part {
    id: number;
    name: string;
    quantity: number;
    inStock: boolean;
    partNumber?: number;
    // category is stored as a simple string in db.json (e.g. "Nuts & Bolts")
    category?: string;
    // optional numeric category id when present
    categoryId?: number;
    imageUrl?: string;
}