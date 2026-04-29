import { NextResponse } from 'next/server';
import { getParts, addPart, updatePart } from '@/lib/db';
import { Part } from '@/lib/types';

export async function GET() {
    const parts = await getParts();
    return NextResponse.json(parts);
}

export async function POST(request: Request) {
    const part: Omit<Part, 'id'> = await request.json();
    const newPart = await addPart(part);
    return NextResponse.json(newPart, { status: 201 });
}

export async function PUT(request: Request) {
    const part: Part = await request.json();
    try {
        const updatedPart = await updatePart(part);
        return NextResponse.json(updatedPart);
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message }, { status: 404 });
    }
}