import {
  BrokerEmail,
  Producer,
  Insured,
  CyberControls,
  RiskProfile,
  Underwriter,
  Submission,
  KnowledgeBase,
  WorkbenchMetrics,
  AIField,
  ThreatSignal,
  CoverageRecommendation,
  PricingDetails,
  Quote,
} from '@/types/underwriting';

// Helper to create AI fields
function createAIField<T>(
  value: T,
  confidence: number,
  rationale: string,
  sourceFile: string,
  snippet: string
): AIField<T> {
  return {
    value,
    confidence,
    rationale,
    citations: [{ sourceFile, snippet }],
    isEdited: false,
  };
}

// Broker Emails
export const brokerEmails: BrokerEmail[] = [
  {
    id: 'email-001',
    from: 'sarah.thompson@brokerworks.com',
    to: 'submissions@cyberuw.com',
    subject: 'New Cyber Submission - ACME Medical Solutions',
    body: `Hi UW Team,

Please find attached a new cyber liability submission for ACME Medical Solutions. They are a healthcare technology company providing patient management software to mid-sized hospitals.

Key details:
- Annual Revenue: $45M
- Employees: 280
- Requesting $5M limit with $50K retention
- Current policy expires 02/15/2025

They have SOC2 Type II (expires March 2025) but I'm still waiting for confirmation on their EDR solution. Their IT team mentioned they're "in the process" of implementing one.

Please expedite if possible - the client is eager to get coverage in place.

Best regards,
Sarah Thompson
Senior Broker | BrokerWorks Insurance
sarah.thompson@brokerworks.com
(555) 234-5678`,
    receivedAt: '2024-12-22T09:15:00Z',
    attachments: [
      { id: 'att-001', filename: 'ACORD_Application_ACME.json', type: 'acord', size: '45 KB' },
      { id: 'att-002', filename: 'Controls_Questionnaire_ACME.json', type: 'questionnaire', size: '28 KB' },
      { id: 'att-003', filename: 'SOC2_Report_ACME.pdf', type: 'soc2', size: '2.3 MB' },
    ],
    isRead: false,
    isIngested: false,
  },
  {
    id: 'email-002',
    from: 'mike.chen@premierbrokerage.com',
    to: 'submissions@cyberuw.com',
    subject: 'Zenith Solutions - Cyber Renewal with Increase',
    body: `Hello,

Attaching renewal submission for Zenith Solutions, a fintech company. They're current clients looking to increase limits from $3M to $10M.

Highlights:
- Revenue grown to $120M (up from $85M)
- 450 employees
- Excellent controls: MFA everywhere, 24/7 SOC, EDR deployed
- SOC2 Type II current through September 2025
- Zero claims history with us

This should be a straightforward renewal. Let me know if you need anything else.

Thanks,
Mike Chen
Vice President | Premier Brokerage
mike.chen@premierbrokerage.com`,
    receivedAt: '2024-12-22T10:30:00Z',
    attachments: [
      { id: 'att-004', filename: 'ACORD_Application_Zenith.json', type: 'acord', size: '52 KB' },
      { id: 'att-005', filename: 'Security_Controls_Zenith.json', type: 'questionnaire', size: '35 KB' },
      { id: 'att-006', filename: 'SOC2_TypeII_Zenith.pdf', type: 'soc2', size: '3.1 MB' },
      { id: 'att-007', filename: 'EDR_Deployment_Report.pdf', type: 'edr_report', size: '890 KB' },
    ],
    isRead: false,
    isIngested: false,
  },
  {
    id: 'email-003',
    from: 'jennifer.walsh@globalriskmgmt.com',
    to: 'submissions@cyberuw.com',
    subject: 'Complex Submission - EdgeCase Vendor Management',
    body: `Team,

I have a complex new business submission that may require specialist review. EdgeCase Vendor Management provides third-party vendor risk assessment services to Fortune 500 companies.

Complexity factors:
- They handle sensitive data from 200+ enterprise clients
- Revenue: $75M
- Employees: 180
- Prior claims history (1 incident in 2022, settled for $450K)
- Requesting $15M tower with $100K SIR
- Some cloud infrastructure concerns noted in their assessment

Given the nature of their business and exposure, this will likely need senior UW review. Happy to schedule a call to discuss.

Jennifer Walsh
Managing Director | Global Risk Management
jennifer.walsh@globalriskmgmt.com
(555) 789-0123`,
    receivedAt: '2024-12-22T14:45:00Z',
    attachments: [
      { id: 'att-008', filename: 'ACORD_EdgeCase.json', type: 'acord', size: '48 KB' },
      { id: 'att-009', filename: 'Controls_Assessment_EdgeCase.json', type: 'questionnaire', size: '42 KB' },
      { id: 'att-010', filename: 'Prior_Claims_Summary.pdf', type: 'other', size: '156 KB' },
    ],
    isRead: false,
    isIngested: false,
  },
];

