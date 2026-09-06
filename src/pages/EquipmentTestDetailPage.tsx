import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { equipmentService } from '../services/equipmentService';
import type { EquipmentDailyTest, CreateTestAttemptRequest, TestStatus } from '../types/equipment.types';
import toast from 'react-hot-toast';

export const EquipmentTestDetailPage: React.FC = () => {
  const { recordId } = useParams();
  const [searchParams] = useSearchParams();
  
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
    <div className="w-full max-w-[88rem] mx-auto py-space-xl px-margin-mobile md:px-margin-tablet lg:px-margin-desktop font-body-md relative">
      
      {/* Header Section */}
      <div className="mb-space-xl flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-subtle pb-space-lg">
        <div>
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20 text-primary">
              <span className="material-symbols-outlined text-[24px]">fact_check</span>
            </div>
            <h1 className="font-headline-xl text-text-primary tracking-tight">Daily Test Details</h1>
          </div>
          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            <span className="font-headline-md text-text-primary">{equipmentName}</span>
            <span className="px-2.5 py-1 bg-primary/10 text-primary font-technical-data text-[12px] rounded-md border border-primary/20">
              {equipmentCode}
            </span>
            <span className="text-border-strong px-2">|</span>
            <span className="font-body-md text-text-secondary">
              Period: {month && year ? <strong className="text-text-primary">Month {month}/{year}</strong> : 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="material-symbols-outlined text-primary text-[32px] animate-spin">progress_activity</span>
        </div>
      ) : (
        <div className="space-y-space-xl">
          {dailyTests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-surface-card rounded-xl border border-border-subtle shadow-sm">
              <div className="w-20 h-20 bg-surface-subtle rounded-full flex items-center justify-center mb-4">
                 <span className="material-symbols-outlined text-[40px] text-border-strong">event_note</span>
              </div>
              <h3 className="font-headline-sm text-text-primary mb-2">No Daily Tests Recorded</h3>
              <p className="font-body-sm text-text-secondary max-w-md mx-auto mb-6">
                There are no test blocks created for this month yet. Create today's test block to start recording attempts.
              </p>
              <button
                onClick={handleCreateDailyTest}
                disabled={creatingDaily}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-lg font-headline-sm text-[14px] bg-primary hover:bg-[#0369a1] text-white shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
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
                <div key={dt.id} className="bg-surface-card rounded-xl shadow-sm border border-border-subtle overflow-hidden">
                  <div className="px-space-lg py-4 border-b border-border-subtle bg-surface-subtle/50 flex justify-between items-center flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <span className="material-symbols-outlined text-text-secondary text-[20px]">today</span>
                      <h3 className="font-headline-sm text-text-primary">Date: {dt.testDate}</h3>
                    </div>
                    {dt.testDate === todayStr && (
                      <button
                        onClick={() => openAttemptModal(dt.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-label-md rounded-lg bg-surface border border-primary/30 text-primary hover:bg-primary hover:text-white transition-colors shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Add Attempt
                      </button>
                    )}
                  </div>
                  
                  <div className="p-0">
                    {dt.attempts.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-surface-subtle border-b border-border-subtle">
                            <tr>
                              <th className="px-4 py-2.5 font-label-md text-text-muted uppercase tracking-wider">Time</th>
                              <th className="px-4 py-2.5 font-label-md text-text-muted uppercase tracking-wider">Tester</th>
                              <th className="px-4 py-2.5 font-label-md text-text-muted uppercase tracking-wider text-center">Program</th>
                              <th className="px-4 py-2.5 font-label-md text-text-muted uppercase tracking-wider text-center">GO</th>
                              <th className="px-4 py-2.5 font-label-md text-text-muted uppercase tracking-wider text-center">NO GO</th>
                              <th className="px-4 py-2.5 font-label-md text-text-muted uppercase tracking-wider text-center border-l border-border-subtle">Result</th>
                              <th className="px-4 py-2.5 font-label-md text-text-muted uppercase tracking-wider">Remark</th>
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
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[12px] font-bold ${attempt.resultStatus === 'PASS' ? 'bg-status-nominal text-white shadow-sm' : 'bg-status-critical text-white shadow-sm'}`}>
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
                    ) : (
                      <p className="text-text-muted text-center py-6 font-body-sm">No attempts recorded for this day.</p>
                    )}
                  </div>
                </div>
              ))}

              {!hasTodayTest && (
                <div className="flex justify-center mt-8 pt-4">
                  <button
                    onClick={handleCreateDailyTest}
                    disabled={creatingDaily}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-lg font-headline-sm text-[14px] bg-surface-card border border-border-subtle text-text-primary shadow-sm hover:shadow-md hover:border-primary/50 hover:text-primary transition-all duration-200 disabled:opacity-50"
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-surface-card rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-border-subtle">
            <div className="px-6 py-4 border-b border-border-subtle bg-surface-subtle/50 flex justify-between items-center">
              <h3 className="font-headline-sm text-text-primary">Record Test Attempt</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmitAttempt} className="p-6 space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-label-md text-text-primary text-[13px] mb-1.5">Program</label>
                  <select 
                    value={attemptForm.programStatus}
                    onChange={(e) => setAttemptForm({...attemptForm, programStatus: e.target.value as TestStatus})}
                    className="w-full bg-surface-subtle border border-border-subtle rounded-lg font-body-md text-text-primary focus:bg-surface-card focus:shadow-[0_0_0_2px_#006194] focus:outline-none transition-all py-2 px-3"
                  >
                    <option value="PASS">PASS</option>
                    <option value="FAIL">FAIL</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-md text-text-primary text-[13px] mb-1.5">GO</label>
                  <select 
                    value={attemptForm.goStatus}
                    onChange={(e) => setAttemptForm({...attemptForm, goStatus: e.target.value as TestStatus})}
                    className="w-full bg-surface-subtle border border-border-subtle rounded-lg font-body-md text-text-primary focus:bg-surface-card focus:shadow-[0_0_0_2px_#006194] focus:outline-none transition-all py-2 px-3"
                  >
                    <option value="PASS">PASS</option>
                    <option value="FAIL">FAIL</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-md text-text-primary text-[13px] mb-1.5">NO GO</label>
                  <select 
                    value={attemptForm.noGoStatus}
                    onChange={(e) => setAttemptForm({...attemptForm, noGoStatus: e.target.value as TestStatus})}
                    className="w-full bg-surface-subtle border border-border-subtle rounded-lg font-body-md text-text-primary focus:bg-surface-card focus:shadow-[0_0_0_2px_#006194] focus:outline-none transition-all py-2 px-3"
                  >
                    <option value="PASS">PASS</option>
                    <option value="FAIL">FAIL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-label-md text-text-primary text-[13px] mb-1.5">Remark</label>
                <input 
                  type="text"
                  value={attemptForm.remark}
                  onChange={(e) => setAttemptForm({...attemptForm, remark: e.target.value})}
                  className="w-full bg-surface-subtle border border-border-subtle rounded-lg font-body-md text-text-primary focus:bg-surface-card focus:shadow-[0_0_0_2px_#006194] focus:outline-none transition-all py-2 px-3 placeholder:text-text-muted"
                  placeholder="Optional remark"
                />
              </div>

              <div className="bg-surface-subtle p-3.5 rounded-lg border border-border-subtle flex justify-between items-center mt-6">
                <span className="font-label-md text-text-secondary">Calculated Result:</span>
                <span className={`inline-flex items-center gap-1 font-bold ${calculatePreviewResult() ? 'text-status-nominal' : 'text-status-critical'}`}>
                  <span className="material-symbols-outlined text-[20px]">{calculatePreviewResult() ? 'check_circle' : 'cancel'}</span>
                  {calculatePreviewResult() ? 'PASS' : 'FAIL'}
                </span>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-[14px] font-headline-sm text-text-secondary bg-white border border-border-subtle rounded-lg hover:bg-surface-subtle transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submittingAttempt} className="px-5 py-2.5 text-[14px] font-headline-sm text-white bg-primary border border-transparent rounded-lg hover:bg-[#0369a1] shadow-sm disabled:opacity-50 transition-colors inline-flex items-center gap-2">
                  {submittingAttempt ? (
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">save</span>
                  )}
                  Save Attempt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
