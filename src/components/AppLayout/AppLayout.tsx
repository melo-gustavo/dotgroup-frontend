import type { ReactNode } from "react";
import type { RoutePath } from "../../router/router";
import { useAppLayout } from "./useAppLayout";
import "./style.css";

type AppLayoutProps = {
  currentRoute: RoutePath;
  navigateTo: (path: RoutePath) => void;
  children: ReactNode;
};

export function AppLayout({
  currentRoute,
  navigateTo,
  children,
}: AppLayoutProps) {
  const {
    navigation,
    schoolName,
    isMobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu,
  } = useAppLayout({ currentRoute });

  return (
    <div className="app-layout-shell">
      <header className="app-layout-topbar">
        <h1>{schoolName}</h1>
        <button
          type="button"
          className="app-layout-menu-toggle"
          onClick={toggleMobileMenu}
          aria-expanded={isMobileMenuOpen}
          aria-controls="main-navigation"
          aria-label="Alternar menu de navegação"
        >
          <span />
          <span />
          <span />
        </button>
        <nav
          id="main-navigation"
          className={
            isMobileMenuOpen
              ? "app-layout-main-nav app-layout-main-nav-open"
              : "app-layout-main-nav"
          }
          aria-label="Navegação principal"
        >
          {navigation.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => {
                navigateTo(item.path);
                closeMobileMenu();
              }}
              className={
                item.isActive
                  ? "app-layout-nav-button active"
                  : "app-layout-nav-button"
              }
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="app-layout-content">{children}</main>
    </div>
  );
}
