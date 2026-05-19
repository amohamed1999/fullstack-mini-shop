import { createFileRoute, Navigate } from "@tanstack/react-router";

import { useAuthStore } from "@/stores/auth-store";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { session, initializing } = useAuthStore();
  if (initializing) return null;
  return <Navigate to={session ? "/products" : "/login"} />;
}
