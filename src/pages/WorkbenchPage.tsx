import { useAppState } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StageProgress } from '@/components/StageProgress';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { ThreatSignals } from '@/components/ThreatSignals';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Shield, 
  DollarSign, 
  FileCheck,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  User
} from 'lucide-react';
import { format } from 'date-fns';

export function WorkbenchPage() {
  const { state, dispatch } = useAppState();
  
  const roleSubmissions = state.submissions.filter(s => {
    if (state.currentRole === 'intake') return s.stage === 'intake';
    if (state.currentRole === 'assignment') return s.stage === 'assignment';
    if (state.currentRole === 'underwriting') return ['underwriting', 'quoted'].includes(s.stage);
    return true;
  });

  const selectedSubmission = state.submissions.find(s => s.id === state.selectedSubmissionId);

  const handleAdvanceStage = (submissionId: string) => {
    const sub = state.submissions.find(s => s.id === submissionId);
    if (!sub) return;

    let newStage = sub.stage;
    let newSubstage = sub.substage;

    if (sub.stage === 'intake') {
      newStage = 'assignment';
      newSubstage = 'workload_balance';
    } else if (sub.stage === 'assignment') {
      newStage = 'underwriting';
      newSubstage = 'risk_profiling';
    }

    dispatch({ 
      type: 'ADVANCE_STAGE', 
      payload: { submissionId, newStage, substage: newSubstage }
    });
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
                      {sub.substage.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  {sub.requiresHumanReview && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-warning">
                      <AlertTriangle size={12} />
                      Review required
                    </div>
                  )}
                </div>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Submission Detail */}
      {selectedSubmission ? (
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
                <Button onClick={() => handleAdvanceStage(selectedSubmission.id)}>
                  Advance Stage <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <StageProgress 
                currentStage={selectedSubmission.stage} 
                currentSubstage={selectedSubmission.substage}
              />
            </CardContent>
          </Card>

          <Tabs defaultValue="insured" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="insured"><Building2 size={14} className="mr-2" />Insured</TabsTrigger>
              <TabsTrigger value="controls"><Shield size={14} className="mr-2" />Controls</TabsTrigger>
              <TabsTrigger value="risk"><AlertTriangle size={14} className="mr-2" />Risk</TabsTrigger>
              <TabsTrigger value="pricing"><DollarSign size={14} className="mr-2" />Pricing</TabsTrigger>
            </TabsList>

            <TabsContent value="insured">
              <Card>
                <CardContent className="pt-6 grid grid-cols-2 gap-4">
                  {Object.entries({
                    'Company Name': selectedSubmission.insured.name,
                    'Industry': selectedSubmission.insured.industry,
                    'Revenue': { ...selectedSubmission.insured.annualRevenue, value: `$${(selectedSubmission.insured.annualRevenue.value / 1000000).toFixed(1)}M` },
                    'Employees': selectedSubmission.insured.employeeCount,
                    'Website': selectedSubmission.insured.website,
                    'SIC Code': selectedSubmission.insured.sicCode,
                  }).map(([label, field]) => (
                    <div key={label} className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase">{label}</p>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{String(field.value)}</span>
                        <ConfidenceBadge score={field.confidence} size="sm" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="controls">
              <Card>
                <CardContent className="pt-6 grid grid-cols-3 gap-4">
                  {[
                    { label: 'MFA', field: selectedSubmission.controls.hasMFA },
                    { label: 'EDR', field: selectedSubmission.controls.hasEDR },
                    { label: 'SOC2', field: selectedSubmission.controls.hasSOC2 },
                    { label: 'Backups', field: selectedSubmission.controls.hasBackups },
                    { label: 'IR Plan', field: selectedSubmission.controls.hasIncidentResponsePlan },
                    { label: 'Training', field: selectedSubmission.controls.hasSecurityTraining },
                  ].map(({ label, field }) => (
                    <div key={label} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm">{label}</span>
                      <div className="flex items-center gap-2">
                        {field.value ? (
                          <CheckCircle size={16} className="text-success" />
                        ) : (
                          <AlertTriangle size={16} className="text-destructive" />
                        )}
                        <ConfidenceBadge score={field.confidence} size="sm" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="risk">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  {selectedSubmission.riskProfile && (
                    <>
                      <div className="grid grid-cols-4 gap-4">
                        {[
                          { label: 'Overall', score: selectedSubmission.riskProfile.overallScore },
                          { label: 'Industry', score: selectedSubmission.riskProfile.industryRisk },
                          { label: 'Controls', score: selectedSubmission.riskProfile.controlsScore },
                          { label: 'Threat', score: selectedSubmission.riskProfile.threatExposure },
                        ].map(({ label, score }) => (
                          <div key={label} className="text-center p-4 bg-muted/30 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-2">{label} Risk</p>
                            <p className="text-2xl font-bold">{score.value}</p>
                            <ConfidenceBadge score={score.confidence} size="sm" />
                          </div>
                        ))}
                      </div>
                      <ThreatSignals signals={selectedSubmission.riskProfile.threatSignals} />
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">Pricing details will appear after risk assessment</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
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