// Producers
export const producers: Producer[] = [
  {
    id: 'prod-001',
    name: 'Sarah Thompson',
    code: 'BRK-2847',
    agency: 'BrokerWorks Insurance',
    license: 'CA-LIC-892341',
    state: 'CA',
    email: 'sarah.thompson@brokerworks.com',
    phone: '(555) 234-5678',
    tier: 'preferred',
    activeContracts: 24,
  },
  {
    id: 'prod-002',
    name: 'Mike Chen',
    code: 'PRB-1923',
    agency: 'Premier Brokerage',
    license: 'NY-LIC-445872',
    state: 'NY',
    email: 'mike.chen@premierbrokerage.com',
    phone: '(555) 456-7890',
    tier: 'preferred',
    activeContracts: 38,
  },
  {
    id: 'prod-003',
    name: 'Jennifer Walsh',
    code: 'GRM-3156',
    agency: 'Global Risk Management',
    license: 'TX-LIC-667234',
    state: 'TX',
    email: 'jennifer.walsh@globalriskmgmt.com',
    phone: '(555) 789-0123',
    tier: 'standard',
    activeContracts: 15,
  },
];

// Underwriters
export const underwriters: Underwriter[] = [
  {
    id: 'uw-001',
    name: 'David Martinez',
    email: 'david.martinez@cyberuw.com',
    specialty: ['healthcare', 'technology', 'fintech'],
    workload: 12,
    maxWorkload: 20,
    tier: 'senior',
    avgTurnaround: 2.3,
    bindRatio: 0.72,
  },
  {
    id: 'uw-002',
    name: 'Lisa Park',
    email: 'lisa.park@cyberuw.com',
    specialty: ['fintech', 'e-commerce', 'retail'],
    workload: 15,
    maxWorkload: 20,
    tier: 'senior',
    avgTurnaround: 1.8,
    bindRatio: 0.68,
  },
  {
    id: 'uw-003',
    name: 'James Wilson',
    email: 'james.wilson@cyberuw.com',
    specialty: ['manufacturing', 'technology', 'professional-services'],
    workload: 8,
    maxWorkload: 15,
    tier: 'standard',
    avgTurnaround: 3.1,
    bindRatio: 0.61,
  },
  {
    id: 'uw-004',
    name: 'Amanda Foster',
    email: 'amanda.foster@cyberuw.com',
    specialty: ['healthcare', 'vendor-risk', 'critical-infrastructure'],
    workload: 6,
    maxWorkload: 12,
    tier: 'senior',
    avgTurnaround: 2.8,
    bindRatio: 0.75,
  },
];

// Scenario A: ACME Medical - Low confidence, requires human review
export const acmeInsured: Insured = {
  name: createAIField('ACME Medical Solutions, Inc.', 98, 'Extracted from ACORD application header', 'ACORD_Application_ACME.json', '"applicantName": "ACME Medical Solutions, Inc."'),
  dba: createAIField('ACME MedTech', 85, 'Found in business details section', 'ACORD_Application_ACME.json', '"dba": "ACME MedTech"'),
  address: createAIField('2500 Innovation Drive, Suite 400', 96, 'Primary business address from ACORD', 'ACORD_Application_ACME.json', '"address1": "2500 Innovation Drive, Suite 400"'),
  city: createAIField('San Jose', 98, 'City from business address', 'ACORD_Application_ACME.json', '"city": "San Jose"'),
  state: createAIField('CA', 98, 'State from business address', 'ACORD_Application_ACME.json', '"state": "CA"'),
  zip: createAIField('95134', 98, 'ZIP from business address', 'ACORD_Application_ACME.json', '"zip": "95134"'),
  website: createAIField('www.acmemedical.com', 92, 'Website extracted from application', 'ACORD_Application_ACME.json', '"website": "www.acmemedical.com"'),
  industry: createAIField('Healthcare Technology', 94, 'Industry classification based on business description', 'ACORD_Application_ACME.json', '"businessDescription": "Patient management software for hospitals"'),
  sicCode: createAIField('7371', 91, 'SIC code for computer programming services', 'SIC_Mapping.csv', 'Healthcare IT -> 7371'),
  naicsCode: createAIField('541512', 93, 'NAICS for computer systems design', 'ACORD_Application_ACME.json', '"naicsCode": "541512"'),
  employeeCount: createAIField(280, 95, 'Employee count from application', 'ACORD_Application_ACME.json', '"employeeCount": 280'),
  annualRevenue: createAIField(45000000, 96, 'Annual revenue from financials section', 'ACORD_Application_ACME.json', '"annualRevenue": 45000000'),
  yearEstablished: createAIField(2015, 88, 'Year established from company info', 'ACORD_Application_ACME.json', '"yearEstablished": 2015'),
};

