import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import "./charts-style.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

interface DashboardChartsProps {
  totalStudents: number;
  totalCourses: number;
  totalClasses: number;
  classesStartingSoon: number;
  classesRunning: number;
  finishedClasses: number;
}

export function DashboardCharts({
  totalStudents,
  totalCourses,
  totalClasses,
  classesStartingSoon,
  classesRunning,
  finishedClasses,
}: DashboardChartsProps) {
  const classesStatusData = {
    labels: ["A iniciar", "Em andamento", "Finalizadas"],
    datasets: [
      {
        label: "Turmas por Status",
        data: [classesStartingSoon, classesRunning, finishedClasses],
        backgroundColor: ["#dcfce7", "#86efac", "#fef3c7"],
        borderColor: ["#16a34a", "#22c55e", "#ca8a04"],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const classesStatusOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 15,
          font: {
            size: 13,
            weight: 500,
          },
        },
      },
      title: {
        display: true,
        text: "Status das Turmas",
        font: {
          size: 16,
          weight: 600,
        },
        padding: 20,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: Math.max(classesStartingSoon, classesRunning, finishedClasses, 10),
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const resourcesData = {
    labels: ["Alunos", "Cursos", "Turmas"],
    datasets: [
      {
        label: "Visão Geral de Recursos",
        data: [totalStudents, totalCourses, totalClasses],
        backgroundColor: ["#dbeafe", "#dcfce7", "#fef3c7"],
        borderColor: ["#0284c7", "#16a34a", "#ca8a04"],
        borderWidth: 2,
      },
    ],
  };

  const resourcesOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 15,
          font: {
            size: 13,
            weight: 500,
          },
        },
      },
      title: {
        display: true,
        text: "Visão Geral de Recursos",
        font: {
          size: 16,
          weight: 600,
        },
        padding: 20,
      },
    },
  };

  return (
    <div className="dashboard-charts-container">
      <div className="dashboard-chart-card">
        <Bar data={classesStatusData} options={classesStatusOptions} />
      </div>
      <div className="dashboard-chart-card">
        <Doughnut data={resourcesData} options={resourcesOptions} />
      </div>
    </div>
  );
}
