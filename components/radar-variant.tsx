import {
  RadarChart,
  Radar,
  ResponsiveContainer,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Tooltip,
} from "recharts";
type Props = {
  data?: {
    name: string;
    value: number;
  }[];
};

export const RadarVariant = ({ data = [] }: Props) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        cx="50%"
        cy="50%"
        outerRadius={60}
      >
        <PolarGrid />
        <PolarAngleAxis dataKey="name" style={{ fontSize: 12 }} />
        <PolarRadiusAxis style={{ fontSize: 12 }} />
        <Radar
          name="Categories"
          dataKey="value"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.6}
        />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  );
};
