import { useMemo, useState } from "react";
import { navigationItems } from "../../router/router";
import type { RoutePath } from "../../router/router";

type UseAppLayoutParams = {
  currentRoute: RoutePath;
};

export function useAppLayout({ currentRoute }: UseAppLayoutParams) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = useMemo(
    () =>
      navigationItems.map((item) => ({
        ...item,
        isActive: item.path === currentRoute,
      })),
    [currentRoute],
  );

  return {
    schoolName: "GM Academy",
    navigation,
    isMobileMenuOpen,
    toggleMobileMenu: () => setIsMobileMenuOpen((prev) => !prev),
    closeMobileMenu: () => setIsMobileMenuOpen(false),
  };
}
