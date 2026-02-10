import { useEffect, useState } from "react";
import { getRequest } from "../../lib/api/httpClient";

interface Metric {
  label: string;
  value: string | number;
}

interface DashboardClass {
  startDate?: string;
  endDate?: string;
}

export function useDashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  async function loadMetrics() {
    try {
      setLoadingMetrics(true);

      // Fetch all data in parallel
      const [usersData, coursesData, classesData] = await Promise.all([
        getRequest<unknown[]>("/users").catch(() => []),
        getRequest<unknown[]>("/courses").catch(() => []),
        getRequest<DashboardClass[]>("/classes").catch(() => []),
      ]);

      const totalStudents = usersData?.length ?? 0;
      const totalCourses = coursesData?.length ?? 0;
      const totalClasses = classesData?.length ?? 0;

      // Calculate classes by status
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let startingSoon = 0;
      let running = 0;

      classesData?.forEach((cls) => {
        const startDate = cls.startDate ? new Date(cls.startDate) : null;
        const endDate = cls.endDate ? new Date(cls.endDate) : null;

        if (startDate) {
          startDate.setHours(0, 0, 0, 0);
          if (startDate > today) {
            startingSoon++;
          } else if (endDate) {
            endDate.setHours(0, 0, 0, 0);
            if (endDate >= today) {
              running++;
            }
          }
        }
      });

      setMetrics([
        { label: "Total de alunos", value: totalStudents },
        { label: "Cursos ativos", value: totalCourses },
        { label: "Total de turmas", value: totalClasses },
        { label: "Turmas a iniciar", value: startingSoon },
        { label: "Turmas iniciadas", value: running },
        {
          label: "Turmas finalizadas",
          value: totalClasses - startingSoon - running,
        },
      ]);
    } catch (error) {
      console.error("Falha ao carregar métricas do painel:", error);
      setMetrics([
        { label: "Total de alunos", value: 0 },
        { label: "Cursos ativos", value: 0 },
        { label: "Total de turmas", value: 0 },
        { label: "Turmas a iniciar", value: 0 },
        { label: "Turmas iniciadas", value: 0 },
        { label: "Turmas finalizadas", value: 0 },
      ]);
    } finally {
      setLoadingMetrics(false);
    }
  }

  return {
    loadingMetrics,
    title: "Painel da Escola",
    description:
      "Acompanhe os principais indicadores da escola e acesse rapidamente os módulos operacionais.",
    metrics,
  };
}
