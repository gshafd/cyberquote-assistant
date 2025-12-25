import { cn } from '@/lib/utils';
import { SubmissionStage, IntakeSubstage, AssignmentSubstage, UnderwritingSubstage } from '@/types/underwriting';
import { Check, Circle, Loader2 } from 'lucide-react';

interface StageProgressProps {
  currentStage: SubmissionStage;
  currentSubstage: IntakeSubstage | AssignmentSubstage | UnderwritingSubstage;
  className?: string;
}

const stages: { id: SubmissionStage; label: string; substages: { id: string; label: string }[] }[] = [
  {
    id: 'submission',
    label: 'Submission',
    substages: [
      { id: 'document_parsing', label: 'Document Parsing' },
    ],
  },
  {
    id: 'data_collection',
    label: 'Intake',
    substages: [
      { id: 'document_parsing', label: 'Document Parsing' },
      { id: 'producer_verification', label: 'Producer Verification' },
      { id: 'initial_validation', label: 'Initial Validation' },
      { id: 'intake_complete', label: 'Complete' },
    ],
  },
  {
    id: 'assignment',
    label: 'Assignment',
    substages: [
      { id: 'workload_balance', label: 'Workload Analysis' },
      { id: 'specialist_match', label: 'Specialist Match' },
      { id: 'assignment_complete', label: 'Complete' },
    ],
  },
  {
    id: 'risk_assessment',
    label: 'Risk Assessment',
    substages: [
      { id: 'risk_profiling', label: 'Risk Profiling' },
      { id: 'rules_check', label: 'Rules Check' },
      { id: 'coverage_determination', label: 'Coverage' },
    ],
  },
  {
    id: 'pricing',
    label: 'Pricing',
    substages: [
      { id: 'pricing', label: 'Pricing' },
      { id: 'quote_draft', label: 'Quote Draft' },
    ],
  },
  {
    id: 'quotation',
    label: 'Quotation',
    substages: [
      { id: 'quote_review', label: 'Quote Review' },
    ],
  },
  {
    id: 'binding',
    label: 'Binding',
    substages: [
      { id: 'binding', label: 'Binding' },
    ],
  },
];

const stageOrder: SubmissionStage[] = ['submission', 'data_collection', 'assignment', 'risk_assessment', 'pricing', 'quotation', 'binding'];

export function StageProgress({ currentStage, currentSubstage, className }: StageProgressProps) {
  const currentStageIndex = stageOrder.indexOf(currentStage);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        {stages.map((stage, idx) => {
          const stageIdx = stageOrder.indexOf(stage.id);
          const isComplete = currentStageIndex > stageIdx || 
            (currentStage === stage.id && currentSubstage.includes('complete'));
          const isCurrent = currentStage === stage.id && !currentSubstage.includes('complete');
          const isPending = currentStageIndex < stageIdx;

          return (
            <div key={stage.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                    isComplete && 'bg-success border-success text-success-foreground',
                    isCurrent && 'border-primary bg-primary/20 text-primary animate-pulse-glow',
                    isPending && 'border-muted-foreground/30 text-muted-foreground/50'
                  )}
                >
                  {isComplete ? (
                    <Check size={20} />
                  ) : isCurrent ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Circle size={20} />
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs mt-2 font-medium',
                    isComplete && 'text-success',
                    isCurrent && 'text-primary',
                    isPending && 'text-muted-foreground/50'
                  )}
                >
                  {stage.label}
                </span>
              </div>
              {idx < stages.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 mx-2 transition-colors',
                    currentStageIndex > stageIdx ? 'bg-success' : 'bg-muted'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Current stage substages */}
      {currentStage !== 'submission' && currentStage !== 'binding' && (
        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            {stages.find((s) => s.id === currentStage)?.label} Progress
          </h4>
          <div className="flex items-center gap-1">
            {stages
              .find((s) => s.id === currentStage)
              ?.substages.map((sub, idx, arr) => {
                const substageIndex = arr.findIndex((s) => s.id === currentSubstage);
                const isComplete = idx < substageIndex || currentSubstage.includes('complete');
                const isCurrent = sub.id === currentSubstage;

                return (
                  <div key={sub.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all',
                          isComplete && 'bg-success text-success-foreground',
                          isCurrent && 'bg-primary text-primary-foreground',
                          !isComplete && !isCurrent && 'bg-muted text-muted-foreground'
                        )}
                      >
                        {isComplete ? <Check size={12} /> : idx + 1}
                      </div>
                      <span
                        className={cn(
                          'text-[10px] mt-1 text-center leading-tight',
                          isComplete && 'text-success',
                          isCurrent && 'text-primary font-medium',
                          !isComplete && !isCurrent && 'text-muted-foreground/70'
                        )}
                      >
                        {sub.label}
                      </span>
                    </div>
                    {idx < arr.length - 1 && (
                      <div
                        className={cn(
                          'h-0.5 w-full mx-1',
                          idx < substageIndex || currentSubstage.includes('complete')
                            ? 'bg-success'
                            : 'bg-muted'
                        )}
                      />
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
