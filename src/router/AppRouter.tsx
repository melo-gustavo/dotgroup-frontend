import type { ReactElement } from "react";
import { AppLayout } from "../components/AppLayout/AppLayout";
import { ClassesPage } from "../pages/Classes/ClassesPage";
import { CoursesPage } from "../pages/Courses/CoursesPage";
import { DashboardPage } from "../pages/Dashboard/DashboardPage";
import { StudentsPage } from "../pages/Students/StudentsPage";
import { TeachersPage } from "../pages/Teachers/TeachersPage";
import { useRouter } from "./router";
import type { RoutePath } from "./router";

const routes: Record<RoutePath, ReactElement> = {
  "/": <DashboardPage />,
  "/courses": <CoursesPage />,
  "/classes": <ClassesPage />,
  "/students": <StudentsPage />,
  "/teachers": <TeachersPage />,
};

export function AppRouter() {
  const { currentRoute, navigateTo } = useRouter();

  return (
    <AppLayout currentRoute={currentRoute} navigateTo={navigateTo}>
      {routes[currentRoute]}
    </AppLayout>
  );
}
