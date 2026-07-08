import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const submissions = await prisma.submission.findMany({
    select: { category: true, theme: true, urgency: true },
  });

  const byCategory = new Map<string, number>();
  const byTheme = new Map<string, { count: number; category: string }>();

  for (const s of submissions) {
    byCategory.set(s.category, (byCategory.get(s.category) ?? 0) + 1);
    const existing = byTheme.get(s.theme);
    byTheme.set(s.theme, { count: (existing?.count ?? 0) + 1, category: s.category });
  }

  const categories = Array.from(byCategory.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const themes = Array.from(byTheme.entries())
    .map(([theme, v]) => ({ theme, count: v.count, category: v.category }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({ categories, themes, total: submissions.length });
}
