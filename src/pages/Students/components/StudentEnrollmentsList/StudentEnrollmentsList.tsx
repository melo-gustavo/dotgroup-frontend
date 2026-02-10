import { useState } from "react";
import { Button } from "../../../../components/Button/Button";
import { Skeleton } from "../../../../components/Skeleton/Skeleton";
import type { Enrollment } from "../../../Classes/types";
import "./style.css";

type StudentEnrollmentsListProps = {
  enrollments: Enrollment[];
  loading: boolean;
  onDeleteEnrollment: (enrollmentId: string | number) => Promise<void>;
  isDeleting: boolean;
};

function formatDate(dateString?: string): string {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleDateString("pt-BR");
  } catch {
    return "-";
  }
}

export function StudentEnrollmentsList({
  enrollments,
  loading,
  onDeleteEnrollment,
  isDeleting,
}: StudentEnrollmentsListProps) {
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const handleDelete = async (enrollmentId: string | number) => {
    setDeletingId(enrollmentId);
    try {
      await onDeleteEnrollment(enrollmentId);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="student-enrollments-container">
        <div className="student-enrollments-loading">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} variant="card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="student-enrollments-container">
      {enrollments.length === 0 ? (
        <div className="student-enrollments-empty">
          <p>Este aluno ainda não está matriculado em nenhuma turma.</p>
        </div>
      ) : (
        <div className="student-enrollments-list">
          <div className="student-enrollments-header">
            <div className="student-enrollment-header-cell class-name">
              <span>Turma</span>
            </div>
            <div className="student-enrollment-header-cell start-date">
              <span>Data Início</span>
            </div>
            <div className="student-enrollment-header-cell end-date">
              <span>Data Fim</span>
            </div>
            <div className="student-enrollment-header-cell action">
              <span>Ação</span>
            </div>
          </div>
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="student-enrollment-row"
              data-id={enrollment.id}
            >
              <div className="student-enrollment-cell class-name">
                <span>{enrollment.className || "Turma sem nome"}</span>
              </div>
              <div className="student-enrollment-cell start-date">
                <span>{formatDate(enrollment.startDate)}</span>
              </div>
              <div className="student-enrollment-cell end-date">
                <span>{formatDate(enrollment.endDate)}</span>
              </div>
              <div className="student-enrollment-cell action">
                <Button
                  variant="danger"
                  size="small"
                  onClick={() => handleDelete(enrollment.id!)}
                  disabled={deletingId === enrollment.id || isDeleting}
                  isLoading={deletingId === enrollment.id}
                >
                  Remover
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
