import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { analyzeSubmission, detectSubmissionLanguage } from "@/lib/nlp";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const wardId = searchParams.get("wardId");

  const submissions = await prisma.submission.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(wardId ? { wardId } : {}),
    },
    include: { ward: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ submissions });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { text, channel, wardId, citizenName, contact, photoUrl } = body ?? {};

  if (!text || typeof text !== "string" || text.trim().length < 5) {
    return NextResponse.json({ error: "Please provide a description of at least 5 characters." }, { status: 400 });
  }

  const language = detectSubmissionLanguage(text);
  const analysis = await analyzeSubmission(text);

  const submission = await prisma.submission.create({
    data: {
      channel: channel || "web",
      language,
      rawText: text.trim(),
      translatedText: analysis.translatedText,
      citizenName: citizenName || null,
      contact: contact || null,
      photoUrl: photoUrl || null,
      wardId: wardId || null,
      category: analysis.category,
      theme: analysis.theme,
      keywords: analysis.keywords.join(","),
      urgency: analysis.urgency,
      sentiment: analysis.sentiment,
    },
  });

  return NextResponse.json({ submission, analysis }, { status: 201 });
}
