import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/context/AppContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, AlertTriangle, Edit, MoreHorizontal, Search, Filter, Sparkles } from 'lucide-react';
import { SubmissionStage } from '@/types/underwriting';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const stageColors: Record<SubmissionStage, string> = {
  submission: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  data_collection: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  assignment: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  risk_assessment: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  pricing: 'bg-primary/10 text-primary border-primary/20',
  quotation: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  binding: 'bg-green-500/10 text-green-500 border-green-500/20',
};

const stageLabels: Record<SubmissionStage, string> = {
  submission: 'Submission',
  data_collection: 'Data Collection',
  assignment: 'Assignment',
  risk_assessment: 'Risk Assessment',
  pricing: 'Pricing & Rating',
  quotation: 'Quotation',
  binding: 'Binding & Issuing',
};

// AI Summary generator based on submission data
const generateAISummary = (submission: any): string => {
  const { insured, controls, riskProfile, stage } = submission;
  const industry = insured.industry.value;
  const revenue = insured.annualRevenue.value;
  const revenueInM = (revenue / 1000000).toFixed(0);
  
  if (stage === 'submission') {
    return `New ${industry} submission ($${revenueInM}M revenue). Pending document parsing and validation.`;
  }
  
  if (stage === 'data_collection') {
    const issues = [];
    if (controls.hasEDR.confidence < 70) issues.push('EDR status unclear');
    if (controls.hasMFA.confidence < 70) issues.push('MFA verification needed');
    return issues.length > 0 
      ? `${industry} company, $${revenueInM}M revenue. ${issues.join(', ')}.`
      : `${industry} company, $${revenueInM}M revenue. Data collection in progress.`;
  }
  
  if (riskProfile) {
    const riskScore = riskProfile.overallScore.value;
    const riskLevel = riskScore < 40 ? 'Low' : riskScore < 60 ? 'Moderate' : 'Elevated';
    return `${industry}, $${revenueInM}M revenue. ${riskLevel} risk (${riskScore}/100). ${controls.hasSOC2.value ? 'SOC2 certified.' : ''}`;
  }
  
  return `${industry} company with $${revenueInM}M annual revenue.`;
};

export function SubmissionsList() {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const { submissions } = state;
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [producerFilter, setProducerFilter] = useState<string>('all');

  const handleViewSubmission = (submissionId: string) => {
    dispatch({ type: 'SELECT_SUBMISSION', payload: submissionId });
    navigate('/workbench');
  };

  // Get unique producers for filter
  const uniqueProducers = Array.from(new Set(submissions.map(s => s.producer.agency)));

  // Apply filters
  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = searchQuery === '' || 
      submission.insured.name.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.producer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.producer.agency.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStage = stageFilter === 'all' || submission.stage === stageFilter;
    const matchesProducer = producerFilter === 'all' || submission.producer.agency === producerFilter;
    
    return matchesSearch && matchesStage && matchesProducer;
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            All Submissions
            <Badge variant="secondary" className="text-xs">
              {filteredSubmissions.length} of {submissions.length}
            </Badge>
          </CardTitle>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search insured or producer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 w-[200px]"
              />
            </div>
            
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="h-9 w-[150px]">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {Object.entries(stageLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={producerFilter} onValueChange={setProducerFilter}>
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="Producer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Producers</SelectItem>
                {uniqueProducers.map((producer) => (
                  <SelectItem key={producer} value={producer}>{producer}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs font-medium">Name Insured / Account</TableHead>
                <TableHead className="text-xs font-medium">Producer</TableHead>
                <TableHead className="text-xs font-medium">Submission Date</TableHead>
                <TableHead className="text-xs font-medium">Product</TableHead>
                <TableHead className="text-xs font-medium">Effective Period</TableHead>
                <TableHead className="text-xs font-medium">Stage</TableHead>
                <TableHead className="text-xs font-medium">Underwriter</TableHead>
                <TableHead className="text-xs font-medium min-w-[250px]">AI Summary</TableHead>
                <TableHead className="text-xs font-medium text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => (
                <TableRow 
                  key={submission.id} 
                  className="hover:bg-muted/30 cursor-pointer"
                  onClick={() => handleViewSubmission(submission.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {submission.requiresHumanReview && (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {submission.insured.name.value}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {submission.insured.industry.value}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-foreground">{submission.producer.name}</p>
                      <p className="text-xs text-muted-foreground">{submission.producer.agency}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    {format(new Date(submission.createdAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      Cyber Liability
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {submission.quote?.effectiveDate 
                      ? `${format(new Date(submission.quote.effectiveDate), 'MM/dd/yy')} - ${format(new Date(submission.quote.expirationDate), 'MM/dd/yy')}`
                      : 'TBD'
                    }
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${stageColors[submission.stage]}`}>
                      {stageLabels[submission.stage]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {submission.assignedUnderwriter ? (
                      <div>
                        <p className="text-foreground">{submission.assignedUnderwriter.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {submission.assignedUnderwriter.tier}
                        </p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {generateAISummary(submission)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="h-8 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewSubmission(submission.id);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleViewSubmission(submission.id);
                          }}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Submission
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredSubmissions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {submissions.length === 0 ? 'No submissions found' : 'No submissions match your filters'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
