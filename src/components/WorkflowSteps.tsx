import { 
  FileUp, 
  Database, 
  ShieldCheck, 
  Calculator, 
  FileText, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const workflowSteps = [
  { id: 'submission', label: 'Application Submission', icon: FileUp },
  { id: 'data_collection', label: 'Data Collection & Validation', icon: Database },
  { id: 'risk_assessment', label: 'Risk Assessment', icon: ShieldCheck },
  { id: 'pricing', label: 'Pricing & Rating', icon: Calculator },
  { id: 'quotation', label: 'Quotation', icon: FileText },
  { id: 'binding', label: 'Binding & Issuing', icon: CheckCircle2 },
];

export function WorkflowSteps() {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex items-center justify-between min-w-max px-2">
        {workflowSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center group">
                <div className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300",
                  "bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30",
                  "group-hover:from-primary/30 group-hover:to-primary/10 group-hover:border-primary/50",
                  "group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20"
                )}>
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="mt-3 text-center max-w-[120px]">
                  <p className="text-xs font-medium text-foreground leading-tight">{step.label}</p>
                </div>
              </div>
              {index < workflowSteps.length - 1 && (
                <ChevronRight className="w-5 h-5 text-muted-foreground/50 mx-4 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
