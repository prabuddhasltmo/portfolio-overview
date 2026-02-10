import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Snackbar, Alert } from '@mui/material';
import SelectPrintChecksModal from '../components/Dashboard/SelectPrintChecksModal';
import PrintChecksConfirmModal from '../components/Dashboard/PrintChecksConfirmModal';
import LenderNotificationModal from '../components/Dashboard/LenderNotificationModal';
import PrintChecksSuccessModal from '../components/Dashboard/PrintChecksSuccessModal';
import { continueAgentFlow, type AgentResponse } from '../services/openai';

type FlowStep = 'select' | 'confirm' | 'notification' | 'success' | null;

interface AgentCtx { threadId: string; runId: string; loanId: string }

interface AutoAdvanceOpts {
  autoAdvanceSelectChecks?: boolean;
  autoAdvanceConfirm?: boolean;
  autoAdvanceLenderNotify?: boolean;
}

type NotificationOptions = {
  transmissionType: string;
  fromDate: string;
  toDate: string;
  envelopeSize: string;
  replaceBorrowerName: boolean;
  displayLateCharges: boolean;
};

export interface AgentWorkflowContextValue {
  openFromAgentResponse: (r: AgentResponse, borrower?: string, opts?: AutoAdvanceOpts) => void;
  openPrintChecksModal: (loanId: string, borrower: string) => void;
  closeFlow: () => void;
  showSnackbar: (message: string, severity: 'success' | 'error') => void;
  handlePrintSelected: (count: number, total: number, ids?: string[]) => void;
  handleProceedToNotification: () => void;
  handleLenderNotificationSubmit: (options: NotificationOptions) => void;
  automatingLoanId: string | null;
  setAutomatingLoanId: (id: string | null) => void;
}

const AgentWorkflowContext = createContext<AgentWorkflowContextValue | null>(null);

export function useAgentWorkflow(): AgentWorkflowContextValue {
  const ctx = useContext(AgentWorkflowContext);
  if (!ctx) throw new Error('useAgentWorkflow must be used within AgentWorkflowProvider');
  return ctx;
}

const AUTO_ADVANCE_DELAY = 1400;

const DEFAULT_NOTIFICATION_OPTIONS: Record<string, unknown> = {
  transmissionType: 'transmission_date',
  fromDate: new Date().toISOString().split('T')[0],
  toDate: new Date().toISOString().split('T')[0],
  envelopeSize: 'standard',
  replaceBorrowerName: false,
  displayLateCharges: false,
};

