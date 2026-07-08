"use client";

import React, { useEffect, useState } from "react";

interface PriorityItem {
  theme: string;
  category: string;
  wardName: string | null;
  submissionCount: number;
  avgUrgency: number;
  needGapScore: number;
  demandScore: number;
  recencyScore: number;
  totalScore: number;
  sampleText: string;
}

const DEFAULT_WEIGHTS = { demand: 0.35, urgency: 0.25, needGap: 0.3, recency: 0.1 };

export default function PriorityTable() {
  const [items, setItems] = useState<PriorityItem[]>([]);
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      demand: String(weights.demand),
      urgency: String(weights.urgency),
      needGap: String(weights.needGap),
      recency: String(weights.recency),
    });
    fetch(`/api/priorities?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setItems(d.priorities ?? []))
      .finally(() => setLoading(false));
  }, [weights]);

  function updateWeight(key: keyof typeof weights, value: number) {
    setWeights((w) => ({ ...w, [key]: value }));
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 bg-white border border-slate-200 rounded-xl p-4">
        {(Object.keys(weights) as (keyof typeof weights)[]).map((key) => (
          <div key={key}>
            <label className="text-xs font-medium text-slate-500 capitalize block mb-1">
              {key === "needGap" ? "Need gap" : key} weight ({weights[key].toFixed(2)})
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={weights[key]}
              onChange={(e) => updateWeight(key, Number(e.target.value))}
              className="w-full accent-brand-600"
            />
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Rank</th>
              <th className="text-left px-4 py-3">Theme</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-left px-4 py-3">Ward</th>
              <th className="text-right px-4 py-3">Demand</th>
              <th className="text-right px-4 py-3">Urgency</th>
              <th className="text-right px-4 py-3">Need gap</th>
              <th className="text-right px-4 py-3">Score</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="text-center py-8 text-slate-400">
                  Loading priorities…
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-8 text-slate-400">
                  No submissions yet.
                </td>
              </tr>
            )}
            {items.map((item, i) => {
              const key = `${item.theme}-${item.wardName}`;
              const isExpanded = expanded === key;
              return (
                <React.Fragment key={key}>
                  <tr
                    onClick={() => setExpanded(isExpanded ? null : key)}
                    className="border-t border-slate-100 hover:bg-brand-50/40 cursor-pointer"
                  >
                    <td className="px-4 py-3 font-semibold text-brand-700">#{i + 1}</td>
                    <td className="px-4 py-3">{item.theme.replace(/-/g, " ")}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">{item.wardName ?? "—"}</td>
                    <td className="px-4 py-3 text-right">{item.submissionCount}</td>
                    <td className="px-4 py-3 text-right">{item.avgUrgency}/5</td>
                    <td className="px-4 py-3 text-right">{item.needGapScore}</td>
                    <td className="px-4 py-3 text-right font-bold text-brand-900">{item.totalScore}</td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-slate-50 border-t border-slate-100">
                      <td colSpan={8} className="px-4 py-3 text-slate-600">
                        <p className="italic mb-1">"{item.sampleText}"</p>
                        <p className="text-xs text-slate-400">
                          Score breakdown — demand {item.demandScore}, urgency {Math.round((item.avgUrgency / 5) * 100)},
                          need gap {item.needGapScore}, recency {item.recencyScore}
                        </p>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
