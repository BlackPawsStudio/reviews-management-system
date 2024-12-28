"use client";
import { QueryClient, QueryClientProvider } from "react-query";

interface ProvidersProps {
  children: React.ReactNode;
}
const client = new QueryClient();

export const Providers = ({ children }: ProvidersProps) => {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
