import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
}> = ({ icon, title, value, color }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-sans font-medium">{title}</CardTitle>
      <div className={color}>{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold font-sans">{value}</div>
    </CardContent>
  </Card>
);

export default StatCard;