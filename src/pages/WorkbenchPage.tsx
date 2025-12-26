import { useEffect, useRef } from 'react';
import { useAppState } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StageProgress } from '@/components/StageProgress';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IntakeSubstages } from '@/components/substages/IntakeSubstages';
import { IntakeSummaryReadOnly } from '@/components/substages/IntakeSummaryReadOnly';
import { AssignmentSubstages } from '@/components/substages/AssignmentSubstages';
import { AssignmentSummaryReadOnly } from '@/components/substages/AssignmentSummaryReadOnly';
import { UnderwritingSubstages } from '@/components/substages/UnderwritingSubstages';
import { toast } from 'sonner';
import { 
  FileCheck,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Zap,
  Clock,
} from 'lucide-react';
import { 
  Submission, 
  IntakeSubstage, 
  AssignmentSubstage, 
  UnderwritingSubstage,
  Underwriter,
  FeedbackEntry,
  SubmissionStage,
} from '@/types/underwriting';

export function WorkbenchPage() {
  const { state, dispatch } = useAppState();
  const autoProgressingRef = useRef<Set<string>>(new Set());
  
  // Helper functions for confidence checking
  const calculateStageConfidence = (sub: Submission): number => {
    const fields: number[] = [];
    
    if (sub.stage === 'data_collection') {
      fields.push(
        sub.insured.name.confidence,
        sub.insured.industry.confidence,
        sub.insured.annualRevenue.confidence,
        sub.controls.hasEDR.confidence,
        sub.controls.hasMFA.confidence,
        sub.controls.hasSOC2.confidence,
      );
    } else if (sub.stage === 'risk_assessment') {
      fields.push(sub.confidence);
    } else if (sub.stage === 'pricing' && sub.riskProfile) {
      fields.push(
        sub.riskProfile.overallScore.confidence,
        sub.riskProfile.controlsScore.confidence,
        sub.riskProfile.threatExposure.confidence,
      );
    }
    
    if (fields.length === 0) return sub.confidence;
    return Math.round(fields.reduce((a, b) => a + b, 0) / fields.length);
  };

  const hasLowConfidenceFields = (sub: Submission): { hasLow: boolean; reason: string; fieldName?: string } => {
    const threshold = 70;
    
    if (sub.controls.hasEDR.confidence < threshold) {
      return { hasLow: true, reason: `EDR status unclear (${sub.controls.hasEDR.confidence}% confidence)`, fieldName: 'EDR' };
    }
    if (sub.controls.hasMFA.confidence < threshold) {
      return { hasLow: true, reason: `MFA status unclear (${sub.controls.hasMFA.confidence}% confidence)`, fieldName: 'MFA' };
    }
    if (sub.insured.annualRevenue.confidence < threshold) {
      return { hasLow: true, reason: `Revenue uncertain (${sub.insured.annualRevenue.confidence}% confidence)`, fieldName: 'Revenue' };
    }
    
    if (sub.riskProfile && sub.riskProfile.overallScore.confidence < threshold) {
      return { hasLow: true, reason: `Risk score uncertain (${sub.riskProfile.overallScore.confidence}% confidence)`, fieldName: 'Risk Score' };
    }
    
    return { hasLow: false, reason: '' };
  };

  // Get all confidence values for a substage
  const getSubstageConfidences = (sub: Submission, substage: string): number[] => {
    if (substage === 'document_parsing') {
      return [
        sub.insured.name.confidence,
        sub.insured.industry.confidence,
        sub.insured.annualRevenue.confidence,
        sub.insured.employeeCount.confidence,
        sub.insured.website.confidence,
        sub.insured.sicCode?.confidence || 90,
      ];
    }
    if (substage === 'producer_verification') {
      return [95]; // Producer verification is typically high confidence
    }
    if (substage === 'initial_validation') {
      return [
        sub.controls.hasMFA.confidence,
        sub.controls.hasEDR.confidence,
        sub.controls.hasSOC2.confidence,
        sub.controls.hasBackups.confidence,
      ];
    }
    if (substage === 'risk_profiling' && sub.riskProfile) {
      return [
        sub.riskProfile.overallScore.confidence,
        sub.riskProfile.controlsScore.confidence,
        sub.riskProfile.threatExposure.confidence,
      ];
    }
    return [sub.confidence];
  };

  const isSubstageHighConfidence = (sub: Submission, substage: string): boolean => {
    const confidences = getSubstageConfidences(sub, substage);
    const threshold = 70;
    return confidences.every(c => c >= threshold);
  };

  // Auto-progression effect - watches for stage/substage changes and auto-advances high confidence submissions
  useEffect(() => {
    state.submissions.forEach(sub => {
      // Skip if already processing this submission
      if (autoProgressingRef.current.has(sub.id)) return;
      
      const avgConfidence = calculateStageConfidence(sub);
      const { hasLow, reason } = hasLowConfidenceFields(sub);
      const isCurrentSubstageHighConf = isSubstageHighConfidence(sub, sub.substage);
      
      // High confidence threshold for auto-progression
      const confidenceThreshold = 70;
      const isHighConfidence = !hasLow && avgConfidence >= confidenceThreshold;
      
      // Auto-advance through data_collection substages
      if (sub.stage === 'data_collection' && isCurrentSubstageHighConf) {
        const intakeOrder: IntakeSubstage[] = ['document_parsing', 'producer_verification', 'initial_validation', 'intake_complete'];
        const currentIdx = intakeOrder.indexOf(sub.substage as IntakeSubstage);
        
        // Auto-advance within substages
        if (currentIdx >= 0 && currentIdx < intakeOrder.length - 1) {
          autoProgressingRef.current.add(sub.id);
          const nextSubstage = intakeOrder[currentIdx + 1];
          
          toast.success(`Auto-advancing ${sub.insured.name.value}`, {
            description: `High confidence - moving to ${nextSubstage.replace(/_/g, ' ')}`,
            icon: <Zap className="text-primary" />,
          });
          
          setTimeout(() => {
            dispatch({
              type: 'ADVANCE_STAGE',
              payload: { submissionId: sub.id, newStage: 'data_collection', substage: nextSubstage }
            });
            autoProgressingRef.current.delete(sub.id);
          }, 600);
          return;
        }
        
        // At intake_complete, move to assignment stage if all high confidence
        if (sub.substage === 'intake_complete' && isHighConfidence) {
          autoProgressingRef.current.add(sub.id);
          toast.success(`Auto-advancing ${sub.insured.name.value}`, {
            description: `High confidence (${avgConfidence}%) - moving to Assignment`,
            icon: <Zap className="text-primary" />,
          });
          
          setTimeout(() => {
            dispatch({
              type: 'ADVANCE_STAGE',
              payload: { submissionId: sub.id, newStage: 'assignment', substage: 'workload_balance' }
            });
            autoProgressingRef.current.delete(sub.id);
          }, 800);
          return;
        }
      }

      // Auto-progress through assignment substages with auto-assignment
      if (sub.stage === 'assignment') {
        const assignmentOrder: AssignmentSubstage[] = ['workload_balance', 'specialist_match', 'assignment_complete'];
        const currentIdx = assignmentOrder.indexOf(sub.substage as AssignmentSubstage);

        // Auto-assign underwriter at specialist_match when confidence is high
        if (sub.substage === 'specialist_match' && !sub.assignedUnderwriter && avgConfidence >= 85) {
          // Find best matching underwriter
          const matchingUWs = state.underwriters.filter(
            uw => uw.specialty.some(s => 
              sub.insured.industry.value.toLowerCase().includes(s.toLowerCase()) ||
              s.toLowerCase().includes('technology') ||
              s.toLowerCase().includes('healthcare')
            )
          );
          
          if (matchingUWs.length > 0) {
            const bestMatch = matchingUWs[0];
            autoProgressingRef.current.add(sub.id);
            
            toast.success(`Auto-assigning ${sub.insured.name.value}`, {
              description: `High confidence (${avgConfidence}%) - Assigned to ${bestMatch.name}`,
              icon: <Zap className="text-primary" />,
            });
            
            setTimeout(() => {
              dispatch({
                type: 'UPDATE_SUBMISSION',
                payload: { ...sub, assignedUnderwriter: bestMatch }
              });
              // Auto-advance to assignment_complete
              setTimeout(() => {
                dispatch({
                  type: 'ADVANCE_STAGE',
                  payload: { submissionId: sub.id, newStage: 'assignment', substage: 'assignment_complete' }
                });
                autoProgressingRef.current.delete(sub.id);
              }, 400);
            }, 600);
            return;
          }
        }

        if (isCurrentSubstageHighConf && currentIdx >= 0 && currentIdx < assignmentOrder.length - 1) {
          // Skip specialist_match auto-advance if no underwriter assigned (requires selection)
          if (sub.substage === 'specialist_match' && !sub.assignedUnderwriter) {
            return;
          }
          
          autoProgressingRef.current.add(sub.id);
          const nextSubstage = assignmentOrder[currentIdx + 1];

          toast.success(`Auto-advancing ${sub.insured.name.value}`, {
            description: `High confidence - moving to ${nextSubstage.replace(/_/g, ' ')}`,
            icon: <Zap className="text-primary" />,
          });

          setTimeout(() => {
            dispatch({
              type: 'ADVANCE_STAGE',
              payload: { submissionId: sub.id, newStage: 'assignment', substage: nextSubstage }
            });
            autoProgressingRef.current.delete(sub.id);
          }, 600);
          return;
        }

        // At assignment_complete with underwriter assigned, move to risk_assessment
        if (sub.substage === 'assignment_complete' && sub.assignedUnderwriter && isHighConfidence) {
          autoProgressingRef.current.add(sub.id);
          toast.success(`Auto-advancing ${sub.insured.name.value}`, {
            description: `Assignment complete - moving to Risk Assessment`,
            icon: <Zap className="text-primary" />,
          });

          setTimeout(() => {
            dispatch({
              type: 'ADVANCE_STAGE',
              payload: { submissionId: sub.id, newStage: 'risk_assessment', substage: 'risk_profiling' }
            });
            autoProgressingRef.current.delete(sub.id);
          }, 800);
          return;
        }
      }
      
      // Mark for review if low confidence and at intake_complete
      if (sub.stage === 'data_collection' && sub.substage === 'intake_complete' && hasLow && !sub.requiresHumanReview) {
        dispatch({
          type: 'UPDATE_SUBMISSION',
          payload: { ...sub, requiresHumanReview: true, reviewReason: reason }
        });
        toast.warning(`Human review required for ${sub.insured.name.value}`, {
          description: reason,
        });
        return;
      }
      
      // Auto-progress through risk_assessment substages
      if (sub.stage === 'risk_assessment') {
        const assessmentOrder = ['risk_profiling', 'rules_check', 'coverage_determination'];
        const currentIdx = assessmentOrder.indexOf(sub.substage);
        
        if (isHighConfidence) {
          autoProgressingRef.current.add(sub.id);
          
          // Auto-assign underwriter if not assigned
          let updatedSub = sub;
          if (!sub.assignedUnderwriter && state.underwriters.length > 0) {
            const bestUW = state.underwriters
              .filter(uw => uw.workload < uw.maxWorkload)
              .sort((a, b) => b.bindRatio - a.bindRatio)[0];
            
            if (bestUW) {
              updatedSub = {
                ...sub,
                assignedUnderwriter: bestUW,
                history: [
                  ...sub.history,
                  {
                    id: `event-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    type: 'assignment' as const,
                    actor: 'System (Auto-assign)',
                    actorRole: 'assignment' as const,
                    description: `Auto-assigned to ${bestUW.name} (high confidence)`,
                  },
                ],
              };
              dispatch({ type: 'UPDATE_SUBMISSION', payload: updatedSub });
            }
          }
          
          // Move to next substage or next stage
          if (currentIdx < assessmentOrder.length - 1) {
            const nextSubstage = assessmentOrder[currentIdx + 1];
            toast.success(`Auto-advancing ${sub.insured.name.value}`, {
              description: `High confidence - moving to ${nextSubstage.replace(/_/g, ' ')}`,
              icon: <Zap className="text-primary" />,
            });
            
            setTimeout(() => {
              dispatch({
                type: 'ADVANCE_STAGE',
                payload: { submissionId: sub.id, newStage: 'risk_assessment', substage: nextSubstage }
              });
              autoProgressingRef.current.delete(sub.id);
            }, 600);
          } else {
            toast.success(`Auto-progressing ${sub.insured.name.value}`, {
              description: `High confidence (${avgConfidence}%) - advancing to Pricing`,
              icon: <Zap className="text-primary" />,
            });
            
            setTimeout(() => {
              dispatch({
                type: 'ADVANCE_STAGE',
                payload: { submissionId: sub.id, newStage: 'pricing', substage: 'pricing' }
              });
              autoProgressingRef.current.delete(sub.id);
            }, 800);
          }
        }
      }
      
      // Auto-progress through pricing stage
      if (sub.stage === 'pricing' && isHighConfidence) {
        autoProgressingRef.current.add(sub.id);
        
        const pricingOrder = ['pricing', 'quote_draft'];
        const currentIdx = pricingOrder.indexOf(sub.substage);
        
        if (currentIdx < pricingOrder.length - 1) {
          const nextSubstage = pricingOrder[currentIdx + 1];
          toast.success(`Auto-advancing ${sub.insured.name.value}`, {
            description: `High confidence - moving to ${nextSubstage.replace(/_/g, ' ')}`,
            icon: <Zap className="text-primary" />,
          });
          
          setTimeout(() => {
            dispatch({
              type: 'ADVANCE_STAGE',
              payload: { submissionId: sub.id, newStage: 'pricing', substage: nextSubstage }
            });
            autoProgressingRef.current.delete(sub.id);
          }, 600);
        } else {
          toast.success(`Auto-advancing ${sub.insured.name.value}`, {
            description: `High confidence - Quote generated`,
            icon: <Zap className="text-primary" />,
          });
          
          setTimeout(() => {
            dispatch({
              type: 'ADVANCE_STAGE',
              payload: { submissionId: sub.id, newStage: 'quotation', substage: 'quote_review' }
            });
            autoProgressingRef.current.delete(sub.id);
          }, 800);
        }
      }
    });
  }, [state.submissions]);

  // All roles can see all submissions - they just have different editing capabilities
  const roleSubmissions = state.submissions;

  const selectedSubmission = state.submissions.find(s => s.id === state.selectedSubmissionId);

  // Can view workflow details (interact with substages) - limited by role
  const canInteractWithWorkflow = (sub: Submission): boolean => {
    if (state.currentRole === 'intake') return sub.stage === 'data_collection' || sub.stage === 'submission';
    if (state.currentRole === 'assignment') return sub.stage === 'assignment';
    if (state.currentRole === 'underwriting') return ['risk_assessment', 'pricing', 'quotation', 'binding'].includes(sub.stage);
    return false;
  };

  // Can view the details panel (always true - all roles can see where cases are)
  const canViewDetails = (_sub: Submission): boolean => {
    return true; // All roles can view submission details
  };

  const canEdit = (sub: Submission): boolean => {
    if (state.currentRole === 'intake') return sub.stage === 'data_collection' || sub.stage === 'submission';
    if (state.currentRole === 'assignment') return sub.stage === 'assignment';
    if (state.currentRole === 'underwriting') return ['risk_assessment', 'pricing', 'quotation'].includes(sub.stage);
    return false;
  };

  const handleFieldEdit = (submissionId: string, fieldPath: string, newValue: any, label: string, comment: string) => {
    const sub = state.submissions.find(s => s.id === submissionId);
    if (!sub) return;

    const feedbackEntry: FeedbackEntry = {
      id: `fb-${Date.now()}`,
      submissionId,
      fieldPath,
      fieldLabel: label,
      originalValue: getNestedValue(sub, fieldPath)?.toString() || '',
      newValue: String(newValue),
      editedBy: 'Current User',
      editedAt: new Date().toISOString(),
      feedbackComment: comment,
      stage: sub.stage,
      substage: sub.substage,
      downstreamImpact: calculateDownstreamImpact(fieldPath),
    };

    dispatch({ type: 'ADD_FEEDBACK', payload: feedbackEntry });

    const updatedSubmission = updateNestedField(sub, fieldPath, newValue);
    const recalculatedSubmission = recalculateDownstream(updatedSubmission, fieldPath);
    
    dispatch({ type: 'UPDATE_SUBMISSION', payload: recalculatedSubmission });
  };

  const handleAdvanceSubstage = (submissionId: string) => {
    const sub = state.submissions.find(s => s.id === submissionId);
    if (!sub) return;

    let newStage: SubmissionStage = sub.stage;
    let newSubstage: string = sub.substage;

    // Data Collection substage progression
    if (sub.stage === 'data_collection') {
      const intakeOrder: IntakeSubstage[] = ['document_parsing', 'producer_verification', 'initial_validation', 'intake_complete'];
      const currentIdx = intakeOrder.indexOf(sub.substage as IntakeSubstage);
      
      if (currentIdx < intakeOrder.length - 1) {
        newSubstage = intakeOrder[currentIdx + 1];
      } else if (sub.substage === 'intake_complete') {
        const avgConfidence = calculateStageConfidence(sub);
        const { hasLow, reason } = hasLowConfidenceFields(sub);
        
        if (hasLow) {
          toast.warning('Human review required', { description: reason });
          dispatch({
            type: 'UPDATE_SUBMISSION',
            payload: { ...sub, requiresHumanReview: true, reviewReason: reason }
          });
          return;
        }
        
        newStage = 'assignment';
        newSubstage = 'workload_balance';
        toast.success(`Moving ${sub.insured.name.value} to Assignment`, {
          description: `Confidence: ${avgConfidence}%`,
        });
      }
    }
    // Assignment substage progression
    else if (sub.stage === 'assignment') {
      const assignmentOrder: AssignmentSubstage[] = ['workload_balance', 'specialist_match', 'assignment_complete'];
      const currentIdx = assignmentOrder.indexOf(sub.substage as AssignmentSubstage);
      
      if (currentIdx < assignmentOrder.length - 1) {
        newSubstage = assignmentOrder[currentIdx + 1];
      } else if (sub.substage === 'assignment_complete') {
        newStage = 'risk_assessment';
        newSubstage = 'risk_profiling';
        toast.success(`Moving ${sub.insured.name.value} to Risk Assessment`);
      }
    }
    // Risk Assessment substage progression
    else if (sub.stage === 'risk_assessment') {
      const assessmentOrder: string[] = ['risk_profiling', 'rules_check', 'coverage_determination'];
      const currentIdx = assessmentOrder.indexOf(sub.substage);
      if (currentIdx < assessmentOrder.length - 1) {
        newSubstage = assessmentOrder[currentIdx + 1];
      } else {
        newStage = 'pricing';
        newSubstage = 'pricing';
        toast.success(`Moving ${sub.insured.name.value} to Pricing`);
      }
    }
    // Pricing substage progression
    else if (sub.stage === 'pricing') {
      const pricingOrder: string[] = ['pricing', 'quote_draft'];
      const currentIdx = pricingOrder.indexOf(sub.substage);
      if (currentIdx < pricingOrder.length - 1) {
        newSubstage = pricingOrder[currentIdx + 1];
      } else {
        newStage = 'quotation';
        newSubstage = 'quote_review';
        toast.success(`Quote generated for ${sub.insured.name.value}`);
      }
    }
    // Quotation to Binding
    else if (sub.stage === 'quotation') {
      newStage = 'binding';
      newSubstage = 'binding';
      toast.success(`Moving ${sub.insured.name.value} to Binding`);
    }

    dispatch({ 
      type: 'ADVANCE_STAGE', 
      payload: { submissionId, newStage, substage: newSubstage }
    });
  };

  const handleAssignUnderwriter = (submissionId: string, underwriter: Underwriter) => {
    const sub = state.submissions.find(s => s.id === submissionId);
    if (!sub) return;

    const updatedSubmission: Submission = {
      ...sub,
      assignedUnderwriter: underwriter,
      history: [
        ...sub.history,
        {
          id: `event-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'assignment',
          actor: 'Assignment Team',
          actorRole: 'assignment',
          description: `Assigned to ${underwriter.name}`,
        },
      ],
    };

    dispatch({ type: 'UPDATE_SUBMISSION', payload: updatedSubmission });
  };

  return (
    <div className="flex h-full gap-4">
      {/* Submissions Queue */}
      <Card className="w-80 flex-shrink-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="capitalize">{state.currentRole} Queue</span>
            <Badge>{roleSubmissions.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            {roleSubmissions.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No submissions in queue
              </div>
            ) : (
              roleSubmissions.map(sub => (
                <div
                  key={sub.id}
                  onClick={() => dispatch({ type: 'SELECT_SUBMISSION', payload: sub.id })}
                  className={`p-4 border-b border-border cursor-pointer transition-colors hover:bg-muted/50 ${
                    state.selectedSubmissionId === sub.id ? 'bg-primary/10 border-l-2 border-l-primary' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-sm">{sub.insured.name.value}</span>
                    <ConfidenceBadge score={sub.confidence} size="sm" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs capitalize">
                      {sub.stage.replace(/_/g, ' ')}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {sub.substage.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  {sub.requiresHumanReview && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-warning">
                      <AlertTriangle size={12} />
                      Review required
                    </div>
                  )}
                  {/* Show status indicators based on role and case stage */}
                  {state.currentRole === 'intake' && !['data_collection', 'submission'].includes(sub.stage) && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-success">
                      <CheckCircle size={12} />
                      Intake Complete • In {sub.stage.replace(/_/g, ' ')}
                    </div>
                  )}
                  {state.currentRole === 'assignment' && ['data_collection', 'submission'].includes(sub.stage) && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={12} />
                      Pending (in intake)
                    </div>
                  )}
                  {state.currentRole === 'assignment' && !['data_collection', 'submission', 'assignment'].includes(sub.stage) && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-success">
                      <CheckCircle size={12} />
                      Assigned • In {sub.stage.replace(/_/g, ' ')}
                    </div>
                  )}
                </div>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Submission Detail */}
      {selectedSubmission && canViewDetails(selectedSubmission) ? (
        <div className="flex-1 space-y-4 overflow-auto">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-3">
                    {selectedSubmission.insured.name.value}
                    <ConfidenceBadge score={selectedSubmission.confidence} />
                  </CardTitle>
                  <p className="text-muted-foreground mt-1">
                    {selectedSubmission.insured.industry.value} • {selectedSubmission.insured.city.value}, {selectedSubmission.insured.state.value}
                  </p>
                </div>
                {!canEdit(selectedSubmission) && (
                  <Badge variant="outline" className="text-muted-foreground">Read Only</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <StageProgress 
                currentStage={selectedSubmission.stage} 
                currentSubstage={selectedSubmission.substage}
              />
            </CardContent>
          </Card>

          {/* Role-specific substage views */}
          {(selectedSubmission.stage === 'data_collection' || selectedSubmission.stage === 'submission') && state.currentRole === 'intake' && (
            <IntakeSubstages
              submission={selectedSubmission}
              currentSubstage={selectedSubmission.substage as IntakeSubstage}
              onFieldEdit={(fieldPath, newValue, label, comment) => 
                handleFieldEdit(selectedSubmission.id, fieldPath, newValue, label, comment)
              }
              onAdvanceSubstage={() => handleAdvanceSubstage(selectedSubmission.id)}
            />
          )}

          {/* Intake user viewing completed cases - read-only full results */}
          {state.currentRole === 'intake' && !['data_collection', 'submission'].includes(selectedSubmission.stage) && (
            <IntakeSummaryReadOnly submission={selectedSubmission} />
          )}

          {selectedSubmission.stage === 'assignment' && state.currentRole === 'assignment' && (
            <AssignmentSubstages
              submission={selectedSubmission}
              currentSubstage={selectedSubmission.substage as AssignmentSubstage}
              underwriters={state.underwriters}
              onAssignUnderwriter={(uw) => handleAssignUnderwriter(selectedSubmission.id, uw)}
              onAdvanceSubstage={() => handleAdvanceSubstage(selectedSubmission.id)}
            />
          )}

{['risk_assessment', 'pricing', 'quotation', 'binding'].includes(selectedSubmission.stage) && state.currentRole === 'underwriting' && (
            <UnderwritingSubstages
              submission={selectedSubmission}
              currentSubstage={selectedSubmission.substage as UnderwritingSubstage}
              onFieldEdit={(fieldPath, newValue, label, comment) => 
                handleFieldEdit(selectedSubmission.id, fieldPath, newValue, label, comment)
              }
              onAdvanceSubstage={() => handleAdvanceSubstage(selectedSubmission.id)}
            />
          )}

          {/* Assignment user viewing cases not in assignment stage - read-only status */}
          {state.currentRole === 'assignment' && selectedSubmission.stage !== 'assignment' && (
            ['data_collection', 'submission'].includes(selectedSubmission.stage) ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Clock size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="font-medium">Pending Assignment</p>
                    <p className="text-sm mt-1">
                      This submission is in intake ({selectedSubmission.stage.replace(/_/g, ' ')}) and will arrive for assignment once intake is complete.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <AssignmentSummaryReadOnly submission={selectedSubmission} underwriters={state.underwriters} />
            )
          )}

{/* Underwriting user viewing cases not in their stages */}
          {state.currentRole === 'underwriting' && !['risk_assessment', 'pricing', 'quotation', 'binding'].includes(selectedSubmission.stage) && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Clock size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Pending Underwriting</p>
                  <p className="text-sm mt-1">
                    This submission is currently in {selectedSubmission.stage.replace(/_/g, ' ')} and will arrive for underwriting once earlier stages are complete.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : selectedSubmission && !canViewDetails(selectedSubmission) ? (
        <Card className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <AlertTriangle size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium">Access Restricted</p>
            <p className="text-sm mt-1">This submission is not accessible in your current role</p>
          </div>
        </Card>
      ) : (
        <Card className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <FileCheck size={48} className="mx-auto mb-4 opacity-30" />
            <p>Select a submission to view details</p>
          </div>
        </Card>
      )}
    </div>
  );
}

// Helper functions
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc?.[part], obj)?.value;
}

function updateNestedField(obj: any, path: string, newValue: any): any {
  const parts = path.split('.');
  const result = JSON.parse(JSON.stringify(obj));
  let current = result;
  
  for (let i = 0; i < parts.length - 1; i++) {
    current = current[parts[i]];
  }
  
  const field = current[parts[parts.length - 1]];
  if (field && typeof field === 'object' && 'value' in field) {
    field.originalValue = field.value;
    field.value = newValue;
    field.isEdited = true;
    field.editedBy = 'Current User';
    field.editedAt = new Date().toISOString();
  }
  
  return result;
}

function calculateDownstreamImpact(fieldPath: string): string[] {
  const impacts: Record<string, string[]> = {
    'controls.hasEDR': ['Risk Score', 'Controls Score', 'Pricing Loadings', 'Coverage Conditions'],
    'controls.hasMFA': ['Controls Score', 'Risk Score'],
    'controls.hasSOC2': ['Controls Score', 'Pricing Credits'],
    'insured.annualRevenue': ['Base Premium', 'Rate per Million'],
    'insured.employeeCount': ['Base Premium', 'Risk Score'],
    'riskProfile.overallScore': ['Pricing', 'Coverage Recommendations'],
    'riskProfile.controlsScore': ['Overall Risk Score', 'Pricing Loadings'],
    'quote.pricing.basePremium': ['Final Premium', 'Total Cost'],
    'quote.pricing.finalPremium': ['Total Cost'],
  };
  
  return impacts[fieldPath] || ['Downstream calculations may be affected'];
}

function recalculateDownstream(submission: Submission, fieldPath: string): Submission {
  const result = { ...submission };
  
  // If EDR changed, recalculate risk scores
  if (fieldPath === 'controls.hasEDR' && result.riskProfile) {
    const hasEDR = result.controls.hasEDR.value;
    const currentOverall = result.riskProfile.overallScore.value;
    const currentControls = result.riskProfile.controlsScore.value;
    
    // EDR adds/removes 15 points from controls and 10 from overall
    result.riskProfile = {
      ...result.riskProfile,
      controlsScore: {
        ...result.riskProfile.controlsScore,
        value: hasEDR ? Math.min(100, currentControls + 15) : Math.max(0, currentControls - 15),
        isEdited: true,
      },
      overallScore: {
        ...result.riskProfile.overallScore,
        value: hasEDR ? Math.max(0, currentOverall - 10) : Math.min(100, currentOverall + 10),
        isEdited: true,
      },
    };
    
    // Update pricing if quote exists
    if (result.quote?.pricing) {
      const currentLoadings = result.quote.pricing.riskLoadings;
      if (hasEDR) {
        // Remove EDR loading
        result.quote.pricing.riskLoadings = currentLoadings.filter(l => !l.reason.toLowerCase().includes('edr'));
      } else {
        // Add EDR loading if not present
        if (!currentLoadings.some(l => l.reason.toLowerCase().includes('edr'))) {
          result.quote.pricing.riskLoadings = [
            ...currentLoadings,
            { reason: 'EDR not confirmed', amount: 8400, percentage: 20 },
          ];
        }
      }
      
      // Recalculate final premium
      const base = result.quote.pricing.basePremium.value;
      const totalLoadings = result.quote.pricing.riskLoadings.reduce((sum, l) => sum + l.amount, 0);
      const totalCredits = result.quote.pricing.credits.reduce((sum, c) => sum + c.amount, 0);
      const finalPremium = base + totalLoadings + totalCredits;
      
      result.quote.pricing.finalPremium = {
        ...result.quote.pricing.finalPremium,
        value: finalPremium,
        isEdited: true,
      };
      result.quote.pricing.totalCost = {
        ...result.quote.pricing.totalCost,
        value: finalPremium + result.quote.pricing.taxesAndFees,
        isEdited: true,
      };
    }
  }
  
  return result;
}
