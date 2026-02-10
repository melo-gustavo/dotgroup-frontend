import { useState } from "react";
import { Button } from "../../components/Button/Button";
import { Checkbox } from "../../components/Checkbox/Checkbox";
import { Input } from "../../components/Input/Input";
import { Modal } from "../../components/Modal/Modal";
import { Skeleton } from "../../components/Skeleton/Skeleton";
import {
  getApiErrorToastMessage,
  getApiSuccessToastMessage,
  toastService,
} from "../../lib/toast/toastService";
import { useClasses } from "./useClasses";
import { useEnrollments } from "./useEnrollments";
import { ClassForm } from "./components/ClassForm/ClassForm";
import { ClassEnrollmentForm } from "./components/ClassEnrollmentForm/ClassEnrollmentForm";
import { EnrollmentsList } from "./components/EnrollmentsList/EnrollmentsList";
import type {
  ClassItem,
  ClassModalState,
  CreateClassFormData,
  CreateEnrollmentFormData,
  Enrollment,
} from "./types";
import "./style.css";

function formatDatePtBr(value?: string): string {
  if (!value) return "Data não informada";

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Data não informada";
  }

  return parsedDate.toLocaleDateString("pt-BR");
}

export function ClassesPage() {
  const {
    title,
    description,
    loadingClasses,
    classesError,
    classes,
    totalClasses,
    totalCourses,
    teachers,
    courses,
    titleFilter,
    setTitleFilter,
    selectedTypes,
    selectedStatuses,
    typeFilters,
    statusFilters,
    toggleTypeFilter,
    toggleStatusFilter,
    createClass,
    updateClass,
    deleteClass,
    loadClasses,
  } = useClasses();

  const { createEnrollment, enrolling, getClassEnrollments, deleteEnrollment } =
    useEnrollments();

  const [modalState, setModalState] = useState<ClassModalState>("closed");
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  const handleOpenCreateModal = () => {
    setSelectedClass(null);
    setModalState("create");
  };

  const handleOpenViewModal = async (classItem: ClassItem) => {
    setSelectedClass(classItem);
    setModalState("view");
    setLoadingEnrollments(true);
    try {
      const enrollmentsData = await getClassEnrollments(Number(classItem.id));
      setEnrollments(enrollmentsData);
    } catch (error) {
      console.error("Erro ao carregar matrículas:", error);
      setEnrollments([]);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const handleOpenEditModal = (classItem: ClassItem) => {
    setSelectedClass(classItem);
    setModalState("edit");
  };

  const handleOpenDeleteModal = (classItem: ClassItem) => {
    setSelectedClass(classItem);
    setModalState("delete");
  };

  const handleCloseModal = () => {
    setModalState("closed");
    setSelectedClass(null);
  };

  const handleBackToView = () => {
    if (selectedClass) {
      setModalState("view");
      return;
    }

    handleCloseModal();
  };

  const handleCreateClass = async (data: CreateClassFormData) => {
    setIsLoadingAction(true);
    try {
      const response = await createClass(data);
      toastService.success(
        getApiSuccessToastMessage(response, "Turma criada com sucesso!"),
      );
      handleCloseModal();
    } catch (error) {
      toastService.error(
        getApiErrorToastMessage(error, "Falha ao criar turma"),
      );
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleUpdateClass = async (data: CreateClassFormData) => {
    if (!selectedClass?.id) return;

    setIsLoadingAction(true);
    try {
      const response = await updateClass(selectedClass.id, data);
      toastService.success(
        getApiSuccessToastMessage(response, "Turma atualizada com sucesso!"),
      );
      handleCloseModal();
    } catch (error) {
      toastService.error(
        getApiErrorToastMessage(error, "Falha ao atualizar turma"),
      );
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleDeleteClass = async () => {
    if (!selectedClass?.id) return;

    setIsLoadingAction(true);
    try {
      const response = await deleteClass(selectedClass.id);
      toastService.success(
        getApiSuccessToastMessage(response, "Turma deletada com sucesso!"),
      );
      handleCloseModal();
    } catch (error) {
      toastService.error(
        getApiErrorToastMessage(error, "Falha ao deletar turma"),
      );
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleOpenEnrollmentModal = () => {
    setShowEnrollmentModal(true);
  };

  const handleCloseEnrollmentModal = () => {
    setShowEnrollmentModal(false);
  };

  const handleEnrollStudent = async (data: CreateEnrollmentFormData) => {
    if (!selectedClass?.id) return;

    setIsLoadingAction(true);
    try {
      const response = await createEnrollment(Number(selectedClass.id), data);
      toastService.success(
        getApiSuccessToastMessage(response, "Aluno matriculado com sucesso!"),
      );
      handleCloseEnrollmentModal();
      // Recarregar matrículas
      const enrollmentsData = await getClassEnrollments(
        Number(selectedClass.id),
      );
      setEnrollments(enrollmentsData);
      // Atualizar dados das turmas na home
      await loadClasses();
    } catch (error) {
      toastService.error(
        getApiErrorToastMessage(error, "Falha ao matricular aluno"),
      );
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleDeleteEnrollment = async (enrollmentId: string | number) => {
    try {
      const response = await deleteEnrollment(enrollmentId);
      toastService.success(
        getApiSuccessToastMessage(response, "Matrícula removida com sucesso!"),
      );
      // Atualizar dados das turmas na home
      await loadClasses();
    } catch (error) {
      toastService.error(
        getApiErrorToastMessage(error, "Falha ao remover matrícula"),
      );
      throw error;
    }
  };

  const handleReloadEnrollments = async () => {
    if (!selectedClass?.id) return;

    setLoadingEnrollments(true);
    try {
      const enrollmentsData = await getClassEnrollments(
        Number(selectedClass.id),
      );
      setEnrollments(enrollmentsData);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  return (
    <section className="classes-page">
      <article className="classes-card">
        <div className="classes-header">
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <Button onClick={handleOpenCreateModal} variant="primary">
            Adicionar Turma
          </Button>
        </div>
        <div className="classes-filters">
          <Input
            name="classes-title-filter"
            label="Filtrar por título"
            placeholder="Buscar turmas por título do curso"
            value={titleFilter}
            onChange={(event) => setTitleFilter(event.target.value)}
          />

          <div className="classes-filter-groups">
            <fieldset className="classes-types-fieldset">
              <legend>Filtrar por tipo</legend>
              <div className="classes-types-options">
                {typeFilters.map((filter) => (
                  <Checkbox
                    key={filter.value}
                    name={`class-type-${filter.value}`}
                    label={filter.label}
                    count={filter.count}
                    checked={selectedTypes.includes(filter.value)}
                    onChange={() => toggleTypeFilter(filter.value)}
                  />
                ))}
              </div>
            </fieldset>

            <fieldset className="classes-types-fieldset">
              <legend>Filtrar por status</legend>
              <div className="classes-types-options">
                {statusFilters.map((filter) => (
                  <Checkbox
                    key={filter.value}
                    name={`class-status-${filter.value}`}
                    label={filter.label}
                    count={filter.count}
                    checked={selectedStatuses.includes(filter.value)}
                    onChange={() => toggleStatusFilter(filter.value)}
                  />
                ))}
              </div>
            </fieldset>
          </div>
        </div>
        <div className="classes-summary">
          <span>Total de cursos: {totalCourses}</span>
          <span>Total de turmas: {totalClasses}</span>
        </div>
      </article>

      <div className="classes-grid">
        {loadingClasses ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} variant="card" />
          ))
        ) : classesError ? (
          <article className="classes-empty" style={{ color: "#b42318" }}>
            <strong>Não foi possível carregar as turmas</strong>
            <p>{classesError}</p>
          </article>
        ) : classes.length === 0 ? (
          <article className="classes-empty">
            <strong>Nenhuma turma encontrada</strong>
            <p>
              Tente ajustar seus filtros ou criar novas turmas para começar.
            </p>
          </article>
        ) : (
          classes.map((item) => (
            <article
              key={item.id}
              className="classes-item-card classes-item-card--clickable"
              onClick={() => handleOpenViewModal(item)}
            >
              <h3>{item.className}</h3>
              <p className="classes-item-meta">
                <small className="classes-item-meta-label">Curso</small>
                <span>{item.courseTitle}</span>
              </p>
              <p className="classes-item-meta">
                <small className="classes-item-meta-label">Professor</small>
                <span>{item.teacherName}</span>
              </p>
              <p className="classes-item-meta">
                <small className="classes-item-meta-label">Tipo</small>
                <span>{item.courseTypeLabel}</span>
              </p>
              <p className="classes-item-meta">
                <small className="classes-item-meta-label">Período</small>
                <span>{item.schedule}</span>
              </p>
              <div className="classes-card-meta-row">
                <strong>{item.studentsCount} alunos</strong>
                <span
                  className={`classes-status-badge classes-status-badge--${item.status.toLowerCase()}`}
                >
                  {item.statusLabel}
                </span>
              </div>
            </article>
          ))
        )}
      </div>

      <Modal
        isOpen={modalState === "create"}
        onClose={handleCloseModal}
        title="Criar Nova Turma"
        actions={
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "flex-end",
            }}
          >
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
          </div>
        }
      >
        <ClassForm
          onSubmit={handleCreateClass}
          isLoading={isLoadingAction}
          teachers={teachers}
          courses={courses}
        />
      </Modal>

      <Modal
        isOpen={modalState === "view"}
        onClose={handleCloseModal}
        title={"Detalhes da Turma"}
        actions={
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "space-between",
            }}
          >
            <Button
              variant="danger"
              onClick={() => {
                if (selectedClass) {
                  handleOpenDeleteModal(selectedClass);
                }
              }}
            >
              Deletar
            </Button>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <Button variant="primary" onClick={handleOpenEnrollmentModal}>
                Matricular Aluno
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  if (selectedClass) {
                    handleOpenEditModal(selectedClass);
                  }
                }}
              >
                Editar
              </Button>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancelar
              </Button>
            </div>
          </div>
        }
      >
        <div className="classes-view-card">
          <div className="classes-view-grid">
            <article className="classes-view-item">
              <span>Curso</span>
              <strong>{selectedClass?.courseTitle}</strong>
            </article>
            <article className="classes-view-item">
              <span>Professor</span>
              <strong>{selectedClass?.teacherName}</strong>
            </article>
            <article className="classes-view-item">
              <span>Tipo</span>
              <strong>{selectedClass?.courseTypeLabel}</strong>
            </article>
            <article className="classes-view-item">
              <span>Status</span>
              <strong>{selectedClass?.statusLabel}</strong>
            </article>
            <article className="classes-view-item">
              <span>Alunos Inscritos</span>
              <strong>{enrollments.length ?? 0}</strong>
            </article>
            <article className="classes-view-item">
              <span>Data de Início</span>
              <strong>{formatDatePtBr(selectedClass?.startDate)}</strong>
            </article>
            <article className="classes-view-item">
              <span>Data de Término</span>
              <strong>{formatDatePtBr(selectedClass?.endDate)}</strong>
            </article>
          </div>

          <section className="classes-view-schedule">
            <span>Horário</span>
            <p>{selectedClass?.schedule}</p>
          </section>

          {selectedClass && (
            <EnrollmentsList
              classId={selectedClass.id}
              enrollments={enrollments}
              loading={loadingEnrollments}
              onDeleteEnrollment={handleDeleteEnrollment}
              onReload={handleReloadEnrollments}
            />
          )}
        </div>
      </Modal>

      <Modal
        isOpen={modalState === "edit"}
        onClose={handleCloseModal}
        title="Editar Turma"
        actions={
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "space-between",
            }}
          >
            <Button variant="secondary" onClick={handleBackToView}>
              Voltar
            </Button>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
          </div>
        }
      >
        <ClassForm
          initialData={
            selectedClass
              ? {
                  id: selectedClass.id,
                  name: selectedClass.className,
                  teacherId: selectedClass.teacherId,
                  courseId: selectedClass.courseId,
                  startDate: selectedClass.startDate,
                  endDate: selectedClass.endDate,
                }
              : undefined
          }
          onSubmit={handleUpdateClass}
          isLoading={isLoadingAction}
          teachers={teachers}
          courses={courses}
        />
      </Modal>

      <Modal
        isOpen={modalState === "delete"}
        onClose={handleCloseModal}
        title="Deletar Turma"
        actions={
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "space-between",
            }}
          >
            <Button
              variant="danger"
              onClick={handleDeleteClass}
              isLoading={isLoadingAction}
            >
              Deletar
            </Button>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
          </div>
        }
      >
        <div className="delete-confirmation">
          <p>
            Tem certeza de que deseja deletar a turma "
            {selectedClass?.className}
            "? Esta ação não pode ser desfeita.
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={showEnrollmentModal}
        onClose={handleCloseEnrollmentModal}
        title="Matricular Aluno"
        actions={
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "flex-end",
            }}
          >
            <Button variant="secondary" onClick={handleCloseEnrollmentModal}>
              Cancelar
            </Button>
          </div>
        }
      >
        {selectedClass && (
          <ClassEnrollmentForm
            classId={Number(selectedClass.id)}
            courseId={selectedClass.courseId}
            startDate={selectedClass.startDate}
            endDate={selectedClass.endDate}
            onSubmit={handleEnrollStudent}
            isLoading={isLoadingAction || enrolling}
          />
        )}
      </Modal>
    </section>
  );
}
