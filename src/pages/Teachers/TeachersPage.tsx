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
import { useTeachers } from "./useTeachers";
import { TeacherForm } from "./components/Form/TeacherForm";
import type {
  CreateTeacherFormData,
  Teacher,
  TeacherModalState,
} from "./types";
import "./style.css";

type SearchField = "name" | "email";

export function TeachersPage() {
  const {
    title,
    description,
    getAllTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    teachers,
    loadingTeachers,
    teachersError,
  } = useTeachers();
  const [searchText, setSearchText] = useState("");
  const [searchField, setSearchField] = useState<SearchField>("name");
  const [modalState, setModalState] = useState<TeacherModalState>("closed");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void getAllTeachers({
        type: "TEACHER",
        [searchField]: searchText.trim() || undefined,
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [getAllTeachers, searchField, searchText]);

  const handleOpenCreateModal = () => {
    setSelectedTeacher(null);
    setModalState("create");
  };

  const handleOpenViewModal = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setModalState("view");
  };

  const handleOpenEditModal = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setModalState("edit");
  };

  const handleOpenDeleteModal = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setModalState("delete");
  };

  const handleCloseModal = () => {
    setModalState("closed");
    setSelectedTeacher(null);
  };

  const handleBackToView = () => {
    if (selectedTeacher) {
      setModalState("view");
      return;
    }

    handleCloseModal();
  };

  const handleCreateTeacher = async (data: CreateTeacherFormData) => {
    setIsLoadingAction(true);
    try {
      const response = await createTeacher(data);
      toastService.success(
        getApiSuccessToastMessage(response, "Professor criado com sucesso!"),
      );
      handleCloseModal();
    } catch (error) {
      toastService.error(
        getApiErrorToastMessage(error, "Falha ao criar professor"),
      );
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleUpdateTeacher = async (data: CreateTeacherFormData) => {
    if (!selectedTeacher?.id) return;

    setIsLoadingAction(true);
    try {
      const response = await updateTeacher(selectedTeacher.id, data);
      toastService.success(
        getApiSuccessToastMessage(
          response,
          "Professor atualizado com sucesso!",
        ),
      );
      handleCloseModal();
    } catch (error) {
      toastService.error(
        getApiErrorToastMessage(error, "Falha ao atualizar professor"),
      );
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleDeleteTeacher = async () => {
    if (!selectedTeacher?.id) return;

    setIsLoadingAction(true);
    try {
      const response = await deleteTeacher(selectedTeacher.id);
      toastService.success(
        getApiSuccessToastMessage(response, "Professor deletado com sucesso!"),
      );
      handleCloseModal();
    } catch (error) {
      toastService.error(
        getApiErrorToastMessage(error, "Falha ao deletar professor"),
      );
    } finally {
      setIsLoadingAction(false);
    }
  };

  return (
    <section className="teachers-page">
      <article className="teachers-card">
        <div className="teachers-header">
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <Button onClick={handleOpenCreateModal} variant="primary">
            Adicionar Professor
          </Button>
        </div>
        <div className="teachers-filters">
          <label
            htmlFor="teacher-search-field"
            className="teachers-filters-label"
          >
            Buscar professores
          </label>
          <div className="teachers-search-combined">
            <Input
              name="teacher-search"
              containerClassName="teachers-search-input-container"
              className="teachers-search-input"
              placeholder={
                searchField === "name"
                  ? "Buscar por nome do professor"
                  : "Buscar por email do professor"
              }
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
            <Select
              id="teacher-search-field"
              name="teacher-search-field"
              containerClassName="teachers-search-select-container"
              value={searchField}
              onValueChange={(value) => setSearchField(value as SearchField)}
              options={[
                { value: "name", label: "Nome" },
                { value: "email", label: "Email" },
              ]}
            />
          </div>
        </div>
        {teachersError ? (
          <p className="teachers-error-message">{teachersError}</p>
        ) : null}
      </article>

      <div className="teachers-grid">
        {loadingTeachers ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} variant="card" />
          ))
        ) : teachersError ? (
          <article
            className="teachers-status-card"
            style={{ gridColumn: "1 / -1", color: "#b42318" }}
          >
            <strong>Não foi possível carregar os professores</strong>
            <p>{teachersError}</p>
          </article>
        ) : teachers.length === 0 ? (
          <article
            className="teachers-status-card"
            style={{ gridColumn: "1 / -1" }}
          >
            <strong>Nenhum professor encontrado</strong>
            <p>
              Tente ajustar seus filtros de busca ou adicionar novos professores
              ao sistema.
            </p>
          </article>
        ) : (
          teachers.map((teacher) => (
            <article
              key={teacher.id}
              className="teachers-status-card teachers-status-card--clickable"
              onClick={() => handleOpenViewModal(teacher)}
            >
              <strong>{teacher.name ?? "Usuário sem nome"}</strong>
              <span>{teacher.email ?? "Sem email"}</span>
            </article>
          ))
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={modalState === "create"}
        onClose={handleCloseModal}
        title="Criar Novo Professor"
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
        <TeacherForm
          onSubmit={handleCreateTeacher}
          isLoading={isLoadingAction}
        />
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={modalState === "view"}
        onClose={handleCloseModal}
        title={"Detalhes do Professor"}
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
                if (selectedTeacher) {
                  handleOpenDeleteModal(selectedTeacher);
                }
              }}
            >
              Deletar
            </Button>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <Button
                variant="secondary"
                onClick={() => {
                  if (selectedTeacher) {
                    handleOpenEditModal(selectedTeacher);
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
        <div className="teachers-view-card">
          <div className="teachers-view-grid">
            <article className="teachers-view-item">
              <span>Nome</span>
              <strong>{selectedTeacher?.name ?? "Não informado"}</strong>
            </article>
            <article className="teachers-view-item">
              <span>Email</span>
              <strong>{selectedTeacher?.email ?? "Não informado"}</strong>
            </article>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={modalState === "edit"}
        onClose={handleCloseModal}
        title="Editar Professor"
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
        <TeacherForm
          initialData={selectedTeacher ?? undefined}
          onSubmit={handleUpdateTeacher}
          isLoading={isLoadingAction}
        />
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={modalState === "delete"}
        onClose={handleCloseModal}
        title="Deletar Professor"
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
              onClick={handleDeleteTeacher}
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
            Tem certeza de que deseja deletar o professor "
            {selectedTeacher?.name}
            "? Esta ação não pode ser desfeita.
          </p>
        </div>
      </Modal>
    </section>
  );
}
