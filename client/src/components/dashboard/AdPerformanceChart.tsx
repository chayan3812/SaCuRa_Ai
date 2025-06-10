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
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: window.innerWidth < 640 ? 11 : 12,
          },
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'hsl(217, 91%, 60%)',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'hsl(240, 5.9%, 90%)',
        },
        ticks: {
          font: {
            size: window.innerWidth < 640 ? 10 : 11,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: window.innerWidth < 640 ? 10 : 11,
          },
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <CardTitle className="text-base sm:text-lg font-semibold">Ad Performance Trends</CardTitle>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button size="sm" variant="default" className="text-xs sm:text-sm px-2 sm:px-3">7D</Button>
            <Button size="sm" variant="outline" className="text-xs sm:text-sm px-2 sm:px-3">30D</Button>
            <Button size="sm" variant="outline" className="text-xs sm:text-sm px-2 sm:px-3">90D</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="chart-container h-64 sm:h-72 md:h-80 lg:h-96 w-full">
          <Line data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
