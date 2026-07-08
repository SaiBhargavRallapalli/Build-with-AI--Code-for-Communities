import { NextRequest, NextResponse } from "next/server";
import { computePriorities, DEFAULT_WEIGHTS } from "@/lib/priority";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const weights = {
    demand: Number(searchParams.get("demand")) || DEFAULT_WEIGHTS.demand,
    urgency: Number(searchParams.get("urgency")) || DEFAULT_WEIGHTS.urgency,
    needGap: Number(searchParams.get("needGap")) || DEFAULT_WEIGHTS.needGap,
    recency: Number(searchParams.get("recency")) || DEFAULT_WEIGHTS.recency,
  };

  const priorities = await computePriorities(weights);
  return NextResponse.json({ priorities, weights });
}