export const acmeControls: CyberControls = {
  hasMFA: createAIField(true, 92, 'MFA confirmed for all remote access', 'Controls_Questionnaire_ACME.json', '"mfaEnabled": true, "mfaCoverage": "all-remote"'),
  hasEDR: createAIField(false, 45, 'EDR status unclear - broker mentioned "in process" of implementation', 'Controls_Questionnaire_ACME.json', '"edrDeployed": "pending"'),
  hasBackups: createAIField(true, 88, 'Daily backups confirmed', 'Controls_Questionnaire_ACME.json', '"backupPolicy": "daily"'),
  backupFrequency: createAIField('Daily', 88, 'Backup frequency from questionnaire', 'Controls_Questionnaire_ACME.json', '"backupFrequency": "daily"'),
  hasSOC2: createAIField(true, 95, 'SOC2 Type II report attached, valid through March 2025', 'SOC2_Report_ACME.pdf', 'Report Period: April 2024 - March 2025'),
  soc2ExpiryDate: createAIField('2025-03-31', 95, 'SOC2 expiration from report', 'SOC2_Report_ACME.pdf', 'Valid Through: March 31, 2025'),
  hasIncidentResponsePlan: createAIField(true, 82, 'IR plan mentioned but not attached', 'Controls_Questionnaire_ACME.json', '"incidentResponsePlan": true'),
  hasSecurityTraining: createAIField(true, 78, 'Annual security training indicated', 'Controls_Questionnaire_ACME.json', '"securityTraining": "annual"'),
  trainingFrequency: createAIField('Annual', 78, 'Training frequency from questionnaire', 'Controls_Questionnaire_ACME.json', '"trainingFrequency": "annual"'),
  hasEncryption: createAIField(true, 90, 'Encryption at rest and in transit confirmed', 'Controls_Questionnaire_ACME.json', '"encryptionAtRest": true, "encryptionInTransit": true'),
  patchManagement: createAIField('Monthly', 75, 'Patch management cycle from questionnaire', 'Controls_Questionnaire_ACME.json', '"patchCycle": "monthly"'),
  vendorRiskManagement: createAIField(true, 70, 'Vendor risk program exists but maturity unclear', 'Controls_Questionnaire_ACME.json', '"vendorRiskProgram": true'),
  cloudProvider: createAIField('AWS', 94, 'Primary cloud provider from infrastructure section', 'Controls_Questionnaire_ACME.json', '"cloudProviders": ["AWS"]'),
  piiRecordCount: createAIField(2500000, 85, 'Approximate PII records for patient data', 'Controls_Questionnaire_ACME.json', '"piiRecords": 2500000'),
  phiRecordCount: createAIField(1800000, 85, 'PHI records from healthcare operations', 'Controls_Questionnaire_ACME.json', '"phiRecords": 1800000'),
  pciRecordCount: createAIField(0, 95, 'No payment processing', 'Controls_Questionnaire_ACME.json', '"pciScope": false'),
};

export const acmeThreatSignals: ThreatSignal[] = [
  {
    source: 'Shodan',
    severity: 'high',
    finding: 'Open RDP port detected',
    details: 'Port 3389 (RDP) found open on IP 203.0.113.45 associated with acmemedical.com',
    dateFound: '2024-12-20',
    isResolved: false,
  },
  {
    source: 'AWS S3 Scanner',
    severity: 'medium',
    finding: 'Potentially misconfigured S3 bucket',
    details: 'S3 bucket "acme-patient-data-backup" may have overly permissive ACLs',
    dateFound: '2024-12-19',
    isResolved: false,
  },
  {
    source: 'Dark Web Monitor',
    severity: 'low',
    finding: 'Domain mentioned in credential dump',
    details: '3 email addresses with @acmemedical.com found in recent credential dump',
    dateFound: '2024-12-15',
    isResolved: false,
  },
];

