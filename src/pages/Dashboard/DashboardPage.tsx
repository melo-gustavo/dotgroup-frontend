import { Skeleton } from "../../components/Skeleton/Skeleton";
import { useDashboard } from "./useDashboard";
import { DashboardCharts } from "./components/DashboardCharts";
import "./style.css";

export function DashboardPage() {
  const { title, description, metrics, loadingMetrics } = useDashboard();

  const totalStudents =
    (metrics.find((m) => m.label === "Total de alunos")?.value as number) || 0;
  const totalCourses =
    (metrics.find((m) => m.label === "Cursos ativos")?.value as number) || 0;
  const totalClasses =
    (metrics.find((m) => m.label === "Total de turmas")?.value as number) || 0;
  const classesStartingSoon =
    (metrics.find((m) => m.label === "Turmas a iniciar")?.value as number) || 0;
  const classesRunning =
    (metrics.find((m) => m.label === "Turmas iniciadas")?.value as number) ||
    0;
  const finishedClasses =
    (metrics.find((m) => m.label === "Turmas finalizadas")?.value as number) ||
    0;

  return (
    <section className="dashboard-page">
      <article className="dashboard-hero-card">
        <p className="dashboard-eyebrow">Visão Geral</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </article>

      <div className="dashboard-summary-grid" aria-label="Resumo rápido">
        {loadingMetrics
          ? Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} variant="card" />
            ))
          : metrics.map((metric) => (
              <article key={metric.label} className="dashboard-summary-card">
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </article>
            ))}
      </div>

      {!loadingMetrics && (
        <DashboardCharts
          totalStudents={totalStudents}
          totalCourses={totalCourses}
          totalClasses={totalClasses}
          classesStartingSoon={classesStartingSoon}
          classesRunning={classesRunning}
          finishedClasses={finishedClasses}
        />
      )}
    </section>
  );
}
