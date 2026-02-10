import { useState } from "react";
import { Button } from "../../../../components/Button/Button";
import { Skeleton } from "../../../../components/Skeleton/Skeleton";
import type { Enrollment } from "../../types";
import "./style.css";

type EnrollmentsListProps = {
  classId: number | string;
  enrollments: Enrollment[];
  loading: boolean;
  onDeleteEnrollment: (enrollmentId: string | number) => Promise<void>;
  onReload: () => Promise<void>;
};

export function EnrollmentsList({
  enrollments,
  loading,
  onDeleteEnrollment,
  onReload,
}: EnrollmentsListProps) {
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const handleDeleteEnrollment = async (enrollmentId: string | number) => {
    setDeletingId(enrollmentId);
    try {
      await onDeleteEnrollment(enrollmentId);
      await onReload();
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="enrollments-list-container">
        <h4>Alunos Matriculados</h4>
        <div className="enrollments-list-loading">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} variant="card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="enrollments-list-container">
      <h4>Alunos Matriculados ({enrollments.length})</h4>

      {enrollments.length === 0 ? (
        <div className="enrollments-empty">
          <p>Nenhum aluno matriculado nesta turma</p>
        </div>
      ) : (
        <div className="enrollments-list">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="enrollment-item"
              data-id={enrollment.id}
            >
              <div className="enrollment-info">
                <strong>
                  {enrollment.studentName || "Nome não disponível"}
                </strong>
                {enrollment.studentEmail && (
                  <small>{enrollment.studentEmail}</small>
                )}
                {enrollment.enrolledAt && (
                  <span className="enrollment-date">
                    Matriculado em{" "}
                    {new Date(enrollment.enrolledAt).toLocaleDateString(
                      "pt-BR",
                    )}
                  </span>
                )}
              </div>
              <Button
                variant="danger"
                size="small"
                onClick={() => handleDeleteEnrollment(enrollment.id!)}
                disabled={deletingId === enrollment.id}
                isLoading={deletingId === enrollment.id}
              >
                Remover
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
