import { useState } from 'react';
import { useAppState } from '@/context/AppContext';
import { BrokerEmail, PortalSubmission, EDISubmission, Submission } from '@/types/underwriting';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  Mail, 
  Paperclip, 
  FileText, 
  Download, 
  Loader2, 
  CheckCircle,
  Clock,
  User,
  Globe,
  Zap,
  ChevronDown,
  ChevronRight,
  Building2,
  DollarSign,
  Calendar,
  Eye,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  acmeInsured, 
  acmeControls, 
  acmeRiskProfile,
  zenithInsured,
  zenithControls,
  zenithRiskProfile,
  edgecaseInsured,
  edgecaseControls,
  edgecaseRiskProfile,
  producers,
} from '@/data/mockData';

export function SubmissionQueuePage() {
  const { state, dispatch } = useAppState();
  const [ingesting, setIngesting] = useState<string | null>(null);
  const [emailSectionOpen, setEmailSectionOpen] = useState(true);
  const [portalSectionOpen, setPortalSectionOpen] = useState(true);
  const [ediSectionOpen, setEdiSectionOpen] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<BrokerEmail | null>(null);
  const [selectedPortal, setSelectedPortal] = useState<PortalSubmission | null>(null);
  const [selectedEDI, setSelectedEDI] = useState<EDISubmission | null>(null);

  const { portalSubmissions, ediSubmissions } = state;

  const handleIngestEmail = async (email: BrokerEmail) => {
    setIngesting(email.id);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let insured, controls, riskProfile, scenarioId;
    if (email.subject.includes('ACME')) {
      insured = acmeInsured;
      controls = acmeControls;
      riskProfile = acmeRiskProfile;
      scenarioId = 'scenario-a';
    } else if (email.subject.includes('Zenith')) {
      insured = zenithInsured;
      controls = zenithControls;
      riskProfile = zenithRiskProfile;
      scenarioId = 'scenario-b';
    } else {
      insured = edgecaseInsured;
      controls = edgecaseControls;
      riskProfile = edgecaseRiskProfile;
      scenarioId = 'scenario-c';
    }

    const producer = producers.find(p => p.email.value === email.from) || producers[0];
    
    const keyConfidences = [
      insured.name.confidence,
      insured.industry.confidence,
      insured.annualRevenue.confidence,
      controls.hasEDR.confidence,
      controls.hasMFA.confidence,
      controls.hasSOC2.confidence,
    ];
    const avgConfidence = Math.round(keyConfidences.reduce((a, b) => a + b, 0) / keyConfidences.length);
    const hasLowConfidence = keyConfidences.some(c => c < 70);
    const lowConfidenceField = controls.hasEDR.confidence < 70 ? 'EDR status' : 
      controls.hasMFA.confidence < 70 ? 'MFA status' : 
      insured.annualRevenue.confidence < 70 ? 'Annual revenue' : null;
    
    const submission: Submission = {
      id: `sub-${Date.now()}`,
      scenarioId,
      stage: 'data_collection',
      substage: 'document_parsing',
      source: 'email',
      sourceEmail: email,
      producer,
      insured,
      controls,
      riskProfile,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [{
        id: `event-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'stage_change',
        actor: 'System',
        actorRole: 'intake',
        description: 'Submission created from email ingestion',
      }],
      feedbackLog: [],
      confidence: avgConfidence,
      requiresHumanReview: hasLowConfidence,
      reviewReason: hasLowConfidence ? `Low confidence on ${lowConfidenceField} - requires manual verification` : undefined,
    };

    dispatch({ type: 'ADD_SUBMISSION', payload: submission });
    dispatch({ type: 'UPDATE_EMAIL', payload: { ...email, isIngested: true, isRead: true } });
    setIngesting(null);
    setSelectedEmail(null);
  };

  const handleIngestPortal = async (portal: PortalSubmission) => {
    setIngesting(portal.id);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const producer = producers[0];
    const avgConfidence = portal.metadataCompleteness;
    const hasLowConfidence = avgConfidence < 80;
    
    const submission: Submission = {
      id: `sub-${Date.now()}`,
      scenarioId: 'scenario-portal',
      stage: 'data_collection',
      substage: 'document_parsing',
      source: 'portal',
      sourcePortal: { ...portal, isIngested: true },
      producer,
      insured: {
        ...zenithInsured,
        name: { ...zenithInsured.name, value: portal.insuredName, confidence: 95 },
        industry: { ...zenithInsured.industry, value: portal.industry, confidence: 90 },
        annualRevenue: { ...zenithInsured.annualRevenue, value: portal.annualRevenue, confidence: 92 },
        employeeCount: { ...zenithInsured.employeeCount, value: portal.employeeCount, confidence: 94 },
        state: { ...zenithInsured.state, value: portal.state, confidence: 98 },
      },
      controls: zenithControls,
      riskProfile: zenithRiskProfile,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [{
        id: `event-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'stage_change',
        actor: 'System',
        actorRole: 'intake',
        description: 'Submission created from portal ingestion',
      }],
      feedbackLog: [],
      confidence: avgConfidence,
      requiresHumanReview: hasLowConfidence,
      reviewReason: hasLowConfidence ? 'Metadata completeness below threshold' : undefined,
    };

    dispatch({ type: 'ADD_SUBMISSION', payload: submission });
    dispatch({ type: 'UPDATE_PORTAL_SUBMISSION', payload: { ...portal, isIngested: true } });
    setIngesting(null);
    setSelectedPortal(null);
  };

  const handleIngestEDI = async (edi: EDISubmission) => {
    setIngesting(edi.id);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const producer = producers[1];
    const avgConfidence = edi.structuredDataConfidence;
    const hasLowConfidence = avgConfidence < 85 || (edi.validationErrors?.length || 0) > 0;
    
    const submission: Submission = {
      id: `sub-${Date.now()}`,
      scenarioId: 'scenario-edi',
      stage: 'data_collection',
      substage: 'document_parsing',
      source: 'edi',
      sourceEDI: { ...edi, isIngested: true },
      producer,
      insured: {
        ...zenithInsured,
        name: { ...zenithInsured.name, value: edi.insuredName, confidence: 98 },
        industry: { ...zenithInsured.industry, value: edi.industry, confidence: 95 },
        annualRevenue: { ...zenithInsured.annualRevenue, value: edi.annualRevenue, confidence: 97 },
        employeeCount: { ...zenithInsured.employeeCount, value: edi.employeeCount, confidence: 98 },
        state: { ...zenithInsured.state, value: edi.state, confidence: 99 },
      },
      controls: zenithControls,
      riskProfile: zenithRiskProfile,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [{
        id: `event-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'stage_change',
        actor: 'System',
        actorRole: 'intake',
        description: 'Submission created from EDI/API ingestion',
      }],
      feedbackLog: [],
      confidence: avgConfidence,
      requiresHumanReview: hasLowConfidence,
      reviewReason: hasLowConfidence ? 
        (edi.validationErrors?.length ? `Validation errors: ${edi.validationErrors.join(', ')}` : 'Confidence below threshold') 
        : undefined,
    };

    dispatch({ type: 'ADD_SUBMISSION', payload: submission });
    dispatch({ type: 'UPDATE_EDI_SUBMISSION', payload: { ...edi, isIngested: true } });
    setIngesting(null);
    setSelectedEDI(null);
  };

  const pendingEmailCount = state.emails.filter(e => !e.isIngested).length;
  const pendingPortalCount = portalSubmissions.filter(p => !p.isIngested).length;
  const pendingEDICount = ediSubmissions.filter(e => !e.isIngested).length;
  
  const ingestedEmailCount = state.emails.filter(e => e.isIngested).length;
  const ingestedPortalCount = portalSubmissions.filter(p => p.isIngested).length;
  const ingestedEDICount = ediSubmissions.filter(e => e.isIngested).length;
  
  const totalPending = pendingEmailCount + pendingPortalCount + pendingEDICount;
  const totalIngested = ingestedEmailCount + ingestedPortalCount + ingestedEDICount;
  const totalSubmissions = totalPending + totalIngested;

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 75) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="space-y-6" style={{ minHeight: 'calc(100vh - 10rem)' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Submission Queue</h1>
          <p className="text-muted-foreground">Incoming submissions from all channels</p>
        </div>
      </div>

      {/* Summary Section */}
      <Card className="bg-gradient-to-r from-card to-muted/30">
        <CardContent className="p-6">
          <div className="grid grid-cols-6 gap-4">
            {/* Channel Breakdown */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Mail size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingEmailCount}</p>
                  <p className="text-xs text-muted-foreground">pending</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Portal</h3>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Globe size={20} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingPortalCount}</p>
                  <p className="text-xs text-muted-foreground">pending</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">EDI/API</h3>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Zap size={20} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingEDICount}</p>
                  <p className="text-xs text-muted-foreground">pending</p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-l border-border" />
            
            {/* Totals */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Yet to Ingest</h3>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Clock size={20} className="text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning">{totalPending}</p>
                  <p className="text-xs text-muted-foreground">submissions</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Ingested</h3>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-success/10">
                  <CheckCircle size={20} className="text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-success">{totalIngested}</p>
                  <p className="text-xs text-muted-foreground">submissions</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Inbox Section */}
      <Collapsible open={emailSectionOpen} onOpenChange={setEmailSectionOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-3">
                  {emailSectionOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  <Mail size={20} className="text-primary" />
                  Email Inbox
                  {state.emails.filter(e => !e.isRead && !e.isIngested).length > 0 && (
                    <Badge className="bg-primary ml-2">Unread: {state.emails.filter(e => !e.isRead && !e.isIngested).length}</Badge>
                  )}
                </CardTitle>
                <Badge variant="secondary">{state.emails.filter(e => !e.isIngested).length} pending</Badge>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <ScrollArea className="h-80">
                <div className="space-y-3">
                  {state.emails.filter(e => !e.isIngested).map(email => (
                    <Card 
                      key={email.id}
                      className={cn(
                        'cursor-pointer transition-all hover:shadow-md',
                        !email.isRead && 'border-primary/50 bg-primary/5'
                      )}
                      onClick={() => {
                        setSelectedEmail(email);
                        if (!email.isRead) {
                          dispatch({ type: 'UPDATE_EMAIL', payload: { ...email, isRead: true }});
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                <Mail size={10} className="mr-1" />
                                Email
                              </Badge>
                              {!email.isRead && (
                                <Badge className="bg-primary text-xs">New</Badge>
                              )}
                            </div>
                            <h4 className="font-medium truncate">{email.subject}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <User size={12} />
                                {email.from.split('@')[0]}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {formatDistanceToNow(new Date(email.receivedAt), { addSuffix: true })}
                              </span>
                              {email.attachments.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Paperclip size={12} />
                                  {email.attachments.length} files
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            disabled={ingesting === email.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleIngestEmail(email);
                            }}
                          >
                            {ingesting === email.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <>
                                <Download size={14} className="mr-1" />
                                Ingest
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {state.emails.filter(e => !e.isIngested).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Mail size={32} className="mx-auto mb-2 opacity-30" />
                      <p>No pending emails</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Portal Feed Section */}
      <Collapsible open={portalSectionOpen} onOpenChange={setPortalSectionOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-3">
                  {portalSectionOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  <Globe size={20} className="text-blue-500" />
                  Portal Submissions
                </CardTitle>
                <Badge variant="secondary">{pendingPortalCount} pending</Badge>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4">
                Submissions from carrier's broker portal - structured data with higher reliability
              </p>
              <ScrollArea className="h-80">
                <div className="space-y-3">
                  {portalSubmissions.filter(p => !p.isIngested).map(portal => (
                    <Card key={portal.id} className="hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs bg-blue-500/10 border-blue-500/30">
                                <Globe size={10} className="mr-1" />
                                Portal
                              </Badge>
                              <span className="text-xs text-muted-foreground">{portal.submissionId}</span>
                            </div>
                            <h4 className="font-medium">{portal.insuredName}</h4>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
                              <span className="flex items-center gap-1">
                                <Building2 size={12} />
                                {portal.brokerName}
                              </span>
                              <span className="flex items-center gap-1">
                                <User size={12} />
                                {portal.producerName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {formatDistanceToNow(new Date(portal.receivedAt), { addSuffix: true })}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign size={12} />
                                ${(portal.requestedLimit / 1000000).toFixed(0)}M limit
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                              <span className="text-xs text-muted-foreground">Completeness:</span>
                              <Progress value={portal.metadataCompleteness} className="h-2 flex-1 max-w-24" />
                              <span className={cn('text-xs font-medium', getConfidenceColor(portal.metadataCompleteness))}>
                                {portal.metadataCompleteness}%
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedPortal(portal)}
                            >
                              <Eye size={14} className="mr-1" />
                              Details
                            </Button>
                            <Button
                              size="sm"
                              disabled={ingesting === portal.id}
                              onClick={() => handleIngestPortal(portal)}
                            >
                              {ingesting === portal.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <>
                                  <Download size={14} className="mr-1" />
                                  Ingest
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {pendingPortalCount === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Globe size={32} className="mx-auto mb-2 opacity-30" />
                      <p>No pending portal submissions</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* EDI / API Feed Section */}
      <Collapsible open={ediSectionOpen} onOpenChange={setEdiSectionOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-3">
                  {ediSectionOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  <Zap size={20} className="text-amber-500" />
                  EDI / API Submissions
                </CardTitle>
                <Badge variant="secondary">{pendingEDICount} pending</Badge>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4">
                Submissions via ACORD XML/JSON or API POST - typically highest confidence level
              </p>
              <ScrollArea className="h-80">
                <div className="space-y-3">
                  {ediSubmissions.filter(e => !e.isIngested).map(edi => (
                    <Card key={edi.id} className="hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs bg-amber-500/10 border-amber-500/30">
                                <Zap size={10} className="mr-1" />
                                EDI/API
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {edi.schemaVersion}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{edi.submissionId}</span>
                            </div>
                            <h4 className="font-medium">{edi.insuredName}</h4>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
                              <span className="flex items-center gap-1">
                                <Shield size={12} />
                                {edi.partnerName}
                              </span>
                              <span className="flex items-center gap-1 font-mono text-xs">
                                {edi.apiKeyName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {formatDistanceToNow(new Date(edi.receivedAt), { addSuffix: true })}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign size={12} />
                                ${(edi.requestedLimit / 1000000).toFixed(0)}M limit
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                              <span className="text-xs text-muted-foreground">Confidence:</span>
                              <Progress value={edi.structuredDataConfidence} className="h-2 flex-1 max-w-24" />
                              <span className={cn('text-xs font-medium', getConfidenceColor(edi.structuredDataConfidence))}>
                                {edi.structuredDataConfidence}%
                              </span>
                            </div>
                            {edi.validationErrors && edi.validationErrors.length > 0 && (
                              <div className="flex items-start gap-2 mt-2 p-2 bg-destructive/10 rounded text-xs text-destructive">
                                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                <span>{edi.validationErrors.join(', ')}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedEDI(edi)}
                            >
                              <Eye size={14} className="mr-1" />
                              Details
                            </Button>
                            <Button
                              size="sm"
                              disabled={ingesting === edi.id}
                              onClick={() => handleIngestEDI(edi)}
                            >
                              {ingesting === edi.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <>
                                  <Download size={14} className="mr-1" />
                                  Ingest
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {pendingEDICount === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Zap size={32} className="mx-auto mb-2 opacity-30" />
                      <p>No pending EDI/API submissions</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Email Detail Dialog */}
      <Dialog open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEmail?.subject}</DialogTitle>
          </DialogHeader>
          {selectedEmail && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User size={14} />
                  {selectedEmail.from}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {format(new Date(selectedEmail.receivedAt), 'MMM d, yyyy HH:mm')}
                </span>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm font-sans">{selectedEmail.body}</pre>
              </div>
              {selectedEmail.attachments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Paperclip size={14} />
                    Attachments ({selectedEmail.attachments.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedEmail.attachments.map(att => (
                      <div
                        key={att.id}
                        className="flex items-center gap-3 bg-muted/30 rounded-lg p-3 border border-border/50"
                      >
                        <FileText size={24} className="text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{att.filename}</p>
                          <p className="text-xs text-muted-foreground">{att.size}</p>
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">
                          {att.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end">
                <Button 
                  onClick={() => handleIngestEmail(selectedEmail)}
                  disabled={ingesting === selectedEmail.id}
                >
                  {ingesting === selectedEmail.id ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Ingesting...
                    </>
                  ) : (
                    <>
                      <Download size={16} className="mr-2" />
                      Ingest Submission
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Portal Detail Dialog */}
      <Dialog open={!!selectedPortal} onOpenChange={() => setSelectedPortal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Portal Submission Details</DialogTitle>
          </DialogHeader>
          {selectedPortal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Insured Name</label>
                  <p className="font-medium">{selectedPortal.insuredName}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Industry</label>
                  <p className="font-medium">{selectedPortal.industry}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Broker</label>
                  <p className="font-medium">{selectedPortal.brokerName}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Producer</label>
                  <p className="font-medium">{selectedPortal.producerName}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Submission ID</label>
                  <p className="font-mono text-sm">{selectedPortal.submissionId}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Received</label>
                  <p className="font-medium">{format(new Date(selectedPortal.receivedAt), 'MMM d, yyyy HH:mm')}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Requested Limit</label>
                  <p className="font-medium">${selectedPortal.requestedLimit.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Requested Deductible</label>
                  <p className="font-medium">${selectedPortal.requestedDeductible.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Annual Revenue</label>
                  <p className="font-medium">${selectedPortal.annualRevenue.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Employees</label>
                  <p className="font-medium">{selectedPortal.employeeCount}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Effective Date</label>
                  <p className="font-medium">{format(new Date(selectedPortal.effectiveDate), 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">State</label>
                  <p className="font-medium">{selectedPortal.state}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Metadata Completeness:</span>
                <Progress value={selectedPortal.metadataCompleteness} className="h-2 flex-1" />
                <span className={cn('text-sm font-medium', getConfidenceColor(selectedPortal.metadataCompleteness))}>
                  {selectedPortal.metadataCompleteness}%
                </span>
              </div>
              {selectedPortal.notes && (
                <div className="bg-muted/30 p-3 rounded-lg text-sm">
                  <strong>Notes:</strong> {selectedPortal.notes}
                </div>
              )}
              <div className="flex justify-end">
                <Button 
                  onClick={() => handleIngestPortal(selectedPortal)}
                  disabled={ingesting === selectedPortal.id}
                >
                  {ingesting === selectedPortal.id ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Ingesting...
                    </>
                  ) : (
                    <>
                      <Download size={16} className="mr-2" />
                      Ingest Submission
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* EDI Detail Dialog */}
      <Dialog open={!!selectedEDI} onOpenChange={() => setSelectedEDI(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>EDI/API Submission Details</DialogTitle>
          </DialogHeader>
          {selectedEDI && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Insured Name</label>
                  <p className="font-medium">{selectedEDI.insuredName}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Industry</label>
                  <p className="font-medium">{selectedEDI.industry}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Partner</label>
                  <p className="font-medium">{selectedEDI.partnerName}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">API Key</label>
                  <p className="font-mono text-sm">{selectedEDI.apiKeyName}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Submission ID</label>
                  <p className="font-mono text-sm">{selectedEDI.submissionId}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Schema Version</label>
                  <Badge variant="outline">{selectedEDI.schemaVersion}</Badge>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Requested Limit</label>
                  <p className="font-medium">${selectedEDI.requestedLimit.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Requested Deductible</label>
                  <p className="font-medium">${selectedEDI.requestedDeductible.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Annual Revenue</label>
                  <p className="font-medium">${selectedEDI.annualRevenue.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Employees</label>
                  <p className="font-medium">{selectedEDI.employeeCount}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Effective Date</label>
                  <p className="font-medium">{format(new Date(selectedEDI.effectiveDate), 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">State</label>
                  <p className="font-medium">{selectedEDI.state}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Structured Data Confidence:</span>
                <Progress value={selectedEDI.structuredDataConfidence} className="h-2 flex-1" />
                <span className={cn('text-sm font-medium', getConfidenceColor(selectedEDI.structuredDataConfidence))}>
                  {selectedEDI.structuredDataConfidence}%
                </span>
              </div>
              {selectedEDI.validationErrors && selectedEDI.validationErrors.length > 0 && (
                <div className="bg-destructive/10 p-3 rounded-lg text-sm text-destructive">
                  <strong className="flex items-center gap-2">
                    <AlertTriangle size={14} />
                    Validation Errors:
                  </strong>
                  <ul className="list-disc list-inside mt-1">
                    {selectedEDI.validationErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              {Object.keys(selectedEDI.acordData).length > 0 && (
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">ACORD Data</label>
                  <pre className="bg-muted/30 p-3 rounded-lg text-xs font-mono overflow-x-auto">
                    {JSON.stringify(selectedEDI.acordData, null, 2)}
                  </pre>
                </div>
              )}
              <div className="flex justify-end">
                <Button 
                  onClick={() => handleIngestEDI(selectedEDI)}
                  disabled={ingesting === selectedEDI.id}
                >
                  {ingesting === selectedEDI.id ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Ingesting...
                    </>
                  ) : (
                    <>
                      <Download size={16} className="mr-2" />
                      Ingest Submission
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
