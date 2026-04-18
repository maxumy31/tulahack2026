"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';


export default function StatusPieChart({ data = [], title = "NaN" }: StatusPieChartProps) {
  return (
    <div className="card bg-base-100 border border-gray-200">
      <div className="card-body">
        <h2 className="card-title mx-auto">{title}</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="80%"
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--b1))', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

interface StatusPieChartProps {
  data: StatusPieChartData[],
  title : string,
}

type StatusPieChartData = {
  name: string,
  value: number,
  color: string,
}