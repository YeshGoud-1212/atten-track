import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface AttendanceChartProps {
  attended: number;
  total: number;
}

const AttendanceChart: React.FC<AttendanceChartProps> = ({ attended, total }) => {
  const missed = total - attended;
  const data = [
    { name: 'Attended', value: attended, color: '#10b981' },
    { name: 'Missed', value: missed, color: '#ef4444' },
  ];

  const COLORS = ['hsl(var(--success))', 'hsl(var(--destructive))'];

  return (
    <div className="glass-card hover-lift w-full h-80">
      <h3 className="text-xl font-bold text-center mb-4 neon-text">
        📊 Attendance Overview
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              color: '#fff'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{background: COLORS[0]}}></div>
          <span className="text-sm">Attended ({attended})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{background: COLORS[1]}}></div>
          <span className="text-sm">Missed ({missed})</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceChart;