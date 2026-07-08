// Lightweight multilingual NLP engine for citizen submissions.
//
// Works fully offline / free using rule-based keyword matching across
// English, Hindi (Devanagari + Romanized) and Telugu (Telugu script +
// Romanized). If OPENAI_API_KEY is set, category/theme/urgency/sentiment
// are instead derived from a single structured OpenAI call for higher
// accuracy, with this module as the automatic fallback on any failure.

export type Category =
  | "Education"
  | "Health"
  | "Roads"
  | "Water"
  | "Electricity"
  | "Sanitation"
  | "Employment"
  | "Safety"
  | "Other";

export interface AnalysisResult {
  category: Category;
  theme: string;
  keywords: string[];
  urgency: number; // 1-5
  sentiment: number; // -1..1
  translatedText?: string;
}

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  Education: [
    "school", "teacher", "classroom", "enrollment", "vocational", "college", "scholarship", "textbook", "exam", "student",
    "स्कूल", "शिक्षक", "कक्षा", "छात्र", "कॉलेज", "पाठशाला",
    "పాఠశాల", "టీచర్", "విద్యార్థి", "కళాశాల",
  ],
  Health: [
    "hospital", "clinic", "doctor", "medicine", "health centre", "phc", "ambulance", "disease", "vaccination", "nurse",
    "अस्पताल", "डॉक्टर", "दवा", "स्वास्थ्य", "क्लिनिक",
    "ఆసుపత్రి", "డాక్టర్", "మందు", "ఆరోగ్యం",
  ],
  Roads: [
    "road", "pothole", "highway", "bridge", "street light", "traffic", "footpath", "culvert", "bus stop",
    "सड़क", "गड्ढा", "पुल", "स्ट्रीट लाइट",
    "రోడ్డు", "గుంతలు", "వంతెన",
  ],
  Water: [
    "water", "borewell", "tap", "drainage", "pipeline", "flood", "irrigation", "canal", "drinking water",
    "पानी", "नल", "नाली", "बोरवेल",
    "నీరు", "నల్లా", "కాలువ",
  ],
  Electricity: [
    "electricity", "power cut", "transformer", "streetlight", "voltage", "power supply", "meter",
    "बिजली", "ट्रांसफार्मर", "पावर कट",
    "కరెంట్", "విద్యుత్", "ట్రాన్స్‌ఫార్మర్",
  ],
  Sanitation: [
    "garbage", "sanitation", "toilet", "sewage", "waste", "cleanliness", "drain", "dump",
    "कचरा", "शौचालय", "सफाई", "गंदगी",
    "చెత్త", "మరుగుదొడ్డి", "పారిశుధ్యం",
  ],
  Employment: [
    "job", "employment", "unemployment", "vocational centre", "skill training", "livelihood", "self help group", "industry",
    "रोजगार", "नौकरी", "बेरोजगारी", "कौशल",
    "ఉద్యోగం", "నిరుద్యోగం", "శిక్షణ",
  ],
  Safety: [
    "crime", "police", "safety", "harassment", "theft", "streetlight safety", "women safety", "cctv",
    "अपराध", "पुलिस", "सुरक्षा", "छेड़छाड़",
    "నేరం", "పోలీసు", "భద్రత",
  ],
  Other: [],
};

const URGENT_MARKERS = [
  "urgent", "emergency", "immediately", "danger", "accident", "died", "death", "collapsed", "flooded", "no water", "no power",
  "तुरंत", "आपातकाल", "खतरा", "दुर्घटना",
  "అత్యవసరం", "ప్రమాదం",
];

const NEGATIVE_MARKERS = [
  "not working", "broken", "poor", "bad", "worst", "no", "lack", "shortage", "delay", "ignored", "neglect", "problem", "issue", "complaint",
  "नहीं", "खराब", "समस्या", "शिकायत", "कमी",
  "లేదు", "సమస్య", "ఫిర్యాదు", "పాడైంది",
];

function detectLanguage(text: string): string {
  if (/[ऀ-ॿ]/.test(text)) return "hi";
  if (/[ఀ-౿]/.test(text)) return "te";
  return "en";
}

function normalize(text: string): string {
  return text.toLowerCase();
}

function scoreCategory(normalizedText: string, category: Category): number {
  const words = CATEGORY_KEYWORDS[category];
  let score = 0;
  for (const w of words) {
    if (normalizedText.includes(w.toLowerCase())) score += 1;
  }
  return score;
}

