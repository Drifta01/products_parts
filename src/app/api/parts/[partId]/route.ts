import { NextRequest, NextResponse } from "next/server";
import { updatePart, deletePart, getPartById } from "@/lib/db";

const getPartIdFromRequest = (request: NextRequest): number => {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const partIdString = pathSegments[pathSegments.length - 1];
    return parseInt(partIdString, 10);
};

export async function GET(
    request: NextRequest,
) {
    const partId = getPartIdFromRequest(request);
    const part = await getPartById(partId);
    if (part) {
        return NextResponse.json(part);
    }
    return new NextResponse("Part not found", { status: 404 });
}

export async function PUT(
    request: NextRequest,
) {
    const partId = getPartIdFromRequest(request);
    const data = await request.json();
    const updatedPart = await updatePart({ id: partId, ...data });
    return NextResponse.json(updatedPart);
}

export async function DELETE(
    request: NextRequest,
) {
    const partId = getPartIdFromRequest(request);
    await deletePart(partId);
    return NextResponse.json({ success: true });
}