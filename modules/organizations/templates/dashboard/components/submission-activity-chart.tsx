"use client";

import { format, parseISO } from "date-fns";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { OrganizationDashboard } from "@/router/orgs/dashboard";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/modules/shared/components/ui/chart";

export function SubmissionActivityChart({ dashboard }: { dashboard: OrganizationDashboard }) {
  const counts = new Map(dashboard.activity.map((day) => [day.date, day.count]));
  const data: Array<{ date: string; count: number }> = [];
  const day = new Date(dashboard.period.from);
  const before = new Date(dashboard.period.before);
  while (day < before) {
    const date = format(day, "yyyy-MM-dd");
    data.push({ date, count: counts.get(date) ?? 0 });
    day.setDate(day.getDate() + 1);
  }

  return (
    <ChartContainer
      className="h-64 w-full aspect-auto"
      config={{ count: { label: "Submissions", color: "var(--primary)" } }}
      role="img"
      aria-label={`${dashboard.summary.submissions} completed submissions from ${format(new Date(dashboard.period.from), "MMM d")} through ${format(parseISO(data[data.length - 1].date), "MMM d")}. Daily counts are available in the chart tooltip.`}
    >
      <BarChart data={data} accessibilityLayer margin={{ top: 12, right: 4, bottom: 0, left: -18 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(value: string) => format(parseISO(value), "MMM d")}
          tickLine={false}
          axisLine={false}
          minTickGap={28}
          tickMargin={12}
        />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} width={48} />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.5 }}
          content={
            <ChartTooltipContent
              labelFormatter={(value) => format(parseISO(String(value)), "EEEE, MMM d")}
              formatter={(value) => (
                <div className="flex w-full items-center justify-between gap-6">
                  <span className="text-muted-foreground">Submissions</span>
                  <span className="font-medium tabular-nums">{Number(value).toLocaleString()}</span>
                </div>
              )}
            />
          }
        />
        <Bar
          dataKey="count"
          fill="var(--color-count)"
          radius={[4, 4, 0, 0]}
          maxBarSize={36}
          isAnimationActive={false}
        />
      </BarChart>
    </ChartContainer>
  );
}
