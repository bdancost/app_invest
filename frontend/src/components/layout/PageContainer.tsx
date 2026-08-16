import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return <div className="min-h-screen bg-bg-primary p-6">{children}</div>;
}
