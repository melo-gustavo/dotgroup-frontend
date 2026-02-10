import { useEffect, useState } from "react";

export type RoutePath =
  | "/"
  | "/courses"
  | "/classes"
  | "/students"
  | "/teachers";

export type NavigationItem = {
  path: RoutePath;
  label: string;
};

export const navigationItems: NavigationItem[] = [
  { path: "/", label: "Painel" },
  { path: "/courses", label: "Cursos" },
  { path: "/classes", label: "Turmas" },
  { path: "/students", label: "Alunos" },
  { path: "/teachers", label: "Professores" },
];

function isRoutePath(pathname: string): pathname is RoutePath {
  return navigationItems.some((item) => item.path === pathname);
}

function resolveRoute(pathname: string): RoutePath {
  return isRoutePath(pathname) ? pathname : "/";
}

export function useRouter() {
  const [currentRoute, setCurrentRoute] = useState<RoutePath>(() =>
    resolveRoute(window.location.pathname),
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(resolveRoute(window.location.pathname));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateTo = (path: RoutePath) => {
    if (path === currentRoute) {
      return;
    }

    window.history.pushState({}, "", path);
    setCurrentRoute(path);
  };

  return { currentRoute, navigateTo };
}
