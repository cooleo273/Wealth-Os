'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonthlyHistoryEntry } from '@wealth/types';

interface WealthChartProps {
  data?: MonthlyHistoryEntry[];
}

export function WealthChart({ data }: WealthChartProps) {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Portfolio Growth</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={data ?? []}
            margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="wealthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(262.1, 83.3%, 57.8%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(262.1, 83.3%, 57.8%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(v: number) =>
                v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
              }
            />
            <Tooltip
              formatter={(value: number) =>
                new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(value)
              }
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(262.1, 83.3%, 57.8%)"
              strokeWidth={2}
              fill="url(#wealthGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
