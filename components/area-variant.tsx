import { format } from "date-fns";
import {
  Tooltip,
  XAxis,
  AreaChart,
  Area,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Props = {
  data: {
    date: string;
    income: number;
    expenses: number;
  }[];
};

export const AreaVariant = ({ data }: Props) => {
  console.log("Summary Data:", data);
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
            <stop offset="2%" stopColor="#3D82F6" stopOpacity={0.8} />
            <stop offset="98%" stopColor="#3D82F6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenses" x1="0" y1="0" x2="0" y2="1">
            <stop offset="2%" stopColor="#f43f5e" stopOpacity={0.8} />
            <stop offset="98%" stopColor="#f43f5e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          axisLine={false}
          tickLine={false}
          dataKey="date"
          tickFormatter={(value) => format(value, "dd MMM")}
          style={{ fontSize: "12px" }}
          tickMargin={16}
        />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="income"
          stroke="#3D82F6"
          fillOpacity={1}
          fill="url(#income)"
        />
        <Area
          type="monotone"
          dataKey="expenses"
          stroke="#f43f5e"
          fillOpacity={1}
          fill="url(#expenses)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