function extractKeywords(normalizedText: string): string[] {
  const found = new Set<string>();
  for (const category of Object.keys(CATEGORY_KEYWORDS) as Category[]) {
    for (const w of CATEGORY_KEYWORDS[category]) {
      if (normalizedText.includes(w.toLowerCase())) found.add(w.toLowerCase());
    }
  }
  return Array.from(found).slice(0, 8);
}

function themeFromCategoryAndText(category: Category, normalizedText: string): string {
  const themeMap: Record<Category, [string, string][]> = {
    Education: [
      ["vocational", "vocational-training-centre"],
      ["scholarship", "scholarship-access"],
      ["teacher", "teacher-shortage"],
      ["enrollment", "school-enrollment-gap"],
      ["school", "school-infrastructure-upgrade"],
    ],
    Health: [
      ["ambulance", "ambulance-access"],
      ["phc", "primary-health-centre-gap"],
      ["hospital", "hospital-infrastructure"],
      ["vaccination", "vaccination-drive"],
    ],
    Roads: [
      ["pothole", "road-pothole-repair"],
      ["bridge", "bridge-construction"],
      ["street light", "street-lighting"],
      ["road", "road-widening-repair"],
    ],
    Water: [
      ["drinking water", "drinking-water-supply"],
      ["borewell", "borewell-installation"],
      ["drainage", "drainage-improvement"],
      ["flood", "flood-management"],
      ["water", "water-supply"],
    ],
    Electricity: [
      ["transformer", "transformer-upgrade"],
      ["power cut", "power-reliability"],
      ["streetlight", "street-lighting-power"],
      ["electricity", "electrification"],
    ],
    Sanitation: [
      ["toilet", "public-toilet-access"],
      ["sewage", "sewage-management"],
      ["garbage", "waste-collection"],
    ],
    Employment: [
      ["vocational centre", "vocational-training-centre"],
      ["skill training", "skill-development"],
      ["unemployment", "job-creation"],
    ],
    Safety: [
      ["women safety", "women-safety"],
      ["cctv", "cctv-surveillance"],
      ["police", "policing-presence"],
    ],
    Other: [["", "general-grievance"]],
  };
  if (category === "Other") return "general-grievance";
  for (const [needle, theme] of themeMap[category]) {
    if (needle && normalizedText.includes(needle)) return theme;
  }
  return `${category.toLowerCase()}-general`;
}

function ruleBasedAnalysis(text: string): AnalysisResult {
  const normalizedText = normalize(text);
  let bestCategory: Category = "Other";
  let bestScore = 0;
  for (const category of Object.keys(CATEGORY_KEYWORDS) as Category[]) {
    const s = scoreCategory(normalizedText, category);
    if (s > bestScore) {
      bestScore = s;
      bestCategory = category;
    }
  }

  const urgentHits = URGENT_MARKERS.filter((m) => normalizedText.includes(m.toLowerCase())).length;
  const negativeHits = NEGATIVE_MARKERS.filter((m) => normalizedText.includes(m.toLowerCase())).length;

  const urgency = Math.min(5, 1 + urgentHits * 2 + (negativeHits > 0 ? 1 : 0));
  const sentiment = Math.max(-1, Math.min(1, -0.3 * negativeHits + 0.1));

  return {
    category: bestCategory,
    theme: themeFromCategoryAndText(bestCategory, normalizedText),
    keywords: extractKeywords(normalizedText),
    urgency,
    sentiment,
  };
}

async function openAiAnalysis(text: string): Promise<AnalysisResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You classify citizen development requests submitted to a Member of Parliament. " +
              "The text may be in English, Hindi, or Telugu. Respond ONLY with strict JSON: " +
              '{"category": one of ["Education","Health","Roads","Water","Electricity","Sanitation","Employment","Safety","Other"], ' +
              '"theme": short-kebab-case-slug, "keywords": string[] (max 8, in original language or transliterated), ' +
              '"urgency": integer 1-5, "sentiment": float -1..1, "translatedText": English translation of the submission}.',
          },
          { role: "user", content: text },
        ],
        temperature: 0.2,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content);
    return {
      category: parsed.category ?? "Other",
      theme: parsed.theme ?? "general-grievance",
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 8) : [],
      urgency: Math.max(1, Math.min(5, Number(parsed.urgency) || 1)),
      sentiment: Math.max(-1, Math.min(1, Number(parsed.sentiment) || 0)),
      translatedText: parsed.translatedText,
    };
  } catch {
    return null;
  }
}

export async function analyzeSubmission(text: string): Promise<AnalysisResult> {
  const aiResult = await openAiAnalysis(text);
  if (aiResult) return aiResult;
  return ruleBasedAnalysis(text);
}

export function detectSubmissionLanguage(text: string): string {
  return detectLanguage(text);
}
