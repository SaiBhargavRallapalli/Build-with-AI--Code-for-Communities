import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const wards = await prisma.ward.findMany({
    include: { submissions: true },
  });

  const hotspots = wards.map((w) => {
    const categoryCounts: Record<string, number> = {};
    for (const s of w.submissions) {
      categoryCounts[s.category] = (categoryCounts[s.category] ?? 0) + 1;
    }
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    return {
      id: w.id,
      name: w.name,
      lat: w.lat,
      lng: w.lng,
      submissionCount: w.submissions.length,
      topCategory,
      categoryCounts,
      avgUrgency:
        w.submissions.length > 0
          ? Math.round((w.submissions.reduce((a, s) => a + s.urgency, 0) / w.submissions.length) * 10) / 10
          : 0,
    };
  });

  return NextResponse.json({ hotspots });
}
