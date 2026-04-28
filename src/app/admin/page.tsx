import { AdminPanel } from "@/features/admin/admin-panel";

// Server actions invoked from this page (dispatch + monthly happenings regeneration)
// call the Anthropic API which can take 30-60s. Bump from the default ~10s.
export const maxDuration = 60;

export default function AdminPage() {
  return <AdminPanel />;
}
