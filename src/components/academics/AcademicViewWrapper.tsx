import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface AcademicViewWrapperProps {
  title: string;
  children: React.ReactNode;
}

export function AcademicViewWrapper({ title, children }: AcademicViewWrapperProps) {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col">
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
        <button
          onClick={() => navigate('/dashboard/academics')}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </button>
        <div className="h-6 w-px bg-border" />
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
