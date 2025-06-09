import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdPerformanceChart() {
  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Spend ($)',
        data: [2100, 2400, 2800, 2600, 3200, 2900, 2847],
        borderColor: 'hsl(217, 91%, 60%)',
        backgroundColor: 'hsl(217, 91%, 60%, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Conversions',
        data: [45, 52, 48, 61, 58, 67, 72],
        borderColor: 'hsl(142, 76%, 36%)',
        backgroundColor: 'hsl(142, 76%, 36%, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'hsl(240, 5.9%, 90%)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Ad Performance Trends</CardTitle>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="default">7D</Button>
            <Button size="sm" variant="outline">30D</Button>
            <Button size="sm" variant="outline">90D</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="chart-container">
          <Line data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
