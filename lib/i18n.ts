export type Lang = "en" | "hi" | "te";

export const LANG_LABELS: Record<Lang, string> = {
  en: "English",
  hi: "हिन्दी",
  te: "తెలుగు",
};

export const SPEECH_LOCALE: Record<Lang, string> = {
  en: "en-IN",
  hi: "hi-IN",
  te: "te-IN",
};

export const dict = {
  en: {
    tagline: "Tell your MP what your area needs — in your own language.",
    heroTitle: "People's Priorities",
    heroSubtitle: "AI for Constituency Development Planning",
    formTitle: "Submit a development suggestion",
    category: "Category",
    ward: "Locality / Ward",
    describeIssue: "Describe your suggestion or issue",
    describePlaceholder: "e.g. Our school is overcrowded, we need a new building near...",
    recordVoice: "Record voice",
    stopRecording: "Stop recording",
    listening: "Listening…",
    attachPhoto: "Attach a photo (optional)",
    name: "Your name (optional)",
    contact: "Phone / contact (optional)",
    submit: "Submit suggestion",
    submitting: "Analyzing & submitting…",
    submitted: "Thank you! Your submission has been recorded and analyzed.",
    viewDashboard: "View MP Dashboard",
    selectWard: "Select your locality",
    selectCategory: "Auto-detect (recommended)",
  },
  hi: {
    tagline: "अपने सांसद को बताएं कि आपके क्षेत्र को क्या चाहिए — अपनी भाषा में।",
    heroTitle: "जनता की प्राथमिकताएं",
    heroSubtitle: "निर्वाचन क्षेत्र विकास योजना के लिए एआई",
    formTitle: "विकास सुझाव सबमिट करें",
    category: "श्रेणी",
    ward: "इलाका / वार्ड",
    describeIssue: "अपना सुझाव या समस्या बताएं",
    describePlaceholder: "जैसे: हमारा स्कूल बहुत भीड़भाड़ वाला है...",
    recordVoice: "आवाज़ रिकॉर्ड करें",
    stopRecording: "रिकॉर्डिंग रोकें",
    listening: "सुन रहा है…",
    attachPhoto: "फोटो जोड़ें (वैकल्पिक)",
    name: "आपका नाम (वैकल्पिक)",
    contact: "फोन / संपर्क (वैकल्पिक)",
    submit: "सुझाव सबमिट करें",
    submitting: "विश्लेषण और सबमिट हो रहा है…",
    submitted: "धन्यवाद! आपका सुझाव दर्ज और विश्लेषित कर लिया गया है।",
    viewDashboard: "सांसद डैशबोर्ड देखें",
    selectWard: "अपना इलाका चुनें",
    selectCategory: "स्वतः पहचान (अनुशंसित)",
  },
  te: {
    tagline: "మీ ప్రాంతానికి ఏమి కావాలో మీ ఎంపీకి తెలియజేయండి — మీ భాషలో.",
    heroTitle: "ప్రజల ప్రాధాన్యతలు",
    heroSubtitle: "నియోజకవర్గ అభివృద్ధి ప్రణాళిక కోసం ఏఐ",
    formTitle: "అభివృద్ధి సూచనను సమర్పించండి",
    category: "వర్గం",
    ward: "ప్రాంతం / వార్డు",
    describeIssue: "మీ సూచన లేదా సమస్యను వివరించండి",
    describePlaceholder: "ఉదా: మా పాఠశాల చాలా రద్దీగా ఉంది...",
    recordVoice: "వాయిస్ రికార్డ్ చేయండి",
    stopRecording: "రికార్డింగ్ ఆపండి",
    listening: "వింటోంది…",
    attachPhoto: "ఫోటో జోడించండి (ఐచ్ఛికం)",
    name: "మీ పేరు (ఐచ్ఛికం)",
    contact: "ఫోన్ / సంప్రదింపు (ఐచ్ఛికం)",
    submit: "సూచనను సమర్పించండి",
    submitting: "విశ్లేషిస్తూ సమర్పిస్తోంది…",
    submitted: "ధన్యవాదాలు! మీ సూచన నమోదు చేయబడింది మరియు విశ్లేషించబడింది.",
    viewDashboard: "ఎంపీ డాష్‌బోర్డ్ చూడండి",
    selectWard: "మీ ప్రాంతాన్ని ఎంచుకోండి",
    selectCategory: "స్వయంచాలక గుర్తింపు (సిఫార్సు)",
  },
} as const;

export function t(lang: Lang, key: keyof typeof dict["en"]): string {
  return dict[lang][key] ?? dict.en[key];
}
