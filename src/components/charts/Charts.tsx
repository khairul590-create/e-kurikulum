import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

export interface Slice {
  name: string;
  value: number;
  color: string;
}

export function DonutChart({
  data,
  centerLabel,
  centerValue,
}: {
  data: Slice[];
  centerLabel?: string;
  centerValue?: string;
}) {
  return (
    <div className="relative h-44 w-44">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={56}
            outerRadius={80}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: number, n: string) => [v, n]}
            contentStyle={{ borderRadius: 12, border: "1px solid #EAEEF4", fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        {centerLabel && <span className="text-xs text-ink-muted">{centerLabel}</span>}
        <span className="text-2xl font-bold text-ink">{centerValue}</span>
      </div>
    </div>
  );
}

export function TrendLine({ data }: { data: { bulan: string; purata: number }[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} />
          <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(v: number) => [`${v}%`, "Purata"]}
            contentStyle={{ borderRadius: 12, border: "1px solid #EAEEF4", fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="purata"
            stroke="#2563EB"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#2563EB" }}
            activeDot={{ r: 5 }}
            fill="url(#lg)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HBar({
  data,
}: {
  data: { subjek: string; peratus: number; warna: string }[];
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis
            type="category"
            dataKey="subjek"
            width={96}
            tick={{ fontSize: 12, fill: "#475569" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(v: number) => [`${v}%`, "Selesai"]}
            cursor={{ fill: "#F8FAFC" }}
            contentStyle={{ borderRadius: 12, border: "1px solid #EAEEF4", fontSize: 12 }}
          />
          <Bar dataKey="peratus" radius={[0, 6, 6, 0]} barSize={14}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.warna} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
