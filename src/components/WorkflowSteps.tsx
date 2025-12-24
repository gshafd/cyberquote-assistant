import { 
  Inbox, 
  FileSearch, 
  UserCheck, 
  ShieldAlert, 
  FileCheck, 
  Calculator, 
  FileText, 
  Handshake, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const workflowSteps = [
  { id: 'new_submission', label: 'New Submission', icon: Inbox, description: 'Email intake & document upload' },
  { id: 'intake', label: 'Intake & Review', icon: FileSearch, description: 'Document parsing & validation' },
  { id: 'assignment', label: 'Assignment & Triage', icon: UserCheck, description: 'Workload balancing & specialist match' },
  { id: 'risk_profiling', label: 'Risk Profiling', icon: ShieldAlert, description: 'Threat signals & risk scoring' },
  { id: 'coverage', label: 'Coverage Determination', icon: FileCheck, description: 'Coverage recommendations' },
  { id: 'pricing', label: 'Pricing & Rating', icon: Calculator, description: 'Premium calculation' },
  { id: 'quotation', label: 'Quotation', icon: FileText, description: 'Quote generation & review' },
  { id: 'binding', label: 'Binding', icon: Handshake, description: 'Terms finalization' },
  { id: 'issuance', label: 'Issuance', icon: CheckCircle2, description: 'Policy issuance' },
];

export function WorkflowSteps() {
  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex items-center gap-0 min-w-max px-2">
        {workflowSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center group">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                  "bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30",
                  "group-hover:from-primary/30 group-hover:to-primary/10 group-hover:border-primary/50",
                  "group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20"
                )}>
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="mt-2 text-center max-w-[100px]">
                  <p className="text-xs font-medium text-foreground leading-tight">{step.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight hidden lg:block">{step.description}</p>
                </div>
              </div>
              {index < workflowSteps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 mx-1 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
