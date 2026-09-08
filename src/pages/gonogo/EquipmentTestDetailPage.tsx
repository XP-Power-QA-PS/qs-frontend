import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { equipmentService } from '@/services/equipment';
import type { EquipmentDailyTest, CreateTestAttemptRequest, TestStatus } from '@/types/equipment';
import toast from 'react-hot-toast';
import { useViewMode } from '@/context/ViewModeContext';
import { ViewModeToggle } from '@/components/common/ViewModeToggle';

export const EquipmentTestDetailPage: React.FC = () => {
  const { equipmentId, recordId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { viewMode } = useViewMode();

  const equipmentCode = searchParams.get('code') || 'Unknown Code';
  const equipmentName = searchParams.get('name') || 'Unknown Name';
  const month = searchParams.get('month') || '';
  const year = searchParams.get('year') || '';

  const [dailyTests, setDailyTests] = useState<EquipmentDailyTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingDaily, setCreatingDaily] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

  // Filter state
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'HAS_FAIL' | 'ALL_PASS'>('ALL');

  // Quick Compare Modal state
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareDayA, setCompareDayA] = useState<string>('');
  const [compareDayB, setCompareDayB] = useState<string>('');

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

      const todayDateStr = new Date().toISOString().split('T')[0];
      setExpandedDays((prev) => {
        const initial: Record<string, boolean> = {};
        data.forEach((dt, idx) => {
          if (prev[dt.id] !== undefined) {
            initial[dt.id] = prev[dt.id];
          } else {
            // Mặc định: ngày hôm nay hoặc ngày đầu tiên (mới nhất) sẽ mở, các ngày cũ hơn sẽ thu gọn
            initial[dt.id] = dt.testDate === todayDateStr || idx === 0;
          }
        });
        return initial;
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to load daily tests');
    } finally {
      setLoading(false);
    }
  };

  const toggleDayExpand = (dayId: string) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayId]: !prev[dayId]
    }));
  };

  const openCompareModal = () => {
    if (dailyTests.length < 2) {
      toast.error('Cần ít nhất 2 ngày kiểm tra để thực hiện so sánh!');
      return;
    }
    setCompareDayA(dailyTests[0]?.id || '');
    setCompareDayB(dailyTests[1]?.id || '');
    setIsCompareModalOpen(true);
  };

  const handleLaunchCompare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compareDayA || !compareDayB) {
      toast.error('Vui lòng chọn đủ 2 ngày để so sánh!');
      return;
    }
    if (compareDayA === compareDayB) {
      toast.error('Vui lòng chọn 2 ngày khác nhau để so sánh!');
      return;
    }
    setIsCompareModalOpen(false);
    navigate(
      `/equipments/${equipmentId}/records/${recordId}/compare?dayIds=${compareDayA},${compareDayB}&code=${encodeURIComponent(
        equipmentCode
      )}&name=${encodeURIComponent(equipmentName)}&month=${month}&year=${year}`
    );
  };

  const getDaySummary = (dayId: string) => {
    const day = dailyTests.find((dt) => dt.id === dayId);
    if (!day) return null;
    const total = day.attempts.length;
    const passCount = day.attempts.filter((a) => a.resultStatus === 'PASS').length;
    const failCount = total - passCount;
    const passRate = total > 0 ? Math.round((passCount / total) * 100) : 0;
    const hasFail = failCount > 0;
    const allPass = total > 0 && failCount === 0;
    const latestTester = day.attempts[day.attempts.length - 1]?.testerUsername || 'Chưa có KTV';
    return {
      testDate: day.testDate,
      total,
      passCount,
      failCount,
      passRate,
      hasFail,
      allPass,
      latestTester
    };
  };

  const failDaysCount = dailyTests.filter((dt) => dt.attempts.some((a) => a.resultStatus === 'FAIL')).length;
  const passDaysCount = dailyTests.filter((dt) => dt.attempts.length > 0 && dt.attempts.every((a) => a.resultStatus === 'PASS')).length;

  const filteredDailyTests = dailyTests.filter((dt) => {
    if (selectedDateFilter && dt.testDate !== selectedDateFilter) {
      return false;
    }
    if (selectedStatusFilter === 'HAS_FAIL') {
      const hasFail = dt.attempts.some((a) => a.resultStatus === 'FAIL');
      if (!hasFail) return false;
    }
    if (selectedStatusFilter === 'ALL_PASS') {
      const hasAttempts = dt.attempts.length > 0;
      const allPass = hasAttempts && dt.attempts.every((a) => a.resultStatus === 'PASS');
      if (!allPass) return false;
    }
    return true;
  });

  const isAllExpanded = filteredDailyTests.length > 0 && filteredDailyTests.every((dt) => expandedDays[dt.id]);

  const handleToggleAll = () => {
    const nextState = !isAllExpanded;
    const update: Record<string, boolean> = { ...expandedDays };
    filteredDailyTests.forEach((dt) => {
      update[dt.id] = nextState;
    });
    setExpandedDays(update);
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
    <div className="w-full pt-0.5 sm:pt-1 pb-6 sm:pb-space-xl font-body-md relative">

      {/* Header Section */}
      <div className="mb-3 sm:mb-4 flex flex-col gap-2.5 border-b border-border-subtle pb-3 sm:pb-4">
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

          {/* Controls: Create Today's Test + Expand/Collapse All + View Mode Switcher */}
          <div className="flex items-center gap-2 sm:gap-2.5 self-start sm:self-auto flex-wrap">
            {/* Create Today's Test Button at the Top */}
            <button
              type="button"
              onClick={handleCreateDailyTest}
              disabled={creatingDaily || hasTodayTest}
              className={`h-10 inline-flex items-center justify-center space-x-1.5 px-3.5 rounded-xl font-headline-sm text-xs sm:text-sm font-semibold transition-all duration-200 ${
                hasTodayTest
                  ? 'bg-surface-subtle text-text-muted border border-border-subtle cursor-not-allowed shadow-none'
                  : 'bg-primary hover:bg-[#0369a1] active:bg-[#024a73] text-white shadow-xs hover:shadow-md'
              }`}
            >
              {creatingDaily ? (
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">
                  {hasTodayTest ? 'check_circle' : 'add_task'}
                </span>
              )}
              <span>{hasTodayTest ? "Today's Test Active" : "Create Today's Test"}</span>
            </button>

            {dailyTests.length > 1 && (
              <button
                type="button"
                onClick={handleToggleAll}
                className="h-10 inline-flex items-center justify-center gap-1.5 px-3.5 rounded-xl border border-border-subtle bg-surface-card hover:bg-surface-subtle text-text-secondary hover:text-text-primary text-xs sm:text-sm font-semibold shadow-2xs transition-all"
                title={isAllExpanded ? "Thu gọn tất cả các ngày" : "Mở rộng tất cả các ngày"}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isAllExpanded ? 'unfold_less' : 'unfold_more'}
                </span>
                <span>{isAllExpanded ? 'Collapse All' : 'Expand All'}</span>
              </button>
            )}

            <ViewModeToggle />
          </div>
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
              {/* Filter & Actions Toolbar */}
              <div className="bg-surface-card p-3 sm:p-4 rounded-2xl border border-border-subtle shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 min-w-0">
                {/* Date Dropdown & Status Filter Pills */}
                <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                  {/* Date Selector Dropdown */}
                  <div className="h-10 inline-flex items-center space-x-2 bg-surface-subtle px-3 rounded-xl border border-border-subtle w-full sm:w-auto max-w-full">
                    <span className="material-symbols-outlined text-text-secondary text-[18px] shrink-0">calendar_month</span>
                    <select
                      value={selectedDateFilter}
                      onChange={(e) => setSelectedDateFilter(e.target.value)}
                      className="bg-transparent text-xs sm:text-sm font-medium text-text-primary focus:outline-none cursor-pointer pr-1 w-full"
                    >
                      <option value="">Tất cả các ngày ({dailyTests.length})</option>
                      {dailyTests.map((dt) => (
                        <option key={dt.id} value={dt.testDate}>
                          Ngày {dt.testDate} {dt.testDate === todayStr ? '(Hôm nay)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Pills */}
                  <div className="h-10 inline-flex items-center bg-surface-subtle p-1 rounded-xl border border-border-subtle text-xs max-w-full overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedStatusFilter('ALL')}
                      className={`h-full px-3 inline-flex items-center justify-center rounded-lg font-semibold transition-all whitespace-nowrap ${
                        selectedStatusFilter === 'ALL'
                          ? 'bg-surface-card text-primary shadow-xs font-bold'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      Tất cả
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedStatusFilter('HAS_FAIL')}
                      className={`h-full px-3 inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                        selectedStatusFilter === 'HAS_FAIL'
                          ? 'bg-status-critical/15 text-status-critical shadow-xs font-bold'
                          : 'text-text-secondary hover:text-status-critical'
                      }`}
                    >
                      <span>Có lỗi</span>
                      {failDaysCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-status-critical text-white text-[10px] font-bold">
                          {failDaysCount}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedStatusFilter('ALL_PASS')}
                      className={`h-full px-3 inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                        selectedStatusFilter === 'ALL_PASS'
                          ? 'bg-status-nominal/15 text-status-nominal shadow-xs font-bold'
                          : 'text-text-secondary hover:text-status-nominal'
                      }`}
                    >
                      <span>Đạt 100%</span>
                      {passDaysCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-status-nominal text-white text-[10px] font-bold">
                          {passDaysCount}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Clear filter button */}
                  {(selectedDateFilter || selectedStatusFilter !== 'ALL') && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDateFilter('');
                        setSelectedStatusFilter('ALL');
                      }}
                      className="h-10 text-xs text-primary hover:underline inline-flex items-center gap-1 px-3 rounded-xl hover:bg-primary/5 border border-transparent transition-colors whitespace-nowrap"
                    >
                      <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
                      <span>Xóa bộ lọc</span>
                    </button>
                  )}
                </div>

                {/* Compare Action Button & Counter */}
                <div className="flex items-center justify-between sm:justify-start gap-2.5 w-full md:w-auto flex-wrap">
                  {dailyTests.length >= 2 && (
                    <button
                      type="button"
                      onClick={openCompareModal}
                      className="h-10 inline-flex items-center justify-center gap-1.5 px-3.5 rounded-xl text-xs sm:text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/25 transition-all shadow-2xs w-full sm:w-auto"
                      title="Mở hộp thoại chọn nhanh 2 ngày để so sánh"
                    >
                      <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
                      <span>So sánh 2 ngày</span>
                    </button>
                  )}
                  <span className="text-xs text-text-muted font-medium">
                    Hiển thị <strong className="text-text-primary">{filteredDailyTests.length}</strong> / {dailyTests.length} ngày
                  </span>
                </div>
              </div>

              {/* Filter Empty State or Daily Tests List */}
              {filteredDailyTests.length === 0 ? (
                <div className="text-center py-12 px-4 bg-surface-card rounded-2xl border border-border-subtle shadow-xs">
                  <span className="material-symbols-outlined text-[40px] text-text-muted mb-2">
                    filter_list_off
                  </span>
                  <h4 className="font-headline-sm text-sm sm:text-base font-bold text-text-primary mb-1">
                    Không tìm thấy ngày phù hợp
                  </h4>
                  <p className="text-xs text-text-muted max-w-sm mx-auto mb-4">
                    Không có ngày kiểm tra nào thỏa mãn bộ lọc hiện tại. Hãy thử chọn ngày hoặc trạng thái khác.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDateFilter('');
                      setSelectedStatusFilter('ALL');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              ) : (
                filteredDailyTests.map((dt) => {
                const isExpanded = !!expandedDays[dt.id];
                const hasAttempts = dt.attempts.length > 0;
                const passCount = dt.attempts.filter((a) => a.resultStatus === 'PASS').length;
                const failCount = dt.attempts.length - passCount;

                return (
                  <div
                    key={dt.id}
                    className="bg-surface-card rounded-xl shadow-xs border border-border-subtle overflow-hidden transition-all duration-200"
                  >
                    {/* Daily Block Header (Collapsible Accordion Trigger) */}
                    <div
                      onClick={() => toggleDayExpand(dt.id)}
                      className={`px-3 sm:px-space-lg py-2.5 sm:py-3.5 bg-surface-subtle/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-2.5 cursor-pointer select-none hover:bg-surface-subtle transition-colors min-w-0 ${
                        isExpanded ? 'border-b border-border-subtle' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between sm:justify-start gap-2 flex-wrap min-w-0 flex-1">
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="material-symbols-outlined text-text-secondary text-[20px] shrink-0">today</span>

                          <h3 className="font-headline-sm text-sm sm:text-base font-bold text-text-primary flex items-center gap-1.5 flex-wrap">
                            <span>Date: {dt.testDate}</span>
                            {dt.testDate === todayStr && (
                              <span className="text-xs font-semibold px-2 py-0.5 bg-status-nominal/15 text-status-nominal rounded-full border border-status-nominal/30 shrink-0">
                                Today
                              </span>
                            )}
                          </h3>
                        </div>

                        {/* Summary Badges (Visible whether expanded or collapsed) */}
                        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                          <span className="text-xs px-2 py-0.5 rounded-md font-technical-data font-medium bg-surface-card border border-border-subtle text-text-muted">
                            {dt.attempts.length} {dt.attempts.length === 1 ? 'attempt' : 'attempts'}
                          </span>
                          {hasAttempts && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                                failCount > 0
                                  ? 'bg-status-critical/10 text-status-critical border border-status-critical/20'
                                  : 'bg-status-nominal/10 text-status-nominal border border-status-nominal/20'
                              }`}
                            >
                              {failCount > 0 ? `${failCount} FAIL` : 'ALL PASS'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Header Actions & Right Accordion Arrow */}
                      <div className="flex items-center justify-end gap-2 sm:gap-2.5 shrink-0 w-full sm:w-auto">
                        {dt.testDate === todayStr && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openAttemptModal(dt.id);
                            }}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl bg-primary text-white hover:bg-[#0369a1] transition-colors shadow-xs min-h-[38px] flex-1 sm:flex-initial cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            <span>Add Attempt</span>
                          </button>
                        )}

                        {/* Accordion Arrow Button on the Right */}
                        <div
                          className="w-8 h-8 rounded-lg bg-surface-card border border-border-subtle flex items-center justify-center text-text-muted hover:text-primary transition-colors shrink-0 shadow-2xs ml-auto sm:ml-0"
                          title={isExpanded ? "Thu gọn ngày này" : "Mở rộng ngày này"}
                        >
                          <span
                            className={`material-symbols-outlined text-[22px] transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 text-primary' : ''
                            }`}
                          >
                            expand_more
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Content */}
                    {isExpanded && (
                      <div className="p-0 animate-in fade-in duration-150">
                        {dt.attempts.length > 0 ? (
                          viewMode === 'card' ? (
                            /* Inspection Attempt Cards (Mobile & Compact) */
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 sm:p-4">
                              {dt.attempts.map((attempt, attIdx) => {
                                const isPass = attempt.resultStatus === 'PASS';
                                return (
                                  <div
                                    key={attempt.id}
                                    className={`p-4 rounded-xl border transition-all ${
                                      isPass
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
                                      <span
                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                          isPass
                                            ? 'bg-status-nominal text-white'
                                            : 'bg-status-critical text-white'
                                        }`}
                                      >
                                        <span className="material-symbols-outlined text-[14px]">
                                          {isPass ? 'check_circle' : 'cancel'}
                                        </span>
                                        {attempt.resultStatus}
                                      </span>
                                    </div>

                                    {/* Tester Info */}
                                    <div className="flex items-center space-x-2 text-xs text-text-secondary">
                                      <span className="material-symbols-outlined text-[16px] text-text-muted">person</span>
                                      <span>
                                        Tester: <strong className="text-text-primary">{attempt.testerUsername}</strong>
                                      </span>
                                    </div>

                                    {/* Metric Strip */}
                                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border-subtle/50 text-center">
                                      <div className="bg-surface-card p-1.5 rounded-lg border border-border-subtle/70">
                                        <p className="text-[10px] uppercase font-semibold text-text-muted mb-0.5">Program</p>
                                        <span
                                          className={`text-[11px] font-bold ${
                                            attempt.programStatus === 'PASS'
                                              ? 'text-status-nominal'
                                              : 'text-status-critical'
                                          }`}
                                        >
                                          {attempt.programStatus}
                                        </span>
                                      </div>
                                      <div className="bg-surface-card p-1.5 rounded-lg border border-border-subtle/70">
                                        <p className="text-[10px] uppercase font-semibold text-text-muted mb-0.5">GO</p>
                                        <span
                                          className={`text-[11px] font-bold ${
                                            attempt.goStatus === 'PASS'
                                              ? 'text-status-nominal'
                                              : 'text-status-critical'
                                          }`}
                                        >
                                          {attempt.goStatus}
                                        </span>
                                      </div>
                                      <div className="bg-surface-card p-1.5 rounded-lg border border-border-subtle/70">
                                        <p className="text-[10px] uppercase font-semibold text-text-muted mb-0.5">NO GO</p>
                                        <span
                                          className={`text-[11px] font-bold ${
                                            attempt.noGoStatus === 'PASS'
                                              ? 'text-status-nominal'
                                              : 'text-status-critical'
                                          }`}
                                        >
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
                            <div className="overflow-x-auto max-w-full w-full">
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
                                    <tr
                                      key={attempt.id}
                                      className="border-b border-border-subtle last:border-0 hover:bg-surface-subtle transition-colors"
                                    >
                                      <td className="px-4 py-3 font-technical-data text-[13px] text-text-secondary whitespace-nowrap">
                                        {new Date(attempt.attemptTime).toLocaleTimeString()}
                                      </td>
                                      <td className="px-4 py-3 font-body-sm text-text-primary font-medium whitespace-nowrap">
                                        {attempt.testerUsername}
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        <span
                                          className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-bold ${
                                            attempt.programStatus === 'PASS'
                                              ? 'bg-status-nominal/15 text-status-nominal'
                                              : 'bg-status-critical/15 text-status-critical'
                                          }`}
                                        >
                                          {attempt.programStatus}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        <span
                                          className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-bold ${
                                            attempt.goStatus === 'PASS'
                                              ? 'bg-status-nominal/15 text-status-nominal'
                                              : 'bg-status-critical/15 text-status-critical'
                                          }`}
                                        >
                                          {attempt.goStatus}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        <span
                                          className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-bold ${
                                            attempt.noGoStatus === 'PASS'
                                              ? 'bg-status-nominal/15 text-status-nominal'
                                              : 'bg-status-critical/15 text-status-critical'
                                          }`}
                                        >
                                          {attempt.noGoStatus}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-center border-l border-border-subtle">
                                        <span
                                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[12px] font-bold ${
                                            attempt.resultStatus === 'PASS'
                                              ? 'bg-status-nominal text-white shadow-2xs'
                                              : 'bg-status-critical text-white shadow-2xs'
                                          }`}
                                        >
                                          <span className="material-symbols-outlined text-[14px]">
                                            {attempt.resultStatus === 'PASS' ? 'check_circle' : 'cancel'}
                                          </span>
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
                          <p className="text-text-muted text-center py-6 font-body-sm text-xs sm:text-sm">
                            No attempts recorded for this day yet.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              }))}
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
      {/* Quick Compare Modal */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4">
          <div
            className="fixed inset-0"
            onClick={() => setIsCompareModalOpen(false)}
          />

          <div className="relative bg-surface-card rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto z-10 border border-border-subtle animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200">
            {/* Mobile Drag Indicator Handle */}
            <div className="w-10 h-1.5 bg-border-strong rounded-full mx-auto my-2.5 sm:hidden" />

            <div className="px-4 sm:px-6 py-4 border-b border-border-subtle bg-surface-subtle/50 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs shrink-0">
                  <span className="material-symbols-outlined text-[20px]">compare_arrows</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-base sm:text-lg font-bold text-text-primary">
                    Chọn 2 Ngày Để So Sánh Đối Chiếu
                  </h3>
                  <p className="text-xs text-text-muted">
                    Chọn nhanh 2 mốc thời gian trong kỳ để đối chiếu dữ liệu song song
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(false)}
                className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-subtle rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleLaunchCompare} className="p-4 sm:p-6 space-y-5">
              {/* Day A and Day B Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] items-center gap-3 sm:gap-4">
                {/* Day A Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Mốc Kiểm Tra A (Ngày thứ nhất)
                  </label>
                  <select
                    value={compareDayA}
                    onChange={(e) => setCompareDayA(e.target.value)}
                    className="w-full p-2.5 bg-surface-subtle border border-border-subtle rounded-xl text-xs sm:text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer min-h-[44px]"
                  >
                    {dailyTests.map((dt) => {
                      const passCount = dt.attempts.filter((a) => a.resultStatus === 'PASS').length;
                      const passRate = dt.attempts.length > 0 ? Math.round((passCount / dt.attempts.length) * 100) : 0;
                      const hasFail = dt.attempts.some((a) => a.resultStatus === 'FAIL');
                      const statusLabel = dt.attempts.length === 0 ? 'Chưa test' : hasFail ? `Có lỗi (${passRate}% Đạt)` : 'Đạt 100%';
                      return (
                        <option key={dt.id} value={dt.id}>
                          {dt.testDate} • {statusLabel} • {dt.attempts.length} lượt
                        </option>
                      );
                    })}
                  </select>

                  {/* Day A Preview Card */}
                  {(() => {
                    const sumA = getDaySummary(compareDayA);
                    if (!sumA) return null;
                    return (
                      <div className="p-3 bg-surface-subtle/70 rounded-xl border border-border-subtle space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-text-muted">Trạng thái:</span>
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                              sumA.allPass
                                ? 'bg-status-nominal/15 text-status-nominal'
                                : sumA.hasFail
                                ? 'bg-status-critical/15 text-status-critical'
                                : 'bg-surface-card text-text-muted'
                            }`}
                          >
                            {sumA.allPass ? 'ĐẠT 100%' : sumA.hasFail ? 'CÓ LỖI' : 'CHƯA TEST'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-text-secondary">
                          <span>Số lượt test:</span>
                          <span className="font-technical-data font-bold text-text-primary">
                            {sumA.total} lượt ({sumA.passRate}% Đạt)
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-text-muted">
                          <span>KTV gần nhất:</span>
                          <span className="font-medium text-text-primary">{sumA.latestTester}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Swap Button (center) */}
                <div className="flex sm:flex-col items-center justify-center pt-1 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      const temp = compareDayA;
                      setCompareDayA(compareDayB);
                      setCompareDayB(temp);
                    }}
                    className="w-10 h-10 rounded-full border border-border-subtle bg-surface-card hover:bg-primary hover:text-white text-text-secondary transition-all flex items-center justify-center shadow-xs"
                    title="Hoán đổi 2 ngày A và B"
                  >
                    <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
                  </button>
                </div>

                {/* Day B Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Mốc Kiểm Tra B (Ngày thứ hai)
                  </label>
                  <select
                    value={compareDayB}
                    onChange={(e) => setCompareDayB(e.target.value)}
                    className="w-full p-2.5 bg-surface-subtle border border-border-subtle rounded-xl text-xs sm:text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer min-h-[44px]"
                  >
                    {dailyTests.map((dt) => {
                      const passCount = dt.attempts.filter((a) => a.resultStatus === 'PASS').length;
                      const passRate = dt.attempts.length > 0 ? Math.round((passCount / dt.attempts.length) * 100) : 0;
                      const hasFail = dt.attempts.some((a) => a.resultStatus === 'FAIL');
                      const statusLabel = dt.attempts.length === 0 ? 'Chưa test' : hasFail ? `Có lỗi (${passRate}% Đạt)` : 'Đạt 100%';
                      return (
                        <option key={dt.id} value={dt.id}>
                          {dt.testDate} • {statusLabel} • {dt.attempts.length} lượt
                        </option>
                      );
                    })}
                  </select>

                  {/* Day B Preview Card */}
                  {(() => {
                    const sumB = getDaySummary(compareDayB);
                    if (!sumB) return null;
                    return (
                      <div className="p-3 bg-surface-subtle/70 rounded-xl border border-border-subtle space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-text-muted">Trạng thái:</span>
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                              sumB.allPass
                                ? 'bg-status-nominal/15 text-status-nominal'
                                : sumB.hasFail
                                ? 'bg-status-critical/15 text-status-critical'
                                : 'bg-surface-card text-text-muted'
                            }`}
                          >
                            {sumB.allPass ? 'ĐẠT 100%' : sumB.hasFail ? 'CÓ LỖI' : 'CHƯA TEST'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-text-secondary">
                          <span>Số lượt test:</span>
                          <span className="font-technical-data font-bold text-text-primary">
                            {sumB.total} lượt ({sumB.passRate}% Đạt)
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-text-muted">
                          <span>KTV gần nhất:</span>
                          <span className="font-medium text-text-primary">{sumB.latestTester}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Warning if same day selected */}
              {compareDayA && compareDayB && compareDayA === compareDayB && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center space-x-2 text-xs text-amber-700 dark:text-amber-300">
                  <span className="material-symbols-outlined text-[18px]">warning</span>
                  <span>Vui lòng chọn 2 ngày kiểm tra khác nhau để thực hiện so sánh đối chiếu.</span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-2 border-t border-border-subtle flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCompareModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm font-semibold text-text-secondary hover:text-text-primary bg-surface-subtle hover:bg-surface border border-border-subtle rounded-xl transition-colors min-h-[42px]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!compareDayA || !compareDayB || compareDayA === compareDayB}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-primary hover:bg-[#0369a1] rounded-xl shadow-xs disabled:opacity-50 transition-all inline-flex items-center justify-center gap-2 min-h-[42px]"
                >
                  <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
                  <span>So sánh ngay</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};