import { PrismaClient } from "@prisma/client";
import { analyzeSubmission } from "../lib/nlp";

const prisma = new PrismaClient();

const WARDS = [
  {
    name: "Ashok Nagar",
    population: 42000,
    lat: 17.385,
    lng: 78.4867,
    schoolCount: 3,
    avgSchoolEnrollment: 58,
    avgSchoolDistanceKm: 4.2,
    healthCentreCount: 1,
    literacyRatePct: 68,
    unemploymentRatePct: 14,
    roadConditionIndex: 4.5,
    waterAccessPct: 72,
    electrificationPct: 91,
  },
  {
    name: "Ganesh Nagar",
    population: 31000,
    lat: 17.401,
    lng: 78.5011,
    schoolCount: 2,
    avgSchoolEnrollment: 65,
    avgSchoolDistanceKm: 6.8,
    healthCentreCount: 0,
    literacyRatePct: 61,
    unemploymentRatePct: 19,
    roadConditionIndex: 3.1,
    waterAccessPct: 58,
    electrificationPct: 84,
  },
  {
    name: "Lakshmi Colony",
    population: 27500,
    lat: 17.372,
    lng: 78.4695,
    schoolCount: 4,
    avgSchoolEnrollment: 40,
    avgSchoolDistanceKm: 2.1,
    healthCentreCount: 2,
    literacyRatePct: 79,
    unemploymentRatePct: 9,
    roadConditionIndex: 6.8,
    waterAccessPct: 88,
    electrificationPct: 97,
  },
  {
    name: "Ravindra Nagar",
    population: 38700,
    lat: 17.41,
    lng: 78.455,
    schoolCount: 2,
    avgSchoolEnrollment: 72,
    avgSchoolDistanceKm: 7.5,
    healthCentreCount: 1,
    literacyRatePct: 55,
    unemploymentRatePct: 22,
    roadConditionIndex: 2.4,
    waterAccessPct: 49,
    electrificationPct: 78,
  },
  {
    name: "Shanti Nagar",
    population: 21300,
    lat: 17.393,
    lng: 78.512,
    schoolCount: 1,
    avgSchoolEnrollment: 51,
    avgSchoolDistanceKm: 5.4,
    healthCentreCount: 1,
    literacyRatePct: 71,
    unemploymentRatePct: 12,
    roadConditionIndex: 5.6,
    waterAccessPct: 80,
    electrificationPct: 95,
  },
];

