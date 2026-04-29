const FORCE_LIGHT_SCRIPT = `
(() => {
  try {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.style.colorScheme = "light";
    localStorage.removeItem("rome-theme");
    localStorage.removeItem("boston-theme");
    document.cookie = "theme=; Max-Age=0; path=/";
  } catch {
    // ignore
  }
})();
`;

export function ThemeClient() {
  return <script dangerouslySetInnerHTML={{ __html: FORCE_LIGHT_SCRIPT }} />;
}
