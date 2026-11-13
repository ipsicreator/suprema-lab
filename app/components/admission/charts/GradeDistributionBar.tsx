"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface GradeDistributionBarProps {
  distribution: { A: number; B: number; C: number; n: number };
  subjectName: string;
}

export default function GradeDistributionBar({ distribution, subjectName }: GradeDistributionBarProps) {
  const data = [
    { name: 'A', value: distribution.A },
    { name: 'B', value: distribution.B },
    { name: 'C', value: distribution.C }
  ];

  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
          <Tooltip formatter={(value) => [`${value}%`, '비율']} cursor={{fill: '#f1f5f9'}} />
          <Bar dataKey="value" fill="#3b82f6" name={`${subjectName} (n=${distribution.n})`} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


