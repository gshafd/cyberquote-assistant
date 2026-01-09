import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppState } from '@/context/AppContext';
import { 
  FileUp, 
  Database, 
  ShieldCheck, 
  Calculator, 
  FileText, 
  CheckCircle2,
  TrendingUp,
  Clock,
  Zap,
  Users,
  Mail,
  Globe,
} from 'lucide-react';
import { SubmissionStage } from '@/types/underwriting';
import { Link } from 'react-router-dom';

// Exclude assignment from stage display
const stageConfig: Record<Exclude<SubmissionStage, 'assignment'>, { label: string; icon: typeof FileUp; color: string }> = {
  submission: { label: 'Submission', icon: FileUp, color: 'text-blue-500' },
  data_collection: { label: 'Data Collection', icon: Database, color: 'text-amber-500' },
  risk_assessment: { label: 'Risk Assessment', icon: ShieldCheck, color: 'text-purple-500' },
  pricing: { label: 'Pricing', icon: Calculator, color: 'text-primary' },
  quotation: { label: 'Quotation', icon: FileText, color: 'text-emerald-500' },
  binding: { label: 'Binding', icon: CheckCircle2, color: 'text-green-500' },
};

export function MetricsDashboard() {
  const { state } = useAppState();
  const { metrics, submissions, underwriters, emails, portalSubmissions, ediSubmissions } = state;

  const totalSubmissions = submissions.length;
  const avgConfidence = submissions.length > 0 
    ? Math.round(submissions.reduce((sum, s) => sum + s.confidence, 0) / submissions.length)
    : 0;
  const activeUnderwriters = underwriters.filter(u => u.workload > 0).length;
  const pendingReview = submissions.filter(s => s.requiresHumanReview).length;

  // Pending queue counts (non-ingested items)
  const pendingEmailCount = emails.filter(e => !e.isIngested).length;
  const pendingPortalCount = portalSubmissions.filter(p => !p.isIngested).length;
  const pendingEDICount = ediSubmissions.filter(e => !e.isIngested).length;
  const totalPendingQueue = pendingEmailCount + pendingPortalCount + pendingEDICount;

  return (
    <div className="space-y-4">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalSubmissions}</p>
                <p className="text-xs text-muted-foreground">Total Submissions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{avgConfidence}%</p>
                <p className="text-xs text-muted-foreground">Avg AI Confidence</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingReview}</p>
                <p className="text-xs text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeUnderwriters}</p>
                <p className="text-xs text-muted-foreground">Active Underwriters</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Queue Summary */}
      <Card className="bg-gradient-to-r from-muted/30 to-muted/10 border-muted">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Submission Queue</CardTitle>
            <Link to="/queue">
              <Badge variant="outline" className="text-xs hover:bg-muted cursor-pointer">
                View Queue →
              </Badge>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-2 px-3 py-1.5 text-sm">
              <Mail size={14} className="text-primary" />
              {pendingEmailCount} Email
            </Badge>
            <Badge variant="outline" className="gap-2 px-3 py-1.5 text-sm">
              <Globe size={14} className="text-emerald-500" />
              {pendingPortalCount} Portal
            </Badge>
            <Badge variant="outline" className="gap-2 px-3 py-1.5 text-sm">
              <Zap size={14} className="text-amber-500" />
              {pendingEDICount} EDI/API
            </Badge>
            <div className="ml-auto text-sm text-muted-foreground">
              Total: <span className="font-semibold text-foreground">{totalPendingQueue}</span> pending
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stage Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Submissions by Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {(Object.keys(stageConfig) as Exclude<SubmissionStage, 'assignment'>[]).map((stage) => {
              const config = stageConfig[stage];
              const Icon = config.icon;
              // Calculate from actual submissions
              const count = submissions.filter(s => s.stage === stage).length;
              
              return (
                <div 
                  key={stage} 
                  className="flex flex-col items-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <Icon className={`w-5 h-5 ${config.color} mb-1`} />
                  <span className="text-lg font-bold text-foreground">{count}</span>
                  <span className="text-[10px] text-muted-foreground text-center">{config.label}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
