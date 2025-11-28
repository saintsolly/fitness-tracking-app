import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Card from './Card';

export default function Sparkline({ title, data, dataKey = 'value' }) {
  return (
    <Card className="sparkline-card">
      <header className="list-header">
        <h3>{title}</h3>
      </header>
      <div className="sparkline">
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip formatter={(value) => value.toLocaleString()} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke="var(--accent)"
              fillOpacity={1}
              fill="url(#sparkGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

