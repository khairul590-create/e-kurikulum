import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/providers/AuthProvider";
import { YearProvider } from "@/providers/YearProvider";
import { ToastProvider } from "@/components/ui/toast";
import { router } from "@/routes/router";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <YearProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </YearProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
