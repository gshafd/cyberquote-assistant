import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  TeamRole,
  Submission,
  FeedbackEntry,
  WorkbenchMetrics,
  KnowledgeBase,
  Underwriter,
  BrokerEmail,
  SubmissionStage,
} from '@/types/underwriting';
import {
  brokerEmails,
  underwriters,
  knowledgeBases,
  workbenchMetrics,
  initialSubmissions,
  initialFeedbackLog,
} from '@/data/mockData';

interface AppState {
  currentRole: TeamRole;
  emails: BrokerEmail[];
  submissions: Submission[];
  selectedSubmissionId: string | null;
  feedbackLog: FeedbackEntry[];
  metrics: WorkbenchMetrics;
  knowledgeBases: KnowledgeBase[];
  underwriters: Underwriter[];
}

type Action =
  | { type: 'SET_ROLE'; payload: TeamRole }
  | { type: 'SELECT_SUBMISSION'; payload: string | null }
  | { type: 'ADD_SUBMISSION'; payload: Submission }
  | { type: 'UPDATE_SUBMISSION'; payload: Submission }
  | { type: 'UPDATE_EMAIL'; payload: BrokerEmail }
  | { type: 'ADD_FEEDBACK'; payload: FeedbackEntry }
  | { type: 'UPDATE_METRICS'; payload: Partial<WorkbenchMetrics> }
  | { type: 'ADVANCE_STAGE'; payload: { submissionId: string; newStage: SubmissionStage; substage: string } };

// Safe initial state with fallback values
const getInitialState = (): AppState => {
  try {
    return {
      currentRole: 'intake',
      emails: brokerEmails || [],
      submissions: initialSubmissions || [],
      selectedSubmissionId: null,
      feedbackLog: initialFeedbackLog || [],
      metrics: workbenchMetrics,
      knowledgeBases: knowledgeBases || [],
      underwriters: underwriters || [],
    };
  } catch (error) {
    console.error('Error initializing app state:', error);
    return {
      currentRole: 'intake',
      emails: [],
      submissions: [],
      selectedSubmissionId: null,
      feedbackLog: [],
      metrics: {
        dailyRuns: 0,
        monthlyRuns: 0,
        tokenUsage: 0,
        submissionsByStage: {
          submission: 0,
          data_collection: 0,
          assignment: 0,
          risk_assessment: 0,
          pricing: 0,
          quotation: 0,
          binding: 0,
        },
        avgConfidenceByStage: {
          submission: 0,
          data_collection: 0,
          assignment: 0,
          risk_assessment: 0,
          pricing: 0,
          quotation: 0,
          binding: 0,
        },
        commonOverrideReasons: [],
        avgTimeInStage: {
          submission: 0,
          data_collection: 0,
          assignment: 0,
          risk_assessment: 0,
          pricing: 0,
          quotation: 0,
          binding: 0,
        },
        bindRatio: 0,
        declineRatio: 0,
      },
      knowledgeBases: [],
      underwriters: [],
    };
  }
};

const initialState: AppState = getInitialState();

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, currentRole: action.payload };

    case 'SELECT_SUBMISSION':
      return { ...state, selectedSubmissionId: action.payload };

    case 'ADD_SUBMISSION':
      return {
        ...state,
        submissions: [...state.submissions, action.payload],
        metrics: {
          ...state.metrics,
          submissionsByStage: {
            ...state.metrics.submissionsByStage,
            [action.payload.stage]: (state.metrics.submissionsByStage[action.payload.stage] || 0) + 1,
          },
        },
      };

    case 'UPDATE_SUBMISSION':
      return {
        ...state,
        submissions: state.submissions.map((s) =>
          s.id === action.payload.id ? action.payload : s
        ),
      };

    case 'UPDATE_EMAIL':
      return {
        ...state,
        emails: state.emails.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      };

    case 'ADD_FEEDBACK':
      return {
        ...state,
        feedbackLog: [...state.feedbackLog, action.payload],
      };

    case 'UPDATE_METRICS':
      return {
        ...state,
        metrics: { ...state.metrics, ...action.payload },
      };

    case 'ADVANCE_STAGE': {
      const submission = state.submissions.find((s) => s.id === action.payload.submissionId);
      if (!submission) return state;

      const oldStage = submission.stage;
      const updatedSubmission: Submission = {
        ...submission,
        stage: action.payload.newStage,
        substage: action.payload.substage as any,
        updatedAt: new Date().toISOString(),
        history: [
          ...submission.history,
          {
            id: `event-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'stage_change',
            actor: 'System',
            actorRole: state.currentRole,
            description: `Stage changed from ${oldStage} to ${action.payload.newStage}`,
          },
        ],
      };

      return {
        ...state,
        submissions: state.submissions.map((s) =>
          s.id === action.payload.submissionId ? updatedSubmission : s
        ),
        metrics: {
          ...state.metrics,
          submissionsByStage: {
            ...state.metrics.submissionsByStage,
            [oldStage]: Math.max(0, (state.metrics.submissionsByStage[oldStage] || 1) - 1),
            [action.payload.newStage]: (state.metrics.submissionsByStage[action.payload.newStage] || 0) + 1,
          },
        },
      };
    }

    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}
