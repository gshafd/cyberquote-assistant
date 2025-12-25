import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { Submission, AssignmentSubstage, Underwriter } from '@/types/underwriting';
import {
  Users,
  UserCheck,
  CheckCircle,
  ArrowRight,
  Briefcase,
  Clock,
  Target,
  Zap,
} from 'lucide-react';

interface AssignmentSubstagesProps {
  submission: Submission;
  currentSubstage: AssignmentSubstage;
  underwriters: Underwriter[];
  onAssignUnderwriter: (underwriter: Underwriter) => void;
  onAdvanceSubstage: () => void;
}

const substageOrder: AssignmentSubstage[] = ['workload_balance', 'specialist_match', 'assignment_complete'];

export function AssignmentSubstages({
  submission,
  currentSubstage,
  underwriters,
  onAssignUnderwriter,
  onAdvanceSubstage,
}: AssignmentSubstagesProps) {
  const currentIdx = substageOrder.indexOf(currentSubstage);
  
  // Check if high confidence for auto-assignment
  const isHighConfidence = submission.confidence >= 85;

  // Find matching specialists based on industry
  const matchingUWs = underwriters.filter(
    uw => uw.specialty.some(s => 
      submission.insured.industry.value.toLowerCase().includes(s.toLowerCase()) ||
      s.toLowerCase().includes('technology') ||
      s.toLowerCase().includes('healthcare')
    )
  );

  return (
    <div className="space-y-4">
      {/* Substage Progress */}
      <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-lg">
        {substageOrder.map((substage, idx) => (
          <div key={substage} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                idx < currentIdx
                  ? 'bg-success/20 text-success'
                  : idx === currentIdx
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {idx < currentIdx ? <CheckCircle size={12} /> : null}
              {substage.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </div>
            {idx < substageOrder.length - 1 && (
              <ArrowRight size={14} className="text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Intake Summary (Read-only for Assignment) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle size={18} className="text-success" />
            Intake Summary
            <Badge variant="outline" className="text-success border-success">Completed</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Company</p>
              <p className="font-medium">{submission.insured.name.value}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Industry</p>
              <p className="font-medium">{submission.insured.industry.value}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Revenue</p>
              <p className="font-medium">${(submission.insured.annualRevenue.value / 1000000).toFixed(1)}M</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Overall Confidence</p>
              <ConfidenceBadge score={submission.confidence} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workload Balance Analysis */}
      {currentIdx >= 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase size={18} className="text-primary" />
              Workload Balance Analysis
              {currentIdx > 0 && <Badge variant="outline" className="text-success border-success">Complete</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {underwriters.map(uw => (
                <div key={uw.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                      {uw.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium">{uw.name}</p>
                      <p className="text-xs text-muted-foreground">{uw.tier} UW • {uw.specialty.slice(0, 2).join(', ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">Workload</p>
                      <p className="font-medium">{uw.workload}/{uw.maxWorkload}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">Avg Turn</p>
                      <p className="font-medium">{uw.avgTurnaround}d</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">Bind Ratio</p>
                      <p className="font-medium">{(uw.bindRatio * 100).toFixed(0)}%</p>
                    </div>
                    <div className="w-24">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(uw.workload / uw.maxWorkload) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Rationale</p>
              <p className="text-sm">Workload analysis shows available capacity across team. Priority given to UWs below 75% capacity with relevant expertise.</p>
              <p className="text-xs text-primary mt-2 font-mono">Source: Workload_Engine.json, Rule WL-001</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Specialist Match */}
      {currentIdx >= 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target size={18} className="text-primary" />
              Specialist Match
              {currentIdx > 1 && <Badge variant="outline" className="text-success border-success">Complete</Badge>}
              {isHighConfidence && currentSubstage === 'specialist_match' && !submission.assignedUnderwriter && (
                <Badge className="bg-primary/20 text-primary animate-pulse">Auto-Assigning...</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Recommended underwriters based on industry expertise match for <strong>{submission.insured.industry.value}</strong>
              {isHighConfidence && !submission.assignedUnderwriter && (
                <span className="ml-2 text-primary font-medium">(High confidence - will auto-assign best match)</span>
              )}
            </p>
            <div className="space-y-3">
              {matchingUWs.map((uw, idx) => (
                <div 
                  key={uw.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
                    submission.assignedUnderwriter?.id === uw.id 
                      ? 'bg-primary/10 border-primary' 
                      : idx === 0 && isHighConfidence && !submission.assignedUnderwriter
                      ? 'bg-primary/5 border-primary/50 animate-pulse'
                      : 'bg-muted/30 border-transparent hover:border-primary/50 cursor-pointer'
                  }`}
                  onClick={() => !submission.assignedUnderwriter && onAssignUnderwriter(uw)}
                >
                  <div className="flex items-center gap-4">
                    {idx === 0 && <Badge className="bg-accent text-accent-foreground">Best Match</Badge>}
                    <div>
                      <p className="font-medium">{uw.name}</p>
                      <p className="text-xs text-muted-foreground">Specialty: {uw.specialty.join(', ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <ConfidenceBadge score={idx === 0 ? 95 : idx === 1 ? 88 : 75} size="sm" />
                    {submission.assignedUnderwriter?.id === uw.id ? (
                      <Badge className="bg-success text-success-foreground">Assigned</Badge>
                    ) : (
                      <Button size="sm" variant="outline">Assign</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Rationale</p>
              <p className="text-sm">
                Matched underwriters with expertise in {submission.insured.industry.value.toLowerCase()} sector. 
                Scoring based on specialty alignment, current workload, and historical performance.
                {isHighConfidence && ' High confidence submissions are auto-assigned to the best match.'}
              </p>
              <p className="text-xs text-primary mt-2 font-mono">Source: Assignment_Rules.json, Rule AM-003</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advance Button */}
      {currentSubstage !== 'assignment_complete' && (
        <div className="flex justify-end">
          {isHighConfidence && currentSubstage === 'specialist_match' && !submission.assignedUnderwriter ? (
            <div className="flex items-center gap-2 text-primary animate-pulse">
              <Zap size={16} />
              <span className="text-sm font-medium">Auto-assigning (high confidence)...</span>
            </div>
          ) : (
            <Button 
              onClick={onAdvanceSubstage}
              disabled={currentSubstage === 'specialist_match' && !submission.assignedUnderwriter}
            >
              {currentSubstage === 'specialist_match' ? 'Complete Assignment' : 'Advance to Next Step'}
              <ArrowRight size={16} className="ml-2" />
            </Button>
          )}
        </div>
      )}

      {currentSubstage === 'assignment_complete' && (
        <div className="p-4 bg-success/10 border border-success/30 rounded-lg text-center">
          <CheckCircle size={24} className="mx-auto text-success mb-2" />
          <p className="font-medium text-success">Assignment Complete</p>
          <p className="text-sm text-muted-foreground">
            Assigned to {submission.assignedUnderwriter?.name} • Ready for Underwriting
          </p>
        </div>
      )}
    </div>
  );
}
