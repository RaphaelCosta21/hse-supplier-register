import { useEffect } from "react";

export const useScreenLock = (isLocked: boolean): void => {
  useEffect(() => {
    if (isLocked) {
      // Prevent scrolling
      document.body.style.overflow = "hidden";
      // Prevent keyboard shortcuts
      const handleKeyDown = (e: KeyboardEvent): void => {
        // Prevent common shortcuts like Ctrl+R, F5, Ctrl+W, etc.
        if (
          e.key === "F5" ||
          (e.ctrlKey && (e.key === "r" || e.key === "R")) ||
          (e.ctrlKey && (e.key === "w" || e.key === "W")) ||
          (e.altKey && e.key === "F4") ||
          (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i")) ||
          e.key === "F12"
        ) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      // Prevent context menu
      const handleContextMenu = (e: MouseEvent): void => {
        e.preventDefault();
      };

      // Prevent beforeunload during critical operations
      const handleBeforeUnload = (e: BeforeUnloadEvent): string => {
        e.preventDefault();
        e.returnValue =
          "Processamento em andamento. Tem certeza que deseja sair?";
        return "Processamento em andamento. Tem certeza que deseja sair?";
      };

      // Add event listeners
      document.addEventListener("keydown", handleKeyDown, true);
      document.addEventListener("contextmenu", handleContextMenu, true);
      window.addEventListener("beforeunload", handleBeforeUnload);

      // Cleanup function
      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handleKeyDown, true);
        document.removeEventListener("contextmenu", handleContextMenu, true);
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [isLocked]);
};
