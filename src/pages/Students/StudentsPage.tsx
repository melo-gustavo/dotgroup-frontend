import { useEffect, useState } from "react";
import { Button } from "../../components/Button/Button";
import { Input } from "../../components/Input/Input";
import { Modal } from "../../components/Modal/Modal";
import { Select } from "../../components/Select/Select";
import { Skeleton } from "../../components/Skeleton/Skeleton";
import {
  getApiErrorToastMessage,
  getApiSuccessToastMessage,
  toastService,
} from "../../lib/toast/toastService";
import { useStudents } from "./useStudents";
import { useEnrollments } from "../Classes/useEnrollments";
import { StudentForm } from "./components/Form/StudentForm";
import { StudentEnrollmentsList } from "./components/StudentEnrollmentsList/StudentEnrollmentsList";
import type {
  CreateStudentFormData,
  Student,
  StudentModalState,
} from "./types";
import type { Enrollment } from "../Classes/types";
import "./style.css";

type SearchField = "name" | "email";

export function StudentsPage() {
  const {
    title,
    description,
    getAllStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    students,
    loadingStudents,
    studentsError,
  } = useStudents();
  const { getStudentEnrollments, deleteEnrollment } = useEnrollments();
  const [searchText, setSearchText] = useState("");
  const [searchField, setSearchField] = useState<SearchField>("name");
  const [modalState, setModalState] = useState<StudentModalState>("closed");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [studentEnrollments, setStudentEnrollments] = useState<Enrollment[]>(
    [],
  );
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void getAllStudents({
        type: "STUDENT",
        [searchField]: searchText.trim() || undefined,
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [getAllStudents, searchField, searchText]);

  const handleOpenCreateModal = () => {
    setSelectedStudent(null);
    setModalState("create");
  };

  const handleOpenViewModal = (student: Student) => {
    setSelectedStudent(student);
    setModalState("view");
  };

  const handleOpenEditModal = (student: Student) => {
    setSelectedStudent(student);
    setModalState("edit");
  };

  const handleOpenDeleteModal = (student: Student) => {
    setSelectedStudent(student);
    setModalState("delete");
  };

  const handleCloseModal = () => {
    setModalState("closed");
    setSelectedStudent(null);
  };

  const handleBackToView = () => {
    if (selectedStudent) {
      setModalState("view");
      return;
    }

    handleCloseModal();
  };

  const handleCreateStudent = async (data: CreateStudentFormData) => {
    setIsLoadingAction(true);
    try {
      const response = await createStudent(data);
      toastService.success(
        getApiSuccessToastMessage(response, "Aluno criado com sucesso!"),
      );
      handleCloseModal();
    } catch (error) {
      toastService.error(
        getApiErrorToastMessage(error, "Falha ao criar aluno"),
      );
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleUpdateStudent = async (data: CreateStudentFormData) => {
    if (!selectedStudent?.id) return;

    setIsLoadingAction(true);
    try {
      const response = await updateStudent(selectedStudent.id, data);
      toastService.success(
        getApiSuccessToastMessage(response, "Aluno atualizado com sucesso!"),
      );
      handleCloseModal();
    } catch (error) {
      toastService.error(
        getApiErrorToastMessage(error, "Falha ao atualizar aluno"),
      );
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent?.id) return;

    setIsLoadingAction(true);
    try {
      const response = await deleteStudent(selectedStudent.id);
      toastService.success(
        getApiSuccessToastMessage(response, "Aluno deletado com sucesso!"),
      );
      handleCloseModal();
    } catch (error) {
      toastService.error(
        getApiErrorToastMessage(error, "Falha ao deletar aluno"),
      );
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleOpenEnrollmentsModal = async (student: Student) => {
    setSelectedStudent(student);
    setModalState("enrollments");
    setLoadingEnrollments(true);
    try {
      const enrollments = await getStudentEnrollments(String(student.id));
      setStudentEnrollments(enrollments);
    } catch (error) {
      toastService.error(
        getApiErrorToastMessage(error, "Falha ao carregar matrículas"),
      );
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const handleCloseEnrollmentsModal = () => {
    setModalState("view");
    setStudentEnrollments([]);
  };

  const handleDeleteEnrollment = async (enrollmentId: string | number) => {
    setIsLoadingAction(true);
    try {
      const response = await deleteEnrollment(enrollmentId);
      toastService.success(
        getApiSuccessToastMessage(response, "Matrícula removida com sucesso!"),
      );
      if (selectedStudent) {
        const enrollments = await getStudentEnrollments(
          String(selectedStudent.id),
        );
        setStudentEnrollments(enrollments);
      }
    } catch (error) {
      toastService.error(
        getApiErrorToastMessage(error, "Falha ao remover matrícula"),
      );
    } finally {
      setIsLoadingAction(false);
    }
  };

  return (
    <section className="students-page">
      <article className="students-card">
        <div className="students-header">
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <Button onClick={handleOpenCreateModal} variant="primary">
            Adicionar Aluno
          </Button>
        </div>
        <div className="students-filters">
          <label
            htmlFor="student-search-field"
            className="students-filters-label"
          >
            Buscar alunos
          </label>
          <div className="students-search-combined">
            <Input
              name="student-search"
              containerClassName="students-search-input-container"
              className="students-search-input"
              placeholder={
                searchField === "name"
                  ? "Buscar por nome do aluno"
                  : "Buscar por email do aluno"
              }
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
            <Select
              id="student-search-field"
              name="student-search-field"
              containerClassName="students-search-select-container"
              value={searchField}
              onValueChange={(value) => setSearchField(value as SearchField)}
              options={[
                { value: "name", label: "Nome" },
                { value: "email", label: "Email" },
              ]}
            />
          </div>
        </div>
        {studentsError ? (
          <p className="students-error-message">{studentsError}</p>
        ) : null}
      </article>

      <div className="students-grid">
        {loadingStudents ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} variant="card" />
          ))
        ) : studentsError ? (
          <article
            className="students-status-card"
            style={{ gridColumn: "1 / -1", color: "#b42318" }}
          >
            <strong>Não foi possível carregar os alunos</strong>
            <p>{studentsError}</p>
          </article>
        ) : students.length === 0 ? (
          <article
            className="students-status-card"
            style={{ gridColumn: "1 / -1" }}
          >
            <strong>Nenhum aluno encontrado</strong>
            <p>
              Tente ajustar seus filtros de busca ou adicionar novos alunos ao
              sistema.
            </p>
          </article>
        ) : (
          students.map((student) => (
            <article
              key={student.id}
              className="students-status-card students-status-card--clickable"
              onClick={() => handleOpenViewModal(student)}
            >
              <strong>{student.name ?? "Usuário sem nome"}</strong>
              <span>{student.email ?? "Sem email"}</span>
            </article>
          ))
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={modalState === "create"}
        onClose={handleCloseModal}
        title="Criar Novo Aluno"
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
        <StudentForm
          onSubmit={handleCreateStudent}
          isLoading={isLoadingAction}
        />
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={modalState === "view"}
        onClose={handleCloseModal}
        title={"Detalhes do Aluno"}
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
                if (selectedStudent) {
                  handleOpenDeleteModal(selectedStudent);
                }
              }}
            >
              Deletar
            </Button>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <Button
                variant="secondary"
                onClick={() => {
                  if (selectedStudent) {
                    handleOpenEnrollmentsModal(selectedStudent);
                  }
                }}
              >
                Visualizar Matrículas
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  if (selectedStudent) {
                    handleOpenEditModal(selectedStudent);
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
        <div className="students-view-card">
          <div className="students-view-grid">
            <article className="students-view-item">
              <span>Nome</span>
              <strong>{selectedStudent?.name ?? "Não informado"}</strong>
            </article>
            <article className="students-view-item">
              <span>Email</span>
              <strong>{selectedStudent?.email ?? "Não informado"}</strong>
            </article>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={modalState === "edit"}
        onClose={handleCloseModal}
        title="Editar Aluno"
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
        <StudentForm
          initialData={selectedStudent ?? undefined}
          onSubmit={handleUpdateStudent}
          isLoading={isLoadingAction}
        />
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={modalState === "delete"}
        onClose={handleCloseModal}
        title="Deletar Aluno"
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
              onClick={handleDeleteStudent}
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
            Tem certeza de que deseja deletar o aluno "{selectedStudent?.name}
            "? Esta ação não pode ser desfeita.
          </p>
        </div>
      </Modal>

      {/* Enrollments Modal */}
      <Modal
        isOpen={modalState === "enrollments"}
        onClose={handleCloseEnrollmentsModal}
        title="Matrículas do Aluno"
        actions={
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "flex-end",
            }}
          >
            <Button variant="secondary" onClick={handleCloseEnrollmentsModal}>
              Voltar
            </Button>
          </div>
        }
      >
        <StudentEnrollmentsList
          enrollments={studentEnrollments}
          loading={loadingEnrollments}
          onDeleteEnrollment={handleDeleteEnrollment}
          isDeleting={isLoadingAction}
        />
      </Modal>
    </section>
  );
}
