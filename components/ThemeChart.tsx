"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface CategoryCount {
  category: string;
  count: number;
}

export default function ThemeChart() {
  const [categories, setCategories] = useState<CategoryCount[]>([]);

  useEffect(() => {
    fetch("/api/themes")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []));
  }, []);

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={categories} margin={{ top: 8, right: 16, left: -16, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="category" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="count" fill="#2854d6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
