import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const wards = await prisma.ward.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ wards });
}
