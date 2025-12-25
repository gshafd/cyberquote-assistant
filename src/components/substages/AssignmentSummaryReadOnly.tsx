import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { Submission, Underwriter } from '@/types/underwriting';
import {
  Users,
  CheckCircle,
  Briefcase,
  Target,
  UserCheck,
} from 'lucide-react';

interface AssignmentSummaryReadOnlyProps {
  submission: Submission;
  underwriters: Underwriter[];
}

export function AssignmentSummaryReadOnly({ submission, underwriters }: AssignmentSummaryReadOnlyProps) {
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
      {/* Header Status */}
      <div className="p-4 bg-success/10 border border-success/30 rounded-lg flex items-center gap-4">
        <CheckCircle size={32} className="text-success" />
        <div>
          <p className="font-medium text-success">Assignment Completed</p>
          <p className="text-sm text-muted-foreground">
            Assigned to <strong>{submission.assignedUnderwriter?.name || 'Underwriter'}</strong> • Currently in <strong>{submission.stage.replace(/_/g, ' ')}</strong> stage
          </p>
        </div>
      </div>

      {/* Intake Summary */}
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
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase size={18} className="text-success" />
            Workload Balance Analysis
            <Badge variant="outline" className="text-success border-success">Complete</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {underwriters.map(uw => (
              <div 
                key={uw.id} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  submission.assignedUnderwriter?.id === uw.id 
                    ? 'bg-primary/10 border border-primary' 
                    : 'bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                    {uw.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      {uw.name}
                      {submission.assignedUnderwriter?.id === uw.id && (
                        <Badge className="bg-success text-success-foreground">Assigned</Badge>
                      )}
                    </p>
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
        </CardContent>
      </Card>

      {/* Specialist Match Result */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target size={18} className="text-success" />
            Specialist Match
            <Badge variant="outline" className="text-success border-success">Complete</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Recommended underwriters based on industry expertise match for <strong>{submission.insured.industry.value}</strong>
          </p>
          <div className="space-y-3">
            {matchingUWs.map((uw, idx) => (
              <div 
                key={uw.id} 
                className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                  submission.assignedUnderwriter?.id === uw.id 
                    ? 'bg-primary/10 border-primary' 
                    : 'bg-muted/30 border-transparent'
                }`}
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
                  {submission.assignedUnderwriter?.id === uw.id && (
                    <Badge className="bg-success text-success-foreground">Assigned</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Rationale</p>
            <p className="text-sm">
              Matched underwriters with expertise in {submission.insured.industry.value.toLowerCase()} sector. 
              {submission.assignedUnderwriter && ` ${submission.assignedUnderwriter.name} was selected based on specialty alignment, current workload, and historical performance.`}
            </p>
            <p className="text-xs text-primary mt-2 font-mono">Source: Assignment_Rules.json, Rule AM-003</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