export function AgentWorkflowProvider({ children }: { children: ReactNode }) {
  const [flowStep, setFlowStep] = useState<FlowStep>(null);
  const [loanCtx, setLoanCtx] = useState<{ loanId: string; borrower: string } | null>(null);
  const [confirmData, setConfirmData] = useState<{ selectedCount: number; totalAmount: number } | null>(null);
  const [agentCtx, setAgentCtx] = useState<AgentCtx | null>(null);
  const [agentChecks, setAgentChecks] = useState<Array<Record<string, unknown>> | undefined>(undefined);
  const [stepLoading, setStepLoading] = useState(false);
  const [automatingLoanId, setAutomatingLoanId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>(
    { open: false, message: '', severity: 'success' }
  );

  const advanceConfirmRef = useRef(false);
  const advanceLenderRef = useRef(false);
  const pendingRef = useRef(false);
  const runContinueRef = useRef<
    (action: 'selectChecks' | 'confirmPrint' | 'lenderNotify', payload: Record<string, unknown>, ctx: AgentCtx) => Promise<void>
  >();

  const closeFlow = useCallback(() => {
    setFlowStep(null);
    setLoanCtx(null);
    setConfirmData(null);
    setAgentCtx(null);
    setAgentChecks(undefined);
    setSuccessMsg(null);
    setStepLoading(false);
    advanceConfirmRef.current = false;
    advanceLenderRef.current = false;
    pendingRef.current = false;
  }, []);

  const showSnackbar = useCallback((message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const scheduleAdvance = useCallback(
    (action: 'selectChecks' | 'confirmPrint' | 'lenderNotify', payload: Record<string, unknown>, ctx: AgentCtx) => {
      pendingRef.current = true;
      setStepLoading(true);
      setTimeout(() => {
        pendingRef.current = false;
        void runContinueRef.current?.(action, payload, ctx);
      }, AUTO_ADVANCE_DELAY);
    },
    []
  );

  const extractCtx = (result: AgentResponse, fallbackLoanId: string): AgentCtx => ({
    threadId: result.threadId!,
    runId: result.runId!,
    loanId: result.loanId ?? fallbackLoanId,
  });

  const runContinue = useCallback(
    async (
      resumeAction: 'selectChecks' | 'confirmPrint' | 'lenderNotify',
      payload: Record<string, unknown>,
      ctx: AgentCtx
    ): Promise<void> => {
      setStepLoading(true);
      setAutomatingLoanId(ctx.loanId);
      try {
        const result = await continueAgentFlow({ threadId: ctx.threadId, runId: ctx.runId, resumeAction, ...payload });
        const next = extractCtx(result, ctx.loanId);

        if (result.status === 'awaiting_user' && result.uiAction === 'confirmPrint') {
          setAgentCtx(next);
          setConfirmData({ selectedCount: result.selectedCount ?? 0, totalAmount: result.totalAmount ?? 0 });
          setFlowStep('confirm');
          if (advanceConfirmRef.current) scheduleAdvance('confirmPrint', {}, next);
          return;
        }

        if (result.status === 'awaiting_user' && result.uiAction === 'lenderNotify') {
          setAgentCtx(next);
          setFlowStep('notification');
          advanceConfirmRef.current = false;
          if (advanceLenderRef.current) {
            scheduleAdvance('lenderNotify', { notificationOptions: DEFAULT_NOTIFICATION_OPTIONS }, next);
          }
          return;
        }

        const count = result.actions?.length ?? 0;
        setSuccessMsg(
          count > 0
            ? `Workflow completed: ${count} action(s) performed for ${ctx.loanId}`
            : result.message || 'Workflow completed successfully'
        );
        setFlowStep('success');
      } catch (error) {
        showSnackbar(`Failed to continue workflow: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      } finally {
        if (!pendingRef.current) setStepLoading(false);
        setAutomatingLoanId(null);
      }
    },
    [scheduleAdvance, showSnackbar]
  );

  // Keep ref in sync so scheduleAdvance always calls the latest runContinue
  runContinueRef.current = runContinue;

  const continueFlow = useCallback(
    async (action: 'selectChecks' | 'confirmPrint' | 'lenderNotify', payload: Record<string, unknown>) => {
      if (agentCtx) await runContinue(action, payload, agentCtx);
    },
    [agentCtx, runContinue]
  );

  const openFromAgentResponse = useCallback(
    (response: AgentResponse, borrower?: string, opts?: AutoAdvanceOpts) => {
      if (response.status !== 'awaiting_user' || !response.uiAction) return;

      const ctx = extractCtx(response, response.loanId ?? '');
      const loanId = ctx.loanId;

      if (response.uiAction === 'selectChecks') {
        advanceConfirmRef.current = opts?.autoAdvanceConfirm ?? false;
        advanceLenderRef.current = opts?.autoAdvanceLenderNotify ?? false;
        setAgentCtx(ctx);
        setAgentChecks((response.checks as Array<Record<string, unknown>>) ?? []);
        setLoanCtx({ loanId, borrower: borrower ?? 'Borrower' });
        setFlowStep('select');
        if (opts?.autoAdvanceSelectChecks && response.checks?.length) {
          const checkIds = response.checks.map((c) => String((c as Record<string, unknown>).id ?? ''));
          scheduleAdvance('selectChecks', { selectedCheckIds: checkIds }, ctx);
        }
        return;
      }

      if (response.uiAction === 'confirmPrint') {
        setAgentCtx(ctx);
        setConfirmData({ selectedCount: response.selectedCount ?? 0, totalAmount: response.totalAmount ?? 0 });
        setFlowStep('confirm');
        if (opts?.autoAdvanceConfirm) scheduleAdvance('confirmPrint', {}, ctx);
        return;
      }

      if (response.uiAction === 'lenderNotify') {
        setAgentCtx(ctx);
        setLoanCtx({ loanId, borrower: borrower ?? 'Borrower' });
        setFlowStep('notification');
      }
    },
    [runContinue, scheduleAdvance]
  );

  const openPrintChecksModal = useCallback((loanId: string, borrower: string) => {
    setLoanCtx({ loanId, borrower });
    setFlowStep('select');
  }, []);

  const handlePrintSelected = useCallback(
    (count: number, total: number, ids?: string[]) => {
      if (agentCtx) { void continueFlow('selectChecks', { selectedCheckIds: ids ?? [] }); return; }
      setConfirmData({ selectedCount: count, totalAmount: total });
      setFlowStep('confirm');
    },
    [agentCtx, continueFlow]
  );

  const handleProceedToNotification = useCallback(() => {
    if (agentCtx) { void continueFlow('confirmPrint', {}); return; }
    setFlowStep('notification');
  }, [agentCtx, continueFlow]);

  const handleLenderNotificationSubmit = useCallback(
    (options: NotificationOptions) => {
      if (agentCtx) {
        void continueFlow('lenderNotify', { notificationOptions: options });
      } else {
        setFlowStep('success');
      }
    },
    [agentCtx, continueFlow]
  );

  const value: AgentWorkflowContextValue = {
    openFromAgentResponse,
    openPrintChecksModal,
    closeFlow,
    showSnackbar,
    handlePrintSelected,
    handleProceedToNotification,
    handleLenderNotificationSubmit,
    automatingLoanId,
    setAutomatingLoanId,
  };

  return (
    <AgentWorkflowContext.Provider value={value}>
      {children}
      <SelectPrintChecksModal
        open={flowStep === 'select'}
        onClose={closeFlow}
        onPrintSelected={handlePrintSelected}
        loanId={loanCtx?.loanId}
        borrower={loanCtx?.borrower}
        checks={agentChecks}
        isSubmitting={stepLoading}
      />
      <PrintChecksConfirmModal
        open={flowStep === 'confirm'}
        onClose={closeFlow}
        selectedCount={confirmData?.selectedCount ?? 0}
        totalAmount={confirmData?.totalAmount ?? 0}
        onProceedToNotification={handleProceedToNotification}
        isSubmitting={stepLoading}
      />
      <LenderNotificationModal
        open={flowStep === 'notification'}
        onClose={closeFlow}
        onSubmit={handleLenderNotificationSubmit}
        isSubmitting={stepLoading}
      />
      <PrintChecksSuccessModal
        open={flowStep === 'success'}
        onClose={closeFlow}
        message={successMsg ?? undefined}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AgentWorkflowContext.Provider>
  );
}
