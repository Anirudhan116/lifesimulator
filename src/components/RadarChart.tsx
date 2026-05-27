'use client';

import {
  Radar,
  RadarChart as ReChartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface RadarDataPoint {
  subject: string;
  [key: string]: string | number; // Dynamic key for each scenario
}

interface RadarChartProps {
  data: RadarDataPoint[];
  scenarios: { id: string; name: string; color: string }[];
}

export default function RadarChart({ data, scenarios }: RadarChartProps) {
  return (
    <div className="w-full h-80 sm:h-96 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <ReChartsRadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
          
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
          />
          
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={{ fill: '#475569', fontSize: 9 }}
            axisLine={false}
          />
          
          {scenarios.map((sc) => (
            <Radar
              key={sc.id}
              name={sc.name}
              dataKey={sc.id}
              stroke={sc.color}
              fill={sc.color}
              fillOpacity={0.15}
            />
          ))}
          
          <Legend 
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '11px',
              color: '#cbd5e1'
            }}
          />
        </ReChartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
