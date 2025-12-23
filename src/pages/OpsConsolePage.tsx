import { useAppState } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FeedbackLog } from '@/components/FeedbackLog';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  Activity,
  Database,
  FileText,
  Settings,
  TrendingUp,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  Upload,
  RefreshCw,
  Download,
  Zap,
} from 'lucide-react';
import { format } from 'date-fns';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--muted))'];

export function OpsConsolePage() {
  const { state } = useAppState();
  const { metrics, knowledgeBases, feedbackLog } = state;

  // Prepare chart data
  const stageData = Object.entries(metrics.submissionsByStage)
    .filter(([stage]) => stage !== 'inbox')
    .map(([stage, count]) => ({
      stage: stage.charAt(0).toUpperCase() + stage.slice(1),
      count,
    }));

  const confidenceData = Object.entries(metrics.avgConfidenceByStage)
    .filter(([stage, value]) => stage !== 'inbox' && value > 0)
    .map(([stage, confidence]) => ({
      stage: stage.charAt(0).toUpperCase() + stage.slice(1),
      confidence,
    }));

  const timeInStageData = Object.entries(metrics.avgTimeInStage)
    .filter(([stage]) => stage !== 'inbox')
    .map(([stage, hours]) => ({
      stage: stage.charAt(0).toUpperCase() + stage.slice(1),
      hours,
    }));

  const overrideData = metrics.commonOverrideReasons.map((item, idx) => ({
    ...item,
    fill: COLORS[idx % COLORS.length],
  }));

  // Mock daily metrics for the line chart
  const dailyMetrics = [
    { date: 'Mon', submissions: 12, processed: 10, bound: 6 },
    { date: 'Tue', submissions: 15, processed: 14, bound: 8 },
    { date: 'Wed', submissions: 8, processed: 9, bound: 5 },
    { date: 'Thu', submissions: 18, processed: 16, bound: 10 },
    { date: 'Fri', submissions: 22, processed: 20, bound: 12 },
    { date: 'Sat', submissions: 5, processed: 6, bound: 3 },
    { date: 'Sun', submissions: 3, processed: 4, bound: 2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Operations Console</h1>
          <p className="text-muted-foreground">Monitor metrics, manage knowledge bases, and review feedback</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="h-8 px-3">
            <Activity size={14} className="mr-2" />
            Live Mode
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw size={14} className="mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Daily Runs"
          value={metrics.dailyRuns}
          icon={<Zap className="text-primary" />}
          change="+12%"
          changeType="positive"
        />
        <MetricCard
          title="Monthly Runs"
          value={metrics.monthlyRuns}
          icon={<TrendingUp className="text-accent" />}
          change="+8%"
          changeType="positive"
        />
        <MetricCard
          title="Token Usage"
          value={`${(metrics.tokenUsage / 1000000).toFixed(2)}M`}
          icon={<Database className="text-warning" />}
          change="62% of limit"
          changeType="neutral"
        />
        <MetricCard
          title="Bind Ratio"
          value={`${(metrics.bindRatio * 100).toFixed(0)}%`}
          icon={<CheckCircle className="text-success" />}
          change="+3%"
          changeType="positive"
        />
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="metrics">
            <TrendingUp size={14} className="mr-2" />
            Metrics & Analytics
          </TabsTrigger>
          <TabsTrigger value="feedback">
            <FileText size={14} className="mr-2" />
            Feedback Log
          </TabsTrigger>
          <TabsTrigger value="knowledge">
            <Database size={14} className="mr-2" />
            Knowledge Bases
          </TabsTrigger>
          <TabsTrigger value="config">
            <Settings size={14} className="mr-2" />
            Configuration
          </TabsTrigger>
        </TabsList>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Submissions by Stage */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Submissions by Stage</CardTitle>
                <CardDescription>Current distribution across workflow stages</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="stage" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Confidence by Stage */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Average Confidence by Stage</CardTitle>
                <CardDescription>AI confidence scores across workflow stages</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={confidenceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="stage" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="confidence" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Time in Stage */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Average Time in Stage</CardTitle>
                <CardDescription>Hours spent in each workflow stage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={timeInStageData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis type="category" dataKey="stage" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} width={80} />
                    <Tooltip
                      formatter={(value: number) => [`${value} hrs`, 'Avg Time']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="hours" fill="hsl(var(--warning))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Common Override Reasons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Common Override Reasons</CardTitle>
                <CardDescription>Top reasons for human edits to AI outputs</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={overrideData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="count"
                    >
                      {overrideData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1">
                  {overrideData.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.fill }} />
                      <span className="text-muted-foreground">{item.reason}</span>
                      <span className="font-medium ml-auto">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weekly Processing Trend</CardTitle>
              <CardDescription>Submission flow over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="submissions" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="processed" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="bound" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedback Log Tab */}
        <TabsContent value="feedback" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Feedback & Override Log</CardTitle>
              <CardDescription>All human edits to AI-generated fields with diffs and downstream impact</CardDescription>
            </CardHeader>
            <CardContent>
              {feedbackLog.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText size={48} className="mx-auto mb-4 opacity-30" />
                  <p>No feedback entries yet</p>
                  <p className="text-sm mt-1">Edits made in the workbench will appear here</p>
                </div>
              ) : (
                <FeedbackLog entries={feedbackLog} showSubmissionLink />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Knowledge Bases Tab */}
        <TabsContent value="knowledge" className="mt-4">
          <div className="grid grid-cols-3 gap-4">
            {knowledgeBases.map((kb) => (
              <Card key={kb.id} className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-full" />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{kb.name}</CardTitle>
                      <CardDescription className="capitalize">{kb.type}</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      v{kb.version}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Records</p>
                      <p className="font-medium">{kb.recordCount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Last Updated</p>
                      <p className="font-medium">{format(new Date(kb.lastUpdated), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Upload size={14} className="mr-1" />
                      Update
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Model Configuration</CardTitle>
                <CardDescription>AI model and rule engine settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Risk Model Version</Label>
                      <p className="text-xs text-muted-foreground">Current production model</p>
                    </div>
                    <Badge>v3.0.0</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Rules Engine Version</Label>
                      <p className="text-xs text-muted-foreground">Decision rules configuration</p>
                    </div>
                    <Badge>v1.8.2</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Rate Tables Version</Label>
                      <p className="text-xs text-muted-foreground">Pricing rate tables</p>
                    </div>
                    <Badge>v3.0.0</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Demo Mode Settings</CardTitle>
                <CardDescription>Control deterministic behavior for demos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Deterministic Mode</Label>
                    <p className="text-xs text-muted-foreground">Lock random seeds for consistent outputs</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Use Static Threat Signals</Label>
                    <p className="text-xs text-muted-foreground">Disable live threat intelligence</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-Progress High Confidence</Label>
                    <p className="text-xs text-muted-foreground">Skip review for &gt;90% confidence</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">API Endpoints</CardTitle>
                <CardDescription>External service configurations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Threat Intelligence API</Label>
                  <Input value="https://api.threatintel.mock/v2" readOnly className="font-mono text-sm" />
                </div>
                <div className="space-y-2">
                  <Label>Shodan Scanner API</Label>
                  <Input value="https://api.shodan.mock/scan" readOnly className="font-mono text-sm" />
                </div>
                <div className="space-y-2">
                  <Label>Entity Resolution API</Label>
                  <Input value="https://api.entity.mock/resolve" readOnly className="font-mono text-sm" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Confidence Thresholds</CardTitle>
                <CardDescription>Configure auto-progress and review triggers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>High Confidence (Auto-Progress)</Label>
                  <Input type="number" defaultValue={90} min={0} max={100} />
                </div>
                <div className="space-y-2">
                  <Label>Low Confidence (Require Review)</Label>
                  <Input type="number" defaultValue={70} min={0} max={100} />
                </div>
                <div className="space-y-2">
                  <Label>Critical Confidence (Block Progress)</Label>
                  <Input type="number" defaultValue={50} min={0} max={100} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
}

function MetricCard({ title, value, icon, change, changeType }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            <p
              className={`text-xs mt-2 ${
                changeType === 'positive'
                  ? 'text-success'
                  : changeType === 'negative'
                  ? 'text-destructive'
                  : 'text-muted-foreground'
              }`}
            >
              {change}
            </p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
