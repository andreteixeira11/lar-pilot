import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export const PageHeader = ({ title, description, actions }: PageHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1 text-sm md:text-base">{description}</p>
        )}
      </div>
      {actions && <div className="flex gap-2 w-full sm:w-auto">{actions}</div>}
    </div>
  );
};
