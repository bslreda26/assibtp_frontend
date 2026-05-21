import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { FleetBreakdownItem } from '@/types/dashboard'

type FleetStatusChartProps = {
  data: FleetBreakdownItem[]
  loading?: boolean
}

export function FleetStatusChart({ data, loading }: FleetStatusChartProps) {
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base">Répartition de la flotte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mx-auto h-64 w-64 animate-pulse rounded-full bg-muted" />
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base">Répartition de la flotte</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-12 text-center text-sm text-muted-foreground">
            Aucune grue enregistrée.
          </p>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((item) => ({
    name: item.label,
    value: item.value,
    fill: item.color,
  }))

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Répartition de la flotte</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value ?? 0} grue(s)`, '']}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontSize: '13px',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
