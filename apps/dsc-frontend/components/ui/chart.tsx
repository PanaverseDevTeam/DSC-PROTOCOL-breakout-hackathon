// components/ui/chart.tsx
import { Bar, Line, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LineController,
  Filler,
  ArcElement,
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LineController,
  Filler,
  ArcElement,
)

export const BarChart = ({ data, options }: { data: any; options: any }) => {
  return <Bar data={data} options={options} />
}

export const LineChart = ({ data, options }: { data: any; options: any }) => {
  return <Line data={data} options={options} />
}

export const PieChart = ({ data, options }: { data: any; options: any }) => {
  return <Pie data={data} options={options} />
}