export const acmeRiskProfile: RiskProfile = {
  overallScore: createAIField(68, 72, 'Moderate risk due to missing EDR and open threats', 'Risk_Model_v2.1.json', 'Rule: healthcare + no EDR + open ports = high risk modifier'),
  industryRisk: createAIField(75, 88, 'Healthcare industry has elevated cyber risk profile', 'UW_Guidelines.json', 'Healthcare sector risk rating: 75/100'),
  controlsScore: createAIField(62, 70, 'Controls score reduced due to unclear EDR status and monthly patching', 'Controls_Questionnaire_ACME.json', 'Aggregated controls assessment'),
  threatExposure: createAIField(72, 85, 'Active threat signals detected from external scans', 'Threat_Signals_ACME.json', 'Combined threat signal severity: HIGH'),
  historicalLoss: createAIField(0, 95, 'No prior cyber claims reported', 'ACORD_Application_ACME.json', '"priorClaims": []'),
  threatSignals: acmeThreatSignals,
  recommendations: [
    'Require confirmation of EDR deployment before binding',
    'Request remediation evidence for open RDP port',
    'Recommend S3 bucket configuration review',
    'Consider sublimit for ransomware until EDR confirmed',
  ],
};

// Scenario B: Zenith Solutions - High confidence, auto-progress
export const zenithInsured: Insured = {
  name: createAIField('Zenith Solutions, Inc.', 99, 'Extracted from ACORD application header', 'ACORD_Application_Zenith.json', '"applicantName": "Zenith Solutions, Inc."'),
  dba: createAIField('Zenith Fintech', 92, 'DBA from application', 'ACORD_Application_Zenith.json', '"dba": "Zenith Fintech"'),
  address: createAIField('100 Wall Street, Floor 35', 98, 'Primary business address', 'ACORD_Application_Zenith.json', '"address1": "100 Wall Street, Floor 35"'),
  city: createAIField('New York', 99, 'City from business address', 'ACORD_Application_Zenith.json', '"city": "New York"'),
  state: createAIField('NY', 99, 'State from business address', 'ACORD_Application_Zenith.json', '"state": "NY"'),
  zip: createAIField('10005', 99, 'ZIP from business address', 'ACORD_Application_Zenith.json', '"zip": "10005"'),
  website: createAIField('www.zenithfintech.com', 96, 'Website from application', 'ACORD_Application_Zenith.json', '"website": "www.zenithfintech.com"'),
  industry: createAIField('Financial Technology', 97, 'Industry from business description', 'ACORD_Application_Zenith.json', '"businessDescription": "Digital payment processing and banking APIs"'),
  sicCode: createAIField('6199', 94, 'SIC code for financial services', 'SIC_Mapping.csv', 'Fintech -> 6199'),
  naicsCode: createAIField('522320', 96, 'NAICS for financial transactions', 'ACORD_Application_Zenith.json', '"naicsCode": "522320"'),
  employeeCount: createAIField(450, 98, 'Employee count from application', 'ACORD_Application_Zenith.json', '"employeeCount": 450'),
  annualRevenue: createAIField(120000000, 97, 'Annual revenue from financials', 'ACORD_Application_Zenith.json', '"annualRevenue": 120000000'),
  yearEstablished: createAIField(2018, 95, 'Year established', 'ACORD_Application_Zenith.json', '"yearEstablished": 2018'),
};

