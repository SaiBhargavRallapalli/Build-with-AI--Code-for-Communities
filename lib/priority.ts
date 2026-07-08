import { prisma } from "./db";

// Transparent, explainable priority scoring.
//
// Score (0-100) blends four signals so an MP can trust and defend it:
//  - Demand: how many citizens raised this theme, normalized against the
//    largest theme so scores stay comparable across time.
//  - Urgency: average NLP-derived urgency of submissions in the theme.
//  - Need gap: how badly the ward's underlying demographic/infrastructure
//    data supports the request (e.g. a school-upgrade request in a ward
//    with high enrollment and long travel distances scores higher than
//    the same request in a well-served ward).
//  - Recency: recent surges are weighted slightly higher than old, resolved
//    chatter.
//
// Weights are intentionally simple and documented so they can be tuned
// live in a dashboard control (see components/PriorityWeights.tsx).

export interface PriorityWeights {
  demand: number;
  urgency: number;
  needGap: number;
  recency: number;
}

export const DEFAULT_WEIGHTS: PriorityWeights = {
  demand: 0.35,
  urgency: 0.25,
  needGap: 0.3,
  recency: 0.1,
};

export interface PriorityItem {
  theme: string;
  category: string;
  wardId: string | null;
  wardName: string | null;
  submissionCount: number;
  avgUrgency: number;
  needGapScore: number; // 0-100
  demandScore: number; // 0-100
  recencyScore: number; // 0-100
  totalScore: number; // 0-100
  sampleText: string;
  lat: number | null;
  lng: number | null;
}

function needGapForCategory(category: string, ward: {
  avgSchoolEnrollment: number;
  avgSchoolDistanceKm: number;
  healthCentreCount: number;
  literacyRatePct: number;
  unemploymentRatePct: number;
  roadConditionIndex: number;
  waterAccessPct: number;
  electrificationPct: number;
  population: number;
  schoolCount: number;
}): number {
  switch (category) {
    case "Education": {
      const distanceGap = Math.min(1, ward.avgSchoolDistanceKm / 10);
      const crowding = Math.min(1, ward.avgSchoolEnrollment / 60);
      const literacyGap = Math.max(0, 1 - ward.literacyRatePct / 100);
      return (distanceGap * 0.4 + crowding * 0.35 + literacyGap * 0.25) * 100;
    }
    case "Health": {
      const perCapita = ward.healthCentreCount / Math.max(1, ward.population / 10000);
      return Math.max(0, Math.min(1, 1 - perCapita / 2)) * 100;
    }
    case "Employment": {
      return Math.min(1, ward.unemploymentRatePct / 25) * 100;
    }
    case "Roads": {
      return Math.max(0, 1 - ward.roadConditionIndex / 10) * 100;
    }
    case "Water": {
      return Math.max(0, 1 - ward.waterAccessPct / 100) * 100;
    }
    case "Electricity": {
      return Math.max(0, 1 - ward.electrificationPct / 100) * 100;
    }
    default:
      return 50;
  }
}

export async function computePriorities(weights: PriorityWeights = DEFAULT_WEIGHTS): Promise<PriorityItem[]> {
  const submissions = await prisma.submission.findMany({ include: { ward: true } });
  if (submissions.length === 0) return [];

  type Group = {
    theme: string;
    category: string;
    wardId: string | null;
    wardName: string | null;
    lat: number | null;
    lng: number | null;
    urgencies: number[];
    sampleText: string;
    timestamps: number[];
    needGaps: number[];
  };

  const groups = new Map<string, Group>();

  for (const s of submissions) {
    const key = `${s.theme}::${s.wardId ?? "unassigned"}`;
    let g = groups.get(key);
    if (!g) {
      g = {
        theme: s.theme,
        category: s.category,
        wardId: s.wardId,
        wardName: s.ward?.name ?? null,
        lat: s.ward?.lat ?? null,
        lng: s.ward?.lng ?? null,
        urgencies: [],
        sampleText: s.rawText,
        timestamps: [],
        needGaps: [],
      };
      groups.set(key, g);
    }
    g.urgencies.push(s.urgency);
    g.timestamps.push(s.createdAt.getTime());
    if (s.ward) {
      g.needGaps.push(needGapForCategory(s.category, s.ward));
    }
  }

  const maxCount = Math.max(...Array.from(groups.values()).map((g) => g.urgencies.length));
  const now = Date.now();
  const thirtyDays = 1000 * 60 * 60 * 24 * 30;

  const items: PriorityItem[] = Array.from(groups.values()).map((g) => {
    const submissionCount = g.urgencies.length;
    const avgUrgency = g.urgencies.reduce((a, b) => a + b, 0) / submissionCount;
    const needGapScore = g.needGaps.length > 0 ? g.needGaps.reduce((a, b) => a + b, 0) / g.needGaps.length : 50;
    const demandScore = (submissionCount / maxCount) * 100;
    const recentCount = g.timestamps.filter((t) => now - t < thirtyDays).length;
    const recencyScore = (recentCount / submissionCount) * 100;

    const totalScore =
      demandScore * weights.demand +
      (avgUrgency / 5) * 100 * weights.urgency +
      needGapScore * weights.needGap +
      recencyScore * weights.recency;

    return {
      theme: g.theme,
      category: g.category,
      wardId: g.wardId,
      wardName: g.wardName,
      submissionCount,
      avgUrgency: Math.round(avgUrgency * 10) / 10,
      needGapScore: Math.round(needGapScore),
      demandScore: Math.round(demandScore),
      recencyScore: Math.round(recencyScore),
      totalScore: Math.round(totalScore * 10) / 10,
      sampleText: g.sampleText,
      lat: g.lat,
      lng: g.lng,
    };
  });

  return items.sort((a, b) => b.totalScore - a.totalScore);
}
