import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { equipmentService } from '../services/equipmentService';
import type { EquipmentDailyTest, CreateTestAttemptRequest, TestStatus } from '../types/equipment.types';
import toast from 'react-hot-toast';
import { useViewMode } from '../context/ViewModeContext';
import { ViewModeToggle } from '../components/common/ViewModeToggle';

export const EquipmentTestDetailPage: React.FC = () => {
  const { recordId } = useParams();
  const [searchParams] = useSearchParams();
  const { viewMode } = useViewMode();

  const equipmentCode = searchParams.get('code') || 'Unknown Code';
  const equipmentName = searchParams.get('name') || 'Unknown Name';
  const month = searchParams.get('month') || '';
  const year = searchParams.get('year') || '';

  const [dailyTests, setDailyTests] = useState<EquipmentDailyTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingDaily, setCreatingDaily] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDailyTestId, setSelectedDailyTestId] = useState<string | null>(null);
  const [submittingAttempt, setSubmittingAttempt] = useState(false);

  const [attemptForm, setAttemptForm] = useState<CreateTestAttemptRequest>({
    programStatus: 'PASS',
    goStatus: 'PASS',
    noGoStatus: 'FAIL',
    remark: ''
  });

  useEffect(() => {
    if (recordId) {
      fetchDailyTests(recordId);
    }
  }, [recordId]);

  const fetchDailyTests = async (id: string) => {
    setLoading(true);
    try {
      const data = await equipmentService.getDailyTests(id);
      setDailyTests(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load daily tests');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDailyTest = async () => {
    if (!recordId) return;
    setCreatingDaily(true);
    try {
      await equipmentService.createDailyTest(recordId);
      toast.success('Created current day test block!');
      fetchDailyTests(recordId);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create daily test');
    } finally {
      setCreatingDaily(false);
    }
  };

  const openAttemptModal = (dailyTestId: string) => {
    setSelectedDailyTestId(dailyTestId);
    setAttemptForm({
      programStatus: 'PASS',
      goStatus: 'PASS',
      noGoStatus: 'FAIL',
      remark: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmitAttempt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDailyTestId) return;

    setSubmittingAttempt(true);
    try {
      await equipmentService.createTestAttempt(selectedDailyTestId, attemptForm);
      toast.success('Test attempt recorded!');
      setIsModalOpen(false);
      if (recordId) fetchDailyTests(recordId);
    } catch (error: any) {
      toast.error(error.message || 'Failed to record attempt');
    } finally {
      setSubmittingAttempt(false);
    }
  };

  const calculatePreviewResult = () => {
    return attemptForm.programStatus === 'PASS' &&
      attemptForm.goStatus === 'PASS' &&
      attemptForm.noGoStatus === 'FAIL';
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const hasTodayTest = dailyTests.some(dt => dt.testDate === todayStr);

  return (
    <div className="w-full max-w-[88rem] mx-auto py-3 sm:py-space-xl px-2 sm:px-margin-mobile md:px-margin-tablet lg:px-margin-desktop font-body-md relative">

      {/* Header Section */}
      <div className="mb-4 sm:mb-space-xl flex flex-col gap-3 border-b border-border-subtle pb-4 sm:pb-space-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-3 mb-1.5">
              <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 text-primary shrink-0">
                <span className="material-symbols-outlined text-[24px]">fact_check</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-headline-xl text-text-primary tracking-tight">
                Daily Test Details
              </h1>
            </div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1 text-xs sm:text-sm">
              <span className="font-headline-sm font-bold text-text-primary">{equipmentName}</span>
              <span className="px-2 py-0.5 bg-primary/10 text-primary font-technical-data font-semibold rounded-md border border-primary/20">
                {equipmentCode}
              </span>
              <span className="text-border-strong px-1">|</span>
              <span className="text-text-secondary">
                Period: {month && year ? <strong className="text-text-primary font-semibold">Month {month}/{year}</strong> : 'Unknown'}
              </span>
            </div>
          </div>

          {/* View Mode Switcher */}
          <ViewModeToggle className="self-start sm:self-auto" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="material-symbols-outlined text-primary text-[32px] animate-spin">progress_activity</span>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {dailyTests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-surface-card rounded-xl border border-border-subtle shadow-xs">
              <div className="w-16 h-16 bg-surface-subtle rounded-full flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[36px] text-border-strong">event_note</span>
              </div>
              <h3 className="font-headline-sm text-text-primary mb-1">No Daily Tests Recorded</h3>
              <p className="font-body-sm text-text-secondary max-w-sm mx-auto mb-5 text-xs sm:text-sm">
                There are no test blocks created for this month yet. Create today's test block to start recording inspection attempts.
              </p>
              <button
                onClick={handleCreateDailyTest}
                disabled={creatingDaily}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-3 rounded-xl font-headline-sm text-[14px] bg-primary hover:bg-[#0369a1] text-white shadow-xs hover:shadow-md transition-all duration-200 disabled:opacity-50 min-h-[46px]"
              >
                {creatingDaily ? (
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">add_task</span>
                )}
                <span>Create Today's Test</span>
              </button>
            </div>
          ) : (
            <>
              {dailyTests.map((dt) => (
                <div key={dt.id} className="bg-surface-card rounded-xl shadow-xs border border-border-subtle overflow-hidden">
                  {/* Daily Block Header */}
                  <div className="px-3.5 sm:px-space-lg py-3 sm:py-4 border-b border-border-subtle bg-surface-subtle/50 flex justify-between items-center flex-wrap gap-2.5">
                    <div className="flex items-center space-x-2">
                      <span className="material-symbols-outlined text-text-secondary text-[20px]">today</span>
                      <h3 className="font-headline-sm text-sm sm:text-base font-bold text-text-primary">
                        Date: {dt.testDate}
                        {dt.testDate === todayStr && (
                          <span className="ml-2 text-xs font-semibold px-2 py-0.5 bg-status-nominal/15 text-status-nominal rounded-full border border-status-nominal/30">
                            Today
                          </span>
                        )}
                      </h3>
                    </div>
                    {dt.testDate === todayStr && (
                      <button
                        onClick={() => openAttemptModal(dt.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-primary text-white hover:bg-[#0369a1] transition-colors shadow-xs min-h-[40px]"
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        <span>Add Attempt</span>
                      </button>
                    )}
                  </div>

                  <div className="p-0">
                    {dt.attempts.length > 0 ? (
                      viewMode === 'card' ? (
                        /* Inspection Attempt Cards (Mobile & Compact) */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 sm:p-4">
                          {dt.attempts.map((attempt, attIdx) => {
                            const isPass = attempt.resultStatus === 'PASS';
                            return (
                              <div
                                key={attempt.id}
                                className={`p-4 rounded-xl border transition-all ${isPass
                                    ? 'bg-status-nominal/5 border-status-nominal/20'
                                    : 'bg-status-critical/5 border-status-critical/20'
                                  } space-y-3`}
                              >
                                {/* Card Header: Time & Result */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <span className="w-6 h-6 rounded-full bg-surface-card border border-border-subtle flex items-center justify-center font-technical-data font-bold text-xs text-text-muted">
                                      #{attIdx + 1}
                                    </span>
                                    <span className="font-technical-data text-xs text-text-secondary font-medium">
                                      {new Date(attempt.attemptTime).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${isPass ? 'bg-status-nominal text-white' : 'bg-status-critical text-white'
                                    }`}>
                                    <span className="material-symbols-outlined text-[14px]">
                                      {isPass ? 'check_circle' : 'cancel'}
                                    </span>
                                    {attempt.resultStatus}
                                  </span>
                                </div>

                                {/* Tester Info */}
                                <div className="flex items-center space-x-2 text-xs text-text-secondary">
                                  <span className="material-symbols-outlined text-[16px] text-text-muted">person</span>
                                  <span>Tester: <strong className="text-text-primary">{attempt.testerUsername}</strong></span>
                                </div>

                                {/* Metric Strip */}
                                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border-subtle/50 text-center">
                                  <div className="bg-surface-card p-1.5 rounded-lg border border-border-subtle/70">
                                    <p className="text-[10px] uppercase font-semibold text-text-muted mb-0.5">Program</p>
                                    <span className={`text-[11px] font-bold ${attempt.programStatus === 'PASS' ? 'text-status-nominal' : 'text-status-critical'}`}>
                                      {attempt.programStatus}
                                    </span>
                                  </div>
                                  <div className="bg-surface-card p-1.5 rounded-lg border border-border-subtle/70">
                                    <p className="text-[10px] uppercase font-semibold text-text-muted mb-0.5">GO</p>
                                    <span className={`text-[11px] font-bold ${attempt.goStatus === 'PASS' ? 'text-status-nominal' : 'text-status-critical'}`}>
                                      {attempt.goStatus}
                                    </span>
                                  </div>
                                  <div className="bg-surface-card p-1.5 rounded-lg border border-border-subtle/70">
                                    <p className="text-[10px] uppercase font-semibold text-text-muted mb-0.5">NO GO</p>
                                    <span className={`text-[11px] font-bold ${attempt.noGoStatus === 'PASS' ? 'text-status-nominal' : 'text-status-critical'}`}>
                                      {attempt.noGoStatus}
                                    </span>
                                  </div>
                                </div>

                                {attempt.remark && (
                                  <p className="text-xs text-text-secondary bg-surface-card p-2 rounded-lg border border-border-subtle/70 italic">
                                    "{attempt.remark}"
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        /* Horizontal Scrolling Table */
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse min-w-[650px]">
                            <thead className="bg-surface-subtle border-b border-border-subtle">
                              <tr>
                                <th className="px-4 py-2.5 font-label-md text-text-muted uppercase tracking-wider text-xs">Time</th>
                                <th className="px-4 py-2.5 font-label-md text-text-muted uppercase tracking-wider text-xs">Tester</th>
                                <th className="px-4 py-2.5 font-label-md text-text-muted uppercase tracking-wider text-center text-xs">Program</th>
                                <th className="px-4 py-2.5 font-label-md text-text-muted uppercase tracking-wider text-center text-xs">GO</th>
                                <th className="px-4 py-2.5 font-label-md text-text-muted uppercase tracking-wider text-center text-xs">NO GO</th>
                                <th className="px-4 py-2.5 font-label-md text-text-muted uppercase tracking-wider text-center border-l border-border-subtle text-xs">Result</th>
                                <th className="px-4 py-2.5 font-label-md text-text-muted uppercase tracking-wider text-xs">Remark</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dt.attempts.map((attempt) => (
                                <tr key={attempt.id} className="border-b border-border-subtle last:border-0 hover:bg-surface-subtle transition-colors">
                                  <td className="px-4 py-3 font-technical-data text-[13px] text-text-secondary whitespace-nowrap">
                                    {new Date(attempt.attemptTime).toLocaleTimeString()}
                                  </td>
                                  <td className="px-4 py-3 font-body-sm text-text-primary font-medium whitespace-nowrap">
                                    {attempt.testerUsername}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-bold ${attempt.programStatus === 'PASS' ? 'bg-status-nominal/15 text-status-nominal' : 'bg-status-critical/15 text-status-critical'}`}>
                                      {attempt.programStatus}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-bold ${attempt.goStatus === 'PASS' ? 'bg-status-nominal/15 text-status-nominal' : 'bg-status-critical/15 text-status-critical'}`}>
                                      {attempt.goStatus}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-bold ${attempt.noGoStatus === 'PASS' ? 'bg-status-nominal/15 text-status-nominal' : 'bg-status-critical/15 text-status-critical'}`}>
                                      {attempt.noGoStatus}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center border-l border-border-subtle">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[12px] font-bold ${attempt.resultStatus === 'PASS' ? 'bg-status-nominal text-white shadow-2xs' : 'bg-status-critical text-white shadow-2xs'}`}>
                                      <span className="material-symbols-outlined text-[14px]">{attempt.resultStatus === 'PASS' ? 'check_circle' : 'cancel'}</span>
                                      {attempt.resultStatus}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 font-body-sm text-text-secondary">{attempt.remark || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                    ) : (
                      <p className="text-text-muted text-center py-6 font-body-sm text-xs sm:text-sm">No attempts recorded for this day yet.</p>
                    )}
                  </div>
                </div>
              ))}

              {!hasTodayTest && (
                <div className="flex justify-center mt-6 pt-2">
                  <button
                    onClick={handleCreateDailyTest}
                    disabled={creatingDaily}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-3 rounded-xl font-headline-sm text-[14px] bg-surface-card border border-border-subtle text-text-primary shadow-2xs hover:shadow-md hover:border-primary/50 hover:text-primary transition-all duration-200 disabled:opacity-50 min-h-[46px]"
                  >
                    {creatingDaily ? (
                      <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">add_task</span>
                    )}
                    <span>Create Today's Test Block</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Modal - Adapts as Bottom Sheet on Mobile (<640px) and Dialog on Desktop */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4">
          <div
            className="fixed inset-0"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative bg-surface-card rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto z-10 border border-border-subtle animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200">
            {/* Mobile Drag Indicator Handle */}
            <div className="w-10 h-1.5 bg-border-strong rounded-full mx-auto my-2.5 sm:hidden" />

            <div className="px-4 sm:px-6 py-3.5 border-b border-border-subtle bg-surface-subtle/50 flex justify-between items-center">
              <h3 className="font-headline-sm text-base sm:text-lg font-bold text-text-primary">Record Test Attempt</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-subtle rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitAttempt} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
                <div>
                  <label className="block font-label-md text-text-primary text-xs sm:text-[13px] font-semibold mb-1.5">Program</label>
                  <select
                    value={attemptForm.programStatus}
                    onChange={(e) => setAttemptForm({ ...attemptForm, programStatus: e.target.value as TestStatus })}
                    className="w-full bg-surface-subtle border border-border-subtle rounded-xl font-body-md text-text-primary focus:bg-surface-card focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all py-2.5 px-2.5 sm:px-3 text-sm min-h-[44px]"
                  >
                    <option value="PASS">PASS</option>
                    <option value="FAIL">FAIL</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-md text-text-primary text-xs sm:text-[13px] font-semibold mb-1.5">GO</label>
                  <select
                    value={attemptForm.goStatus}
                    onChange={(e) => setAttemptForm({ ...attemptForm, goStatus: e.target.value as TestStatus })}
                    className="w-full bg-surface-subtle border border-border-subtle rounded-xl font-body-md text-text-primary focus:bg-surface-card focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all py-2.5 px-2.5 sm:px-3 text-sm min-h-[44px]"
                  >
                    <option value="PASS">PASS</option>
                    <option value="FAIL">FAIL</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-md text-text-primary text-xs sm:text-[13px] font-semibold mb-1.5">NO GO</label>
                  <select
                    value={attemptForm.noGoStatus}
                    onChange={(e) => setAttemptForm({ ...attemptForm, noGoStatus: e.target.value as TestStatus })}
                    className="w-full bg-surface-subtle border border-border-subtle rounded-xl font-body-md text-text-primary focus:bg-surface-card focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all py-2.5 px-2.5 sm:px-3 text-sm min-h-[44px]"
                  >
                    <option value="PASS">PASS</option>
                    <option value="FAIL">FAIL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-label-md text-text-primary text-xs sm:text-[13px] font-semibold mb-1.5">Remark</label>
                <input
                  type="text"
                  value={attemptForm.remark}
                  onChange={(e) => setAttemptForm({ ...attemptForm, remark: e.target.value })}
                  className="w-full bg-surface-subtle border border-border-subtle rounded-xl font-body-md text-text-primary focus:bg-surface-card focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all py-2.5 px-3 text-sm placeholder:text-text-muted min-h-[44px]"
                  placeholder="Optional remark"
                />
              </div>

              {/* Dynamic Preview Banner */}
              <div className="bg-surface-subtle p-3 sm:p-3.5 rounded-xl border border-border-subtle flex justify-between items-center mt-4">
                <span className="text-xs sm:text-sm font-semibold text-text-secondary">Overall Evaluation:</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${calculatePreviewResult() ? 'bg-status-nominal text-white' : 'bg-status-critical text-white'
                  }`}>
                  <span className="material-symbols-outlined text-[16px]">
                    {calculatePreviewResult() ? 'check_circle' : 'cancel'}
                  </span>
                  {calculatePreviewResult() ? 'PASS' : 'FAIL'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-text-secondary bg-white border border-border-subtle rounded-xl hover:bg-surface-subtle transition-colors min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAttempt}
                  className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-white bg-primary border border-transparent rounded-xl hover:bg-[#0369a1] active:bg-[#024a73] shadow-xs disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2 min-h-[44px]"
                >
                  {submittingAttempt ? (
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">save</span>
                  )}
                  <span>Save Attempt</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};