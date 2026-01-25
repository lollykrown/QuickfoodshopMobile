import { useRouter } from "expo-router";

export function Protected({ guard, children }) {
  const router = useRouter();

  if (!guard) {
    // Redirect to login or auth route
    router.replace("/login"); 
    return null;
  }

  return children;
}
