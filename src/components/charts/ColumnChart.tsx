import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export interface Column {
  label: string;
  value: number;
  color: string;
}

/** Carta bar menegak (cth taburan TP1–TP6). */
export function ColumnChart({
  data,
  height = 220,
  valueLabel = "Bilangan",
}: {
  data: Column[];
  height?: number;
  valueLabel?: string;
}) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 16, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            formatter={(v: number) => [v, valueLabel]}
            cursor={{ fill: "#F8FAFC" }}
            contentStyle={{ borderRadius: 12, border: "1px solid #EAEEF4", fontSize: 12 }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={34}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
