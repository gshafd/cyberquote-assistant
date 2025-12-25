import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/context/AppContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, AlertTriangle, CheckCircle2, Edit, MoreHorizontal } from 'lucide-react';
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
  risk_assessment: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  pricing: 'bg-primary/10 text-primary border-primary/20',
  quotation: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  binding: 'bg-green-500/10 text-green-500 border-green-500/20',
};

const stageLabels: Record<SubmissionStage, string> = {
  submission: 'Submission',
  data_collection: 'Data Collection',
  risk_assessment: 'Risk Assessment',
  pricing: 'Pricing & Rating',
  quotation: 'Quotation',
  binding: 'Binding & Issuing',
};

export function SubmissionsList() {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const { submissions } = state;

  const handleViewSubmission = (submissionId: string) => {
    dispatch({ type: 'SELECT_SUBMISSION', payload: submissionId });
    navigate('/workbench');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          All Submissions
          <Badge variant="secondary" className="text-xs">
            {submissions.length} total
          </Badge>
        </CardTitle>
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
                <TableHead className="text-xs font-medium">Intake User</TableHead>
                <TableHead className="text-xs font-medium">Confidence</TableHead>
                <TableHead className="text-xs font-medium text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
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
                  <TableCell className="text-sm">
                    {submission.stage === 'submission' || submission.stage === 'data_collection' ? (
                      <span className="text-foreground">System</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {submission.confidence >= 75 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : submission.confidence >= 50 ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                      )}
                      <span className={`text-sm font-medium ${
                        submission.confidence >= 75 
                          ? 'text-emerald-500' 
                          : submission.confidence >= 50 
                            ? 'text-amber-500' 
                            : 'text-destructive'
                      }`}>
                        {submission.confidence}%
                      </span>
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
              {submissions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No submissions found
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
