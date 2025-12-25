import { useState } from 'react';
import { useAppState } from '@/context/AppContext';
import { BrokerEmail, Submission } from '@/types/underwriting';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  Mail, 
  Paperclip, 
  FileText, 
  Download, 
  Loader2, 
  CheckCircle,
  Clock,
  User
} from 'lucide-react';
import { format } from 'date-fns';
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
  producers 
} from '@/data/mockData';

export function InboxPage() {
  const { state, dispatch } = useAppState();
  const [selectedEmail, setSelectedEmail] = useState<BrokerEmail | null>(null);
  const [ingesting, setIngesting] = useState<string | null>(null);

  const handleIngest = async (email: BrokerEmail) => {
    setIngesting(email.id);
    
    // Simulate ingestion delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Determine scenario data based on email
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

    const producer = producers.find(p => p.email === email.from) || producers[0];
    
    // Calculate overall confidence based on key fields
    const keyConfidences = [
      insured.name.confidence,
      insured.industry.confidence,
      insured.annualRevenue.confidence,
      controls.hasEDR.confidence,
      controls.hasMFA.confidence,
      controls.hasSOC2.confidence,
    ];
    const avgConfidence = Math.round(keyConfidences.reduce((a, b) => a + b, 0) / keyConfidences.length);
    
    // Check for low confidence fields (below 70%)
    const hasLowConfidence = keyConfidences.some(c => c < 70);
    const lowConfidenceField = controls.hasEDR.confidence < 70 ? 'EDR status' : 
      controls.hasMFA.confidence < 70 ? 'MFA status' : 
      insured.annualRevenue.confidence < 70 ? 'Annual revenue' : null;
    
    const submission: Submission = {
      id: `sub-${Date.now()}`,
      scenarioId,
      stage: 'data_collection',
      substage: 'document_parsing',
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
    dispatch({ 
      type: 'UPDATE_EMAIL', 
      payload: { ...email, isIngested: true, isRead: true } 
    });
    setIngesting(null);
    setSelectedEmail(null);
  };

  const unreadCount = state.emails.filter(e => !e.isRead && !e.isIngested).length;

  return (
    <div className="flex gap-4" style={{ height: 'calc(100vh - 10rem)' }}>
      {/* Email List */}
      <Card className="w-96 flex-shrink-0 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail size={20} className="text-primary" />
              Inbox
            </CardTitle>
            {unreadCount > 0 && (
              <Badge className="bg-primary">{unreadCount} new</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {state.emails.map(email => (
              <div
                key={email.id}
                onClick={() => {
                  setSelectedEmail(email);
                  if (!email.isRead) {
                    dispatch({ type: 'UPDATE_EMAIL', payload: { ...email, isRead: true }});
                  }
                }}
                className={cn(
                  'p-4 border-b border-border cursor-pointer transition-colors',
                  selectedEmail?.id === email.id && 'bg-primary/10',
                  !email.isRead && !email.isIngested && 'bg-accent/10',
                  email.isIngested && 'opacity-60'
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-medium text-sm truncate">{email.from.split('@')[0]}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(email.receivedAt), 'HH:mm')}
                  </span>
                </div>
                <p className="text-sm font-medium truncate mb-1">{email.subject}</p>
                <div className="flex items-center gap-2">
                  {email.attachments.length > 0 && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Paperclip size={10} />
                      {email.attachments.length}
                    </span>
                  )}
                  {email.isIngested && (
                    <Badge variant="outline" className="text-xs text-success border-success">
                      <CheckCircle size={10} className="mr-1" />
                      Ingested
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Email Detail */}
      {selectedEmail ? (
        <Card className="flex-1">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl mb-2">{selectedEmail.subject}</CardTitle>
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
              </div>
              {!selectedEmail.isIngested && (
                <Button 
                  onClick={() => handleIngest(selectedEmail)}
                  disabled={ingesting === selectedEmail.id}
                  className="bg-gradient-primary"
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
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm prose-invert max-w-none mb-6">
              <pre className="whitespace-pre-wrap bg-muted/30 p-4 rounded-lg text-sm font-sans">
                {selectedEmail.body}
              </pre>
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
          </CardContent>
        </Card>
      ) : (
        <Card className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Mail size={48} className="mx-auto mb-4 opacity-30" />
            <p>Select an email to view details</p>
          </div>
        </Card>
      )}
    </div>
  );
}