const SAMPLE_SUBMISSIONS: { text: string; lang: string; channel: string }[] = [
  { text: "The government school in our area is overcrowded, classrooms have 70+ students, we urgently need a new school building.", lang: "en", channel: "web" },
  { text: "Children have to walk more than 6 km to reach the nearest secondary school, please sanction a school closer to Ravindra Nagar.", lang: "en", channel: "portal" },
  { text: "हमारे मोहल्ले में स्कूल बहुत दूर है, बच्चों को पैदल जाना पड़ता है, कृपया नया स्कूल बनवाएं।", lang: "hi", channel: "voice" },
  { text: "There is no vocational training centre nearby, youth are unemployed, please set up a skill training centre urgently.", lang: "en", channel: "web" },
  { text: "నిరుద్యోగం చాలా ఎక్కువగా ఉంది, యువతకు శిక్షణ కేంద్రం అవసరం.", lang: "te", channel: "whatsapp" },
  { text: "No primary health centre in Ganesh Nagar, patients travel far for basic treatment, this is an emergency situation.", lang: "en", channel: "meeting" },
  { text: "अस्पताल में डॉक्टर नहीं हैं, यह आपातकाल जैसी स्थिति है, कृपया तुरंत ध्यान दें।", lang: "hi", channel: "letter" },
  { text: "Roads in Ravindra Nagar are full of potholes, there was an accident last week, urgent repair needed.", lang: "en", channel: "web" },
  { text: "सड़क में बड़े गड्ढे हैं, कल एक दुर्घटना हुई, तुरंत मरम्मत करवाएं।", lang: "hi", channel: "voice" },
  { text: "రోడ్డు గుంతలతో నిండి ఉంది, ప్రమాదాలు జరుగుతున్నాయి, వెంటనే మరమ్మతు చేయాలి.", lang: "te", channel: "portal" },
  { text: "No drinking water supply for 3 days in Ravindra Nagar, this is a serious shortage, please act urgently.", lang: "en", channel: "grievance-portal" },
  { text: "पानी की कमी है, नल में पानी नहीं आ रहा, कृपया जल्द समाधान करें।", lang: "hi", channel: "web" },
  { text: "Frequent power cuts and old transformer keeps failing, request an urgent transformer upgrade.", lang: "en", channel: "web" },
  { text: "బిజీ ట్రాన్స్‌ఫార్మర్ తరచుగా పాడైపోతోంది, వెంటనే మార్చాలి.", lang: "te", channel: "whatsapp" },
  { text: "Garbage is not collected regularly, waste piles up near the market, please improve sanitation and waste collection.", lang: "en", channel: "portal" },
  { text: "कचरा नहीं उठाया जाता, गंदगी फैली है, सफाई व्यवस्था सुधारें।", lang: "hi", channel: "meeting" },
  { text: "Women feel unsafe walking at night due to lack of street lighting, please install CCTV and street lights for women safety.", lang: "en", channel: "web" },
  { text: "स्ट्रीट लाइट न होने से रात में सुरक्षा की समस्या है, कृपया लाइट लगवाएं।", lang: "hi", channel: "voice" },
  { text: "We need a vocational training centre for youth instead of another school, there is high unemployment here.", lang: "en", channel: "meeting" },
  { text: "The existing school building is in poor condition and needs urgent renovation, roof is leaking.", lang: "en", channel: "web" },
  { text: "Enrollment in our local school has doubled but no new teachers were added, request additional staff and classrooms.", lang: "en", channel: "letter" },
  { text: "Hospital in Lakshmi Colony lacks an ambulance, patients face delays reaching bigger hospitals in emergencies.", lang: "en", channel: "grievance-portal" },
  { text: "No proper drainage system, streets flood every monsoon, please fix drainage urgently.", lang: "en", channel: "web" },
  { text: "నీటి పారుదల సరిగా లేదు, వర్షాకాలంలో వీధులు మునిగిపోతున్నాయి.", lang: "te", channel: "portal" },
  { text: "Request for a new borewell as the existing water source has dried up completely in summer.", lang: "en", channel: "web" },
];

const WARD_ASSIGNMENT = [0, 3, 3, 1, 1, 1, 0, 3, 3, 3, 3, 3, 1, 1, 4, 4, 2, 2, 3, 0, 0, 2, 1, 1, 1];

async function main() {
  console.log("Seeding wards...");
  const createdWards = [];
  for (const w of WARDS) {
    const ward = await prisma.ward.create({ data: w });
    createdWards.push(ward);
  }

  console.log("Seeding + analyzing submissions...");
  for (let i = 0; i < SAMPLE_SUBMISSIONS.length; i++) {
    const s = SAMPLE_SUBMISSIONS[i];
    const analysis = await analyzeSubmission(s.text);
    const ward = createdWards[WARD_ASSIGNMENT[i] ?? 0];
    const daysAgo = Math.floor(Math.random() * 60);
    await prisma.submission.create({
      data: {
        channel: s.channel,
        language: s.lang,
        rawText: s.text,
        translatedText: analysis.translatedText,
        category: analysis.category,
        theme: analysis.theme,
        keywords: analysis.keywords.join(","),
        urgency: analysis.urgency,
        sentiment: analysis.sentiment,
        wardId: ward.id,
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log("Seeding sample development plan projects...");
  await prisma.developmentProject.createMany({
    data: [
      {
        title: "Vocational Training Centre - Ravindra Nagar",
        category: "Employment",
        wardId: createdWards[3].id,
        description: "Proposed multi-skill vocational training centre in the Local Development Plan 2026.",
        estimatedCostLakhs: 85,
        proposedBy: "Local Development Plan 2026",
      },
      {
        title: "Secondary School Building - Ganesh Nagar",
        category: "Education",
        wardId: createdWards[1].id,
        description: "New secondary school building proposed to reduce travel distance for students.",
        estimatedCostLakhs: 120,
        proposedBy: "Local Development Plan 2026",
      },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
