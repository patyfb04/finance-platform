import {
  Tooltip,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  Pie,
  Cell,
  PieChart,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { CustomTooltip } from "./custom-tooltip";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { CategoryTooltip } from "./category-tooltip";

const COLORS = ["#0062FF", "#12C6FF", "#FF647F", "#FF9354"];

type Props = {
  data?: {
    name: string;
    value: number;
  }[];
};

export const RadialVariant = ({ data = [] }: Props) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <ResponsiveContainer width="100%" height={350}>
      <RadialBarChart
        cx="50%"
        cy="30%"
        innerRadius="40%"
        outerRadius="90%"
        data={data.map((item, index) => ({
          ...item,
          fill: COLORS[index % COLORS.length],
        }))}
        barSize={10}
      >
        <RadialBar
          label={{ position: "insideStart", fill: "#fff", fontSize: 12 }}
          background
          dataKey="value"
        ></RadialBar>
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="right"
          iconType="circle"
          content={({ payload }) => {
            return (
              <ul className="flex flex-col space-y-2">
                {payload?.map((entry, index) => {
                  const dataItem = data.find(
                    (item) => item.name === entry.value
                  );
                  const percentage = dataItem
                    ? (dataItem.value / total) * 100
                    : 0;

                  return (
                    <li
                      key={`item-${index}`}
                      className="flex items-center space-x-2"
                    >
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <div className="space-x-1">
                        <span className="text-sm text-muted-foreground">
                          {entry.value}
                        </span>
                        <span className="text-sm">
                          {formatCurrency(entry.payload?.value)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            );
          }}
        />
        <Tooltip content={<CategoryTooltip />} />
      </RadialBarChart>
    </ResponsiveContainer>
  );
};
