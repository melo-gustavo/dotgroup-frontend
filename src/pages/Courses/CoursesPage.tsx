import { useState } from "react";
import { Checkbox } from "../../components/Checkbox/Checkbox";
import { Input } from "../../components/Input/Input";
import { Skeleton } from "../../components/Skeleton/Skeleton";
import { Modal } from "../../components/Modal/Modal";
import { Button } from "../../components/Button/Button";
import { useCourses } from "./useCourses";
import { CourseForm } from "./components/Form/CourseForm";
import type { CreateCourseFormData, FilteredCourse, ModalState } from "./types";
import {
  getApiErrorToastMessage,
  getApiSuccessToastMessage,
  toastService,
} from "../../lib/toast/toastService";
import "./style.css";

export function CoursesPage() {
  const {
    title,
    description,
    loadingCourses,
    coursesError,
    titleFilter,
    setTitleFilter,
    selectedTypes,
    typeFilters,
    filteredCourses,
    toggleTypeFilter,
    createCourse,
    updateCourse,
    deleteCourse,
  } = useCourses();

  const [modalState, setModalState] = useState<ModalState>("closed");
  const [selectedCourse, setSelectedCourse] = useState<FilteredCourse | null>(
    null,
  );
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  const handleOpenCreateModal = () => {
    setSelectedCourse(null);
    setModalState("create");
  };

  const handleOpenViewModal = (course: FilteredCourse) => {
    setSelectedCourse(course);
    setModalState("view");
  };

  const handleOpenEditModal = (course: FilteredCourse) => {
    setSelectedCourse(course);
    setModalState("edit");
  };

  const handleOpenDeleteModal = (course: FilteredCourse) => {
    setSelectedCourse(course);
    setModalState("delete");
  };

  const handleCloseModal = () => {
    setModalState("closed");
    setSelectedCourse(null);
  };

  const handleBackToView = () => {
    if (selectedCourse) {
      setModalState("view");
      return;
    }

    handleCloseModal();
  };

  const handleCreateCourse = async (data: CreateCourseFormData) => {
    setIsLoadingAction(true);
    try {
      const response = await createCourse(data);
      toastService.success(
        getApiSuccessToastMessage(response, "Curso criado com sucesso!"),
      );
      handleCloseModal();
    } catch (error) {
      toastService.error(
        getApiErrorToastMessage(error, "Falha ao criar curso"),
      );
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleUpdateCourse = async (data: CreateCourseFormData) => {
    if (!selectedCourse?.id) return;

    setIsLoadingAction(true);
    try {
      const response = await updateCourse(selectedCourse.id, data);
      toastService.success(
        getApiSuccessToastMessage(response, "Curso atualizado com sucesso!"),
      );
      handleCloseModal();
    } catch (error) {
      toastService.error(
        getApiErrorToastMessage(error, "Falha ao atualizar curso"),
      );
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse?.id) return;

    setIsLoadingAction(true);
    try {
      const response = await deleteCourse(selectedCourse.id);
      toastService.success(
        getApiSuccessToastMessage(response, "Curso deletado com sucesso!"),
      );
      handleCloseModal();
    } catch (error) {
      toastService.error(
        getApiErrorToastMessage(error, "Falha ao deletar curso"),
      );
    } finally {
      setIsLoadingAction(false);
    }
  };

  return (
    <section className="courses-page">
      <article className="courses-card">
        <div className="courses-header">
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <Button onClick={handleOpenCreateModal} variant="primary">
            Adicionar Curso
          </Button>
        </div>

        <div className="courses-filters">
          <Input
            name="course-title-filter"
            label="Filtrar por título"
            placeholder="Pesquise cursos por título"
            value={titleFilter}
            onChange={(event) => setTitleFilter(event.target.value)}
          />

          <fieldset className="courses-types-fieldset">
            <legend>Filtrar por tipo</legend>
            <div className="courses-types-options">
              {typeFilters.map((filter) => (
                <Checkbox
                  key={filter.value}
                  name={`type-${filter.value}`}
                  label={filter.label}
                  count={filter.count}
                  checked={selectedTypes.includes(filter.value)}
                  onChange={() => toggleTypeFilter(filter.value)}
                />
              ))}
            </div>
          </fieldset>
        </div>
      </article>

      <ul className="courses-list">
        {loadingCourses ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index}>
              <Skeleton variant="card" className="courses-list-item" />
            </div>
          ))
        ) : coursesError ? (
          <li className="courses-empty" style={{ color: "#b42318" }}>
            <strong>Não foi possível carregar os cursos</strong>
            <p>{coursesError}</p>
          </li>
        ) : filteredCourses.length === 0 ? (
          <li className="courses-empty">
            <strong>Nenhum curso encontrado</strong>
            <p>Tente ajustar seus filtros ou crie novos cursos para começar.</p>
          </li>
        ) : (
          filteredCourses.map((course) => (
            <li
              key={course.id}
              className={`courses-list-item courses-list-item--clickable ${
                course.image_url ? "courses-list-item--with-image" : ""
              }`}
              onClick={() => handleOpenViewModal(course)}
            >
              {course.image_url && (
                <div className="courses-list-item-image">
                  <img src={course.image_url} alt={course.title} />
                </div>
              )}
              <div className="courses-list-item-content">
                <strong>{course.title}</strong>
                <span>{course.typeLabel}</span>
              </div>
            </li>
          ))
        )}
      </ul>

      {/* Modals */}
      <Modal
        isOpen={modalState === "create"}
        onClose={handleCloseModal}
        title="Criar Novo Curso"
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
        <CourseForm onSubmit={handleCreateCourse} isLoading={isLoadingAction} />
      </Modal>

      <Modal
        isOpen={modalState === "view"}
        onClose={handleCloseModal}
        title={"Detalhes do Curso"}
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
                if (selectedCourse) {
                  handleOpenDeleteModal(selectedCourse);
                }
              }}
            >
              Deletar
            </Button>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <Button
                variant="secondary"
                onClick={() => {
                  if (selectedCourse) {
                    handleOpenEditModal(selectedCourse);
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
        <div className="courses-view-card">
          {selectedCourse?.image_url && (
            <section className="courses-view-image">
              <img src={selectedCourse.image_url} alt={selectedCourse.title} />
            </section>
          )}
          <div className="courses-view-grid">
            <article className="courses-view-item">
              <span>Título</span>
              <strong>{selectedCourse?.title ?? "Não informado"}</strong>
            </article>
            <article className="courses-view-item">
              <span>Tipo</span>
              <strong>{selectedCourse?.typeLabel ?? "Não informado"}</strong>
            </article>
          </div>

          <section className="courses-view-description">
            <span>Descrição</span>
            <p>{selectedCourse?.description ?? "Não informado"}</p>
          </section>
        </div>
      </Modal>

      <Modal
        isOpen={modalState === "edit"}
        onClose={handleCloseModal}
        title="Editar Curso"
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
        <CourseForm
          initialData={selectedCourse ?? undefined}
          onSubmit={handleUpdateCourse}
          isLoading={isLoadingAction}
        />
      </Modal>

      <Modal
        isOpen={modalState === "delete"}
        onClose={handleCloseModal}
        title="Deletar Curso"
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
              onClick={handleDeleteCourse}
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
            Tem certeza de que deseja deletar o curso "{selectedCourse?.title}
            "? Esta ação não pode ser desfeita.
          </p>
        </div>
      </Modal>
    </section>
  );
}
