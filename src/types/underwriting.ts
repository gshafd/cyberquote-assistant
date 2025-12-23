// Core Types for UW Workbench

export type TeamRole = 'intake' | 'assignment' | 'underwriting' | 'ops';

export type SubmissionStage = 
  | 'inbox' 
  | 'intake' 
  | 'assignment' 
  | 'underwriting' 
  | 'quoted' 
  | 'bound' 
  | 'declined';

export type IntakeSubstage = 
  | 'document_parsing' 
  | 'producer_verification' 
  | 'initial_validation' 
  | 'intake_complete';

export type AssignmentSubstage = 
  | 'workload_balance' 
  | 'specialist_match' 
  | 'assignment_complete';

export type UnderwritingSubstage = 
  | 'risk_profiling' 
  | 'rules_check' 
  | 'coverage_determination' 
  | 'pricing' 
  | 'quote_draft' 
  | 'quote_review' 
  | 'binding';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface Citation {
  sourceFile: string;
  lineNumber?: number;
  snippet: string;
  guidelineId?: string;
  ruleId?: string;
}

export interface AIField<T = string> {
  value: T;
  confidence: number;
  rationale: string;
  citations: Citation[];
  isEdited: boolean;
  originalValue?: T;
  editedBy?: string;
  editedAt?: string;
  feedbackComment?: string;
}

export interface BrokerEmail {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  receivedAt: string;
  attachments: EmailAttachment[];
  isRead: boolean;
  isIngested: boolean;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  type: 'acord' | 'questionnaire' | 'financials' | 'soc2' | 'edr_report' | 'other';
  size: string;
  content?: Record<string, unknown>;
}

export interface Producer {
  id: string;
  name: string;
  code: string;
  agency: string;
  license: string;
  state: string;
  email: string;
  phone: string;
  tier: 'preferred' | 'standard' | 'new';
  activeContracts: number;
}

export interface Insured {
  name: AIField<string>;
  dba: AIField<string>;
  address: AIField<string>;
  city: AIField<string>;
  state: AIField<string>;
  zip: AIField<string>;
  website: AIField<string>;
  industry: AIField<string>;
  sicCode: AIField<string>;
  naicsCode: AIField<string>;
  employeeCount: AIField<number>;
  annualRevenue: AIField<number>;
  yearEstablished: AIField<number>;
}

export interface CyberControls {
  hasMFA: AIField<boolean>;
  hasEDR: AIField<boolean>;
  hasBackups: AIField<boolean>;
  backupFrequency: AIField<string>;
  hasSOC2: AIField<boolean>;
  soc2ExpiryDate: AIField<string>;
  hasIncidentResponsePlan: AIField<boolean>;
  hasSecurityTraining: AIField<boolean>;
  trainingFrequency: AIField<string>;
  hasEncryption: AIField<boolean>;
  patchManagement: AIField<string>;
  vendorRiskManagement: AIField<boolean>;
  cloudProvider: AIField<string>;
  piiRecordCount: AIField<number>;
  phiRecordCount: AIField<number>;
  pciRecordCount: AIField<number>;
}

export interface ThreatSignal {
  source: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  finding: string;
  details: string;
  dateFound: string;
  isResolved: boolean;
}

export interface RiskProfile {
  overallScore: AIField<number>;
  industryRisk: AIField<number>;
  controlsScore: AIField<number>;
  threatExposure: AIField<number>;
  historicalLoss: AIField<number>;
  threatSignals: ThreatSignal[];
  recommendations: string[];
}

export interface CoverageRecommendation {
  coverageType: string;
  recommendedLimit: number;
  recommendedDeductible: number;
  sublimits?: Record<string, number>;
  exclusions?: string[];
  conditions?: string[];
  confidence: number;
  rationale: string;
}

export interface PricingDetails {
  basePremium: AIField<number>;
  riskLoadings: { reason: string; amount: number; percentage: number }[];
  credits: { reason: string; amount: number; percentage: number }[];
  finalPremium: AIField<number>;
  minimumPremium: number;
  ratePerMillion: AIField<number>;
  taxesAndFees: number;
  totalCost: AIField<number>;
}

export interface Quote {
  quoteNumber: string;
  effectiveDate: string;
  expirationDate: string;
  coverages: CoverageRecommendation[];
  pricing: PricingDetails;
  terms: string[];
  conditions: string[];
  exclusions: string[];
  status: 'draft' | 'pending_review' | 'approved' | 'declined' | 'bound';
}

export interface Underwriter {
  id: string;
  name: string;
  email: string;
  specialty: string[];
  workload: number;
  maxWorkload: number;
  tier: 'senior' | 'standard' | 'junior';
  avgTurnaround: number;
  bindRatio: number;
}

export interface FeedbackEntry {
  id: string;
  submissionId: string;
  fieldPath: string;
  fieldLabel: string;
  originalValue: string | number | boolean;
  newValue: string | number | boolean;
  editedBy: string;
  editedAt: string;
  feedbackComment: string;
  stage?: SubmissionStage;
  substage?: string;
  downstreamImpact?: string[];
  aiConfidence?: number;
  // Legacy support
  user?: string;
  role?: TeamRole;
  comment?: string;
  timestamp?: string;
}

export interface Submission {
  id: string;
  scenarioId: string;
  stage: SubmissionStage;
  substage: IntakeSubstage | AssignmentSubstage | UnderwritingSubstage;
  sourceEmail: BrokerEmail;
  producer: Producer;
  insured: Insured;
  controls: CyberControls;
  riskProfile?: RiskProfile;
  coverages?: CoverageRecommendation[];
  quote?: Quote;
  assignedUnderwriter?: Underwriter;
  createdAt: string;
  updatedAt: string;
  history: SubmissionEvent[];
  feedbackLog: FeedbackEntry[];
  confidence: number;
  requiresHumanReview: boolean;
  reviewReason?: string;
}

export interface SubmissionEvent {
  id: string;
  timestamp: string;
  type: 'stage_change' | 'substage_change' | 'field_edit' | 'document_upload' | 'comment' | 'assignment' | 'approval' | 'decline';
  actor: string;
  actorRole: TeamRole;
  description: string;
  details?: Record<string, unknown>;
}

export interface WorkbenchMetrics {
  dailyRuns: number;
  monthlyRuns: number;
  tokenUsage: number;
  submissionsByStage: Record<SubmissionStage, number>;
  avgConfidenceByStage: Record<SubmissionStage, number>;
  commonOverrideReasons: { reason: string; count: number }[];
  avgTimeInStage: Record<SubmissionStage, number>;
  bindRatio: number;
  declineRatio: number;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  type: 'guidelines' | 'rates' | 'rules' | 'products' | 'producers' | 'entities';
  version: string;
  lastUpdated: string;
  recordCount: number;
  filePath: string;
}

export interface AppState {
  currentRole: TeamRole;
  submissions: Submission[];
  selectedSubmissionId: string | null;
  feedbackLog: FeedbackEntry[];
  metrics: WorkbenchMetrics;
  knowledgeBases: KnowledgeBase[];
  underwriters: Underwriter[];
}