export const zenithControls: CyberControls = {
  hasMFA: createAIField(true, 98, 'MFA deployed enterprise-wide with hardware tokens for admin access', 'Security_Controls_Zenith.json', '"mfaEnabled": true, "mfaCoverage": "all-users", "hardwareTokens": true'),
  hasEDR: createAIField(true, 99, 'CrowdStrike Falcon deployed on all endpoints', 'EDR_Deployment_Report.pdf', 'CrowdStrike Falcon - 100% endpoint coverage'),
  hasBackups: createAIField(true, 96, 'Hourly backups with geo-redundant storage', 'Security_Controls_Zenith.json', '"backupPolicy": "hourly", "geoRedundant": true'),
  backupFrequency: createAIField('Hourly', 96, 'Backup frequency confirmed', 'Security_Controls_Zenith.json', '"backupFrequency": "hourly"'),
  hasSOC2: createAIField(true, 99, 'SOC2 Type II current through September 2025', 'SOC2_TypeII_Zenith.pdf', 'Report Period: October 2024 - September 2025'),
  soc2ExpiryDate: createAIField('2025-09-30', 99, 'SOC2 expiration date', 'SOC2_TypeII_Zenith.pdf', 'Valid Through: September 30, 2025'),
  hasIncidentResponsePlan: createAIField(true, 95, 'Comprehensive IR plan with annual tabletop exercises', 'Security_Controls_Zenith.json', '"irPlan": true, "tabletopExercises": "annual"'),
  hasSecurityTraining: createAIField(true, 94, 'Quarterly security awareness training with phishing simulations', 'Security_Controls_Zenith.json', '"securityTraining": "quarterly", "phishingTests": true'),
  trainingFrequency: createAIField('Quarterly', 94, 'Training frequency', 'Security_Controls_Zenith.json', '"trainingFrequency": "quarterly"'),
  hasEncryption: createAIField(true, 97, 'AES-256 encryption at rest, TLS 1.3 in transit', 'Security_Controls_Zenith.json', '"encryptionStandard": "AES-256", "tlsVersion": "1.3"'),
  patchManagement: createAIField('Weekly', 92, 'Weekly patch cycles with 24hr critical patch SLA', 'Security_Controls_Zenith.json', '"patchCycle": "weekly", "criticalPatchSLA": "24hours"'),
  vendorRiskManagement: createAIField(true, 90, 'Mature vendor risk program with continuous monitoring', 'Security_Controls_Zenith.json', '"vendorRiskProgram": true, "continuousMonitoring": true'),
  cloudProvider: createAIField('Multi-cloud (AWS, GCP)', 95, 'Multi-cloud infrastructure', 'Security_Controls_Zenith.json', '"cloudProviders": ["AWS", "GCP"]'),
  piiRecordCount: createAIField(5000000, 92, 'PII records from customer base', 'Security_Controls_Zenith.json', '"piiRecords": 5000000'),
  phiRecordCount: createAIField(0, 98, 'No PHI processed', 'Security_Controls_Zenith.json', '"phiScope": false'),
  pciRecordCount: createAIField(8500000, 94, 'PCI records from payment processing', 'Security_Controls_Zenith.json', '"pciRecords": 8500000'),
};

export const zenithRiskProfile: RiskProfile = {
  overallScore: createAIField(28, 92, 'Low risk profile with excellent controls and no active threats', 'Risk_Model_v2.1.json', 'Rule: fintech + full controls + no threats = low risk'),
  industryRisk: createAIField(65, 90, 'Fintech industry has moderate-high inherent risk', 'UW_Guidelines.json', 'Fintech sector risk rating: 65/100'),
  controlsScore: createAIField(92, 95, 'Excellent controls maturity across all categories', 'Security_Controls_Zenith.json', 'Aggregated controls score: 92'),
  threatExposure: createAIField(15, 94, 'No active threat signals detected', 'Threat_Signals_Zenith.json', 'No findings from external scans'),
  historicalLoss: createAIField(0, 99, 'No prior cyber claims', 'ACORD_Application_Zenith.json', '"priorClaims": []'),
  threatSignals: [],
  recommendations: [
    'Eligible for preferred pricing tier',
    'Recommend 3-year policy with rate lock',
    'No sublimits required based on controls',
  ],
};

// Scenario C: EdgeCase Vendor - Complex, requires specialist
export const edgecaseInsured: Insured = {
  name: createAIField('EdgeCase Vendor Management, LLC', 96, 'Extracted from ACORD application', 'ACORD_EdgeCase.json', '"applicantName": "EdgeCase Vendor Management, LLC"'),
  dba: createAIField('EdgeCase VRM', 88, 'DBA from application', 'ACORD_EdgeCase.json', '"dba": "EdgeCase VRM"'),
  address: createAIField('8700 Commerce Park Drive', 95, 'Business address', 'ACORD_EdgeCase.json', '"address1": "8700 Commerce Park Drive"'),
  city: createAIField('Houston', 97, 'City from address', 'ACORD_EdgeCase.json', '"city": "Houston"'),
  state: createAIField('TX', 97, 'State from address', 'ACORD_EdgeCase.json', '"state": "TX"'),
  zip: createAIField('77036', 97, 'ZIP from address', 'ACORD_EdgeCase.json', '"zip": "77036"'),
  website: createAIField('www.edgecasevrm.com', 90, 'Website from application', 'ACORD_EdgeCase.json', '"website": "www.edgecasevrm.com"'),
  industry: createAIField('Vendor Risk Management Services', 92, 'Industry from business description', 'ACORD_EdgeCase.json', '"businessDescription": "Third-party vendor risk assessment for enterprises"'),
  sicCode: createAIField('7389', 88, 'SIC for business services', 'SIC_Mapping.csv', 'Risk consulting -> 7389'),
  naicsCode: createAIField('541611', 91, 'NAICS for management consulting', 'ACORD_EdgeCase.json', '"naicsCode": "541611"'),
  employeeCount: createAIField(180, 94, 'Employee count', 'ACORD_EdgeCase.json', '"employeeCount": 180'),
  annualRevenue: createAIField(75000000, 93, 'Annual revenue', 'ACORD_EdgeCase.json', '"annualRevenue": 75000000'),
  yearEstablished: createAIField(2016, 90, 'Year established', 'ACORD_EdgeCase.json', '"yearEstablished": 2016'),
};

