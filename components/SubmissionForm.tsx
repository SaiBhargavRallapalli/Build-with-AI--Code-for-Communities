"use client";

import { useEffect, useRef, useState } from "react";
import { Lang, LANG_LABELS, SPEECH_LOCALE, t } from "@/lib/i18n";

interface Ward {
  id: string;
  name: string;
}

const CATEGORIES = ["Education", "Health", "Roads", "Water", "Electricity", "Sanitation", "Employment", "Safety", "Other"];

export default function SubmissionForm() {
  const [lang, setLang] = useState<Lang>("en");
  const [wards, setWards] = useState<Ward[]>([]);
  const [wardId, setWardId] = useState("");
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ category: string; theme: string; urgency: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    fetch("/api/wards")
      .then((r) => r.json())
      .then((d) => setWards(d.wards ?? []))
      .catch(() => {});
  }, []);

  function toggleVoice() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice input is not supported in this browser. Please type your suggestion instead.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = SPEECH_LOCALE[lang];
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setError("Photo must be under 4MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          channel: "web",
          wardId: wardId || null,
          citizenName: name || null,
          contact: contact || null,
          photoUrl: photo,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setResult({ category: data.analysis.category, theme: data.analysis.theme, urgency: data.analysis.urgency });
      setText("");
      setPhoto(null);
      setName("");
      setContact("");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex justify-end gap-2 mb-4">
        {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-3 py-1 rounded-full text-sm border transition ${
              lang === l ? "bg-brand-600 text-white border-brand-600" : "bg-white text-slate-600 border-slate-300"
            }`}
          >
            {LANG_LABELS[l]}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-brand-900 mb-1">{t(lang, "formTitle")}</h2>
        <p className="text-slate-500 text-sm mb-6">{t(lang, "tagline")}</p>

        {result ? (
          <div className="rounded-xl bg-green-50 border border-green-200 p-5 text-green-800">
            <p className="font-medium mb-2">{t(lang, "submitted")}</p>
            <p className="text-sm">
              Category: <span className="font-semibold">{result.category}</span> · Theme:{" "}
              <span className="font-semibold">{result.theme}</span> · Urgency:{" "}
              <span className="font-semibold">{result.urgency}/5</span>
            </p>
            <button
              onClick={() => setResult(null)}
              className="mt-4 text-sm font-medium text-brand-600 hover:text-brand-700 underline"
            >
              Submit another suggestion
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t(lang, "ward")}</label>
              <select
                value={wardId}
                onChange={(e) => setWardId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">{t(lang, "selectWard")}</option>
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t(lang, "describeIssue")}</label>
              <textarea
                required
                minLength={5}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t(lang, "describePlaceholder")}
                rows={5}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={toggleVoice}
                className={`mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border ${
                  isListening ? "bg-red-50 border-red-300 text-red-700" : "bg-brand-50 border-brand-200 text-brand-700"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${isListening ? "bg-red-500 animate-pulse" : "bg-brand-500"}`} />
                {isListening ? `${t(lang, "listening")} ${t(lang, "stopRecording")}` : t(lang, "recordVoice")}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t(lang, "attachPhoto")}</label>
              <input type="file" accept="image/*" onChange={handlePhoto} className="text-sm" />
              {photo && <img src={photo} alt="preview" className="mt-2 h-24 rounded-lg object-cover border" />}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t(lang, "name")}</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t(lang, "contact")}</label>
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition"
            >
              {submitting ? t(lang, "submitting") : t(lang, "submit")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