export const edgecaseControls: CyberControls = {
  hasMFA: createAIField(true, 90, 'MFA enabled for all users', 'Controls_Assessment_EdgeCase.json', '"mfaEnabled": true'),
  hasEDR: createAIField(true, 85, 'SentinelOne deployed', 'Controls_Assessment_EdgeCase.json', '"edrSolution": "SentinelOne"'),
  hasBackups: createAIField(true, 88, 'Daily backups', 'Controls_Assessment_EdgeCase.json', '"backupPolicy": "daily"'),
  backupFrequency: createAIField('Daily', 88, 'Backup frequency', 'Controls_Assessment_EdgeCase.json', '"backupFrequency": "daily"'),
  hasSOC2: createAIField(true, 92, 'SOC2 Type II current', 'Controls_Assessment_EdgeCase.json', '"soc2": true'),
  soc2ExpiryDate: createAIField('2025-06-30', 92, 'SOC2 expiration', 'Controls_Assessment_EdgeCase.json', '"soc2Expiry": "2025-06-30"'),
  hasIncidentResponsePlan: createAIField(true, 80, 'IR plan exists', 'Controls_Assessment_EdgeCase.json', '"irPlan": true'),
  hasSecurityTraining: createAIField(true, 82, 'Annual training', 'Controls_Assessment_EdgeCase.json', '"securityTraining": "annual"'),
  trainingFrequency: createAIField('Annual', 82, 'Training frequency', 'Controls_Assessment_EdgeCase.json', '"trainingFrequency": "annual"'),
  hasEncryption: createAIField(true, 88, 'Encryption enabled', 'Controls_Assessment_EdgeCase.json', '"encryptionAtRest": true'),
  patchManagement: createAIField('Bi-weekly', 78, 'Patch cycle', 'Controls_Assessment_EdgeCase.json', '"patchCycle": "bi-weekly"'),
  vendorRiskManagement: createAIField(true, 95, 'Core business function', 'Controls_Assessment_EdgeCase.json', '"vendorRiskProgram": "core-service"'),
  cloudProvider: createAIField('Azure', 92, 'Cloud provider', 'Controls_Assessment_EdgeCase.json', '"cloudProviders": ["Azure"]'),
  piiRecordCount: createAIField(15000000, 85, 'PII from client data', 'Controls_Assessment_EdgeCase.json', '"piiRecords": 15000000'),
  phiRecordCount: createAIField(3000000, 82, 'PHI from healthcare clients', 'Controls_Assessment_EdgeCase.json', '"phiRecords": 3000000'),
  pciRecordCount: createAIField(500000, 80, 'PCI from financial clients', 'Controls_Assessment_EdgeCase.json', '"pciRecords": 500000'),
};

export const edgecaseThreatSignals: ThreatSignal[] = [
  {
    source: 'Internal Assessment',
    severity: 'medium',
    finding: 'Privileged access review overdue',
    details: 'Quarterly privileged access review not completed for 2 quarters',
    dateFound: '2024-12-18',
    isResolved: false,
  },
];

export const edgecaseRiskProfile: RiskProfile = {
  overallScore: createAIField(55, 78, 'Moderate-high risk due to aggregation exposure and prior claims', 'Risk_Model_v2.1.json', 'Rule: vendor aggregator + prior claims = elevated risk'),
  industryRisk: createAIField(70, 85, 'Vendor risk services have elevated exposure', 'UW_Guidelines.json', 'Vendor risk sector: 70/100'),
  controlsScore: createAIField(78, 82, 'Good controls with some gaps', 'Controls_Assessment_EdgeCase.json', 'Aggregated controls: 78'),
  threatExposure: createAIField(45, 80, 'Minor threat signals', 'Threat_Signals_EdgeCase.json', 'Low-medium threat level'),
  historicalLoss: createAIField(450000, 95, 'Prior claim in 2022 for $450K', 'Prior_Claims_Summary.pdf', 'Settled claim: $450,000'),
  threatSignals: edgecaseThreatSignals,
  recommendations: [
    'Refer to specialty cyber team for review',
    'Consider aggregation exclusion clause',
    'Require enhanced business interruption sublimit',
    'Manual pricing review required',
  ],
};

// Coverage recommendations
export const acmeCoverages: CoverageRecommendation[] = [
  {
    coverageType: 'Network Security & Privacy Liability',
    recommendedLimit: 5000000,
    recommendedDeductible: 50000,
    sublimits: { ransomware: 2500000 },
    exclusions: ['Unencrypted portable devices'],
    conditions: ['EDR deployment required within 60 days'],
    confidence: 72,
    rationale: 'Standard limit for mid-market healthcare tech; ransomware sublimit due to unclear EDR status',
  },
  {
    coverageType: 'Business Interruption',
    recommendedLimit: 3000000,
    recommendedDeductible: 50000,
    sublimits: { waitingPeriod: 8 },
    confidence: 80,
    rationale: 'Standard BI coverage with 8-hour waiting period',
  },
  {
    coverageType: 'Regulatory Defense & Penalties',
    recommendedLimit: 2000000,
    recommendedDeductible: 25000,
    conditions: ['HIPAA compliance required'],
    confidence: 88,
    rationale: 'Healthcare exposure requires regulatory coverage',
  },
];

export const zenithCoverages: CoverageRecommendation[] = [
  {
    coverageType: 'Network Security & Privacy Liability',
    recommendedLimit: 10000000,
    recommendedDeductible: 100000,
    confidence: 95,
    rationale: 'Full limit approved based on excellent controls and claims history',
  },
  {
    coverageType: 'Business Interruption',
    recommendedLimit: 7500000,
    recommendedDeductible: 100000,
    sublimits: { waitingPeriod: 6 },
    confidence: 94,
    rationale: 'Enhanced BI for fintech operations with reduced waiting period',
  },
  {
    coverageType: 'Regulatory Defense & Penalties',
    recommendedLimit: 5000000,
    recommendedDeductible: 50000,
    confidence: 92,
    rationale: 'PCI and financial regulatory exposure',
  },
  {
    coverageType: 'Social Engineering',
    recommendedLimit: 1000000,
    recommendedDeductible: 25000,
    confidence: 90,
    rationale: 'Standard sublimit for payment processing exposure',
  },
];

// Pricing details
export const acmePricing: PricingDetails = {
  basePremium: createAIField(42000, 85, 'Base premium from rate model for healthcare tech', 'Rate_Model_v3.json', 'Healthcare IT base rate: $0.93 per $1000 revenue'),
  riskLoadings: [
    { reason: 'EDR not confirmed', amount: 8400, percentage: 20 },
    { reason: 'Open threat signals', amount: 6300, percentage: 15 },
    { reason: 'PHI exposure > 1M records', amount: 4200, percentage: 10 },
  ],
  credits: [
    { reason: 'SOC2 Type II certified', amount: -4200, percentage: -10 },
    { reason: 'No prior claims', amount: -2100, percentage: -5 },
  ],
  finalPremium: createAIField(54600, 78, 'Final premium after loadings and credits', 'Rate_Model_v3.json', 'Net premium calculation'),
  minimumPremium: 35000,
  ratePerMillion: createAIField(10920, 82, 'Rate per million of coverage', 'Rate_Model_v3.json', '$10,920 per $1M limit'),
  taxesAndFees: 2730,
  totalCost: createAIField(57330, 78, 'Total including taxes and fees', 'Rate_Model_v3.json', 'Total cost calculation'),
};

export const zenithPricing: PricingDetails = {
  basePremium: createAIField(96000, 92, 'Base premium for fintech at $10M limit', 'Rate_Model_v3.json', 'Fintech base rate: $0.80 per $1000 revenue'),
  riskLoadings: [
    { reason: 'PCI exposure > 5M records', amount: 9600, percentage: 10 },
  ],
  credits: [
    { reason: 'Excellent controls score (92+)', amount: -19200, percentage: -20 },
    { reason: 'SOC2 Type II certified', amount: -9600, percentage: -10 },
    { reason: 'No prior claims', amount: -4800, percentage: -5 },
    { reason: 'Renewal discount', amount: -4800, percentage: -5 },
  ],
  finalPremium: createAIField(67200, 94, 'Final premium - preferred tier pricing', 'Rate_Model_v3.json', 'Preferred tier calculation'),
  minimumPremium: 50000,
  ratePerMillion: createAIField(6720, 93, 'Excellent rate per million', 'Rate_Model_v3.json', '$6,720 per $1M limit'),
  taxesAndFees: 3360,
  totalCost: createAIField(70560, 94, 'Total including taxes and fees', 'Rate_Model_v3.json', 'Total cost calculation'),
};

// Quotes
export const acmeQuote: Quote = {
  quoteNumber: 'CYB-2024-ACME-001',
  effectiveDate: '2025-02-15',
  expirationDate: '2026-02-15',
  coverages: acmeCoverages,
  pricing: acmePricing,
  terms: [
    'Policy period: 12 months',
    'Claims-made coverage form',
    'Retroactive date: First bound date',
  ],
  conditions: [
    'EDR deployment confirmation required within 60 days of binding',
    'Remediation of open RDP port required within 30 days',
    'S3 bucket configuration review required',
  ],
  exclusions: [
    'Acts of war or terrorism',
    'Prior known circumstances',
    'Intentional acts',
    'Unencrypted portable device loss (unless EDR confirmed)',
  ],
  status: 'pending_review',
};

export const zenithQuote: Quote = {
  quoteNumber: 'CYB-2024-ZEN-001',
  effectiveDate: '2025-01-15',
  expirationDate: '2026-01-15',
  coverages: zenithCoverages,
  pricing: zenithPricing,
  terms: [
    'Policy period: 12 months',
    'Claims-made coverage form',
    'Extended reporting period: 60 days',
  ],
  conditions: [
    'Continued SOC2 Type II certification required',
    'Annual controls questionnaire update',
  ],
  exclusions: [
    'Acts of war or terrorism',
    'Prior known circumstances',
    'Intentional acts',
  ],
  status: 'approved',
};

// Knowledge Bases
export const knowledgeBases: KnowledgeBase[] = [
  {
    id: 'kb-001',
    name: 'UW Guidelines',
    type: 'guidelines',
    version: '2.3.1',
    lastUpdated: '2024-12-01',
    recordCount: 245,
    filePath: '/data/UW_Guidelines.json',
  },
  {
    id: 'kb-002',
    name: 'Rate Models',
    type: 'rates',
    version: '3.0.0',
    lastUpdated: '2024-11-15',
    recordCount: 89,
    filePath: '/data/Rate_Model_v3.json',
  },
  {
    id: 'kb-003',
    name: 'Rules Engine',
    type: 'rules',
    version: '1.8.2',
    lastUpdated: '2024-12-10',
    recordCount: 156,
    filePath: '/data/Rules_Engine.json',
  },
  {
    id: 'kb-004',
    name: 'Product Catalog',
    type: 'products',
    version: '4.1.0',
    lastUpdated: '2024-10-01',
    recordCount: 12,
    filePath: '/data/Product_Catalog.json',
  },
  {
    id: 'kb-005',
    name: 'Producer Directory',
    type: 'producers',
    version: '1.0.0',
    lastUpdated: '2024-12-20',
    recordCount: 1247,
    filePath: '/data/Producer_Lookup.csv',
  },
  {
    id: 'kb-006',
    name: 'Entity Database',
    type: 'entities',
    version: '1.0.0',
    lastUpdated: '2024-12-22',
    recordCount: 45892,
    filePath: '/data/Entity_Lookup.csv',
  },
];

// Metrics
export const workbenchMetrics: WorkbenchMetrics = {
  dailyRuns: 47,
  monthlyRuns: 892,
  tokenUsage: 2456000,
  submissionsByStage: {
    inbox: 3,
    intake: 8,
    assignment: 5,
    underwriting: 12,
    quoted: 6,
    bound: 4,
    declined: 2,
  },
  avgConfidenceByStage: {
    inbox: 0,
    intake: 78,
    assignment: 85,
    underwriting: 82,
    quoted: 88,
    bound: 92,
    declined: 45,
  },
  commonOverrideReasons: [
    { reason: 'EDR status correction', count: 23 },
    { reason: 'Revenue adjustment', count: 18 },
    { reason: 'Employee count update', count: 15 },
    { reason: 'Industry classification change', count: 12 },
    { reason: 'Controls questionnaire update', count: 11 },
  ],
  avgTimeInStage: {
    inbox: 0.5,
    intake: 2.3,
    assignment: 0.8,
    underwriting: 4.2,
    quoted: 1.5,
    bound: 0.3,
    declined: 0.2,
  },
  bindRatio: 0.68,
  declineRatio: 0.12,
};

// Initial submissions based on scenarios
export const initialSubmissions: Submission[] = [];
