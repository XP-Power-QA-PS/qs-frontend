import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { equipmentService } from '@/services/equipment';
import type { EquipmentTestRecord } from '@/types/equipment';
import toast from 'react-hot-toast';
import { useViewMode } from '@/context/ViewModeContext';
import { ViewModeToggle } from '@/components/common/ViewModeToggle';

export const EquipmentHistoryPage: React.FC = () => {
  const { equipmentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const equipmentCode = searchParams.get('code') || 'Unknown Code';
  const equipmentName = searchParams.get('name') || 'Unknown Name';
  const floorId = searchParams.get('floorId');
  const floorName = searchParams.get('floorName');

  const [historyRecords, setHistoryRecords] = useState<EquipmentTestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Synchronized global viewMode
  const { viewMode } = useViewMode();

  useEffect(() => {
    if (equipmentId) {
      fetchHistory(equipmentId);
    }
  }, [equipmentId]);

  const fetchHistory = async (id: string) => {
    try {
      const data = await equipmentService.getTestHistory(id);
      setHistoryRecords(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load test history');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = async () => {
    if (!equipmentId) return;
    setCreating(true);
    try {
      await equipmentService.performTest({ equipmentId });
      toast.success('Created new test month successfully!');
      fetchHistory(equipmentId);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create test month');
    } finally {
      setCreating(false);
    }
  };

  const handleRowClick = (record: EquipmentTestRecord) => {
    navigate('/equipments/' + equipmentId + '/records/' + record.id + '/daily?code=' + encodeURIComponent(equipmentCode) + '&name=' + encodeURIComponent(equipmentName) + '&month=' + record.testMonth + '&year=' + record.testYear + (floorId ? '&floorId=' + floorId : '') + (floorName ? '&floorName=' + encodeURIComponent(floorName) : ''));
  };

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const hasCurrentMonthTest = historyRecords.some(r => r.testMonth === currentMonth && r.testYear === currentYear);

  return (
    <div className="w-full pt-0.5 sm:pt-1 pb-6 sm:pb-space-xl font-body-md">

      {/* Header Section */}
      <div className="mb-3 sm:mb-4 flex flex-col gap-3 border-b border-border-subtle pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 text-primary shrink-0">
                <span className="material-symbols-outlined text-[24px]">precision_manufacturing</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-headline-xl text-text-primary tracking-tight">
                Test History
              </h1>
            </div>
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
              <span className="font-headline-sm text-base sm:text-lg font-bold text-text-primary">{equipmentName}</span>
              <span className="px-2.5 py-1 bg-primary/10 text-primary font-technical-data font-semibold text-[12px] rounded-lg border border-primary/20">
                {equipmentCode}
              </span>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {/* View Analytics */}
            <button
              onClick={() =>
                navigate(`/stats/equipment/${equipmentId}?code=${encodeURIComponent(equipmentCode)}&name=${encodeURIComponent(equipmentName)}`)
              }
              className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-headline-sm text-[14px] border border-primary text-primary hover:bg-primary/5 transition-all duration-200 min-h-[44px] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">bar_chart</span>
              <span>View Analytics</span>
            </button>

            {/* Create Test Month */}
            <button
              onClick={handleCreateTest}
              disabled={creating || hasCurrentMonthTest}
              className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-headline-sm text-[14px] transition-all duration-200 min-h-[44px] ${hasCurrentMonthTest
                  ? 'bg-surface-subtle text-text-muted border border-border-subtle cursor-not-allowed shadow-none'
                  : 'bg-primary hover:bg-[#0369a1] active:bg-[#024a73] text-white shadow-xs hover:shadow-md'
                }`}
            >
              {creating ? (
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">
                  {hasCurrentMonthTest ? 'check_circle' : 'add_circle'}
                </span>
              )}
              <span>{hasCurrentMonthTest ? 'Current Month Active' : 'Create Test Month'}</span>
            </button>
          </div>
        </div>

        {/* View Mode Bar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2 text-text-secondary">
            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            <span className="font-headline-sm text-sm sm:text-base font-semibold text-text-primary">
              Monthly Test Records ({historyRecords.length})
            </span>
          </div>

          {/* Synchronized View Mode Switcher */}
          <ViewModeToggle />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-surface-card rounded-xl shadow-xs border border-border-subtle overflow-hidden flex justify-center items-center py-20">
          <span className="material-symbols-outlined text-primary text-[32px] animate-spin">progress_activity</span>
        </div>
      ) : historyRecords.length === 0 ? (
        <div className="bg-surface-card rounded-xl shadow-xs border border-border-subtle overflow-hidden flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-16 h-16 bg-surface-subtle rounded-full flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[36px] text-border-strong">history_edu</span>
          </div>
          <h3 className="font-headline-sm text-text-primary mb-1">No Test Records Found</h3>
          <p className="font-body-sm text-text-secondary max-w-md mx-auto mb-6">
            This equipment doesn't have any test records yet. Create a new test month to begin logging data.
          </p>
          <button
            onClick={handleCreateTest}
            disabled={creating}
            className="flex items-center space-x-2 px-5 py-3 rounded-xl font-headline-sm text-[14px] bg-primary hover:bg-[#0369a1] text-white shadow-xs hover:shadow-md transition-all duration-200 min-h-[46px]"
          >
            {creating ? (
              <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
            )}
            <span>Create First Record</span>
          </button>
        </div>
      ) : viewMode === 'card' ? (
        /* Cards View Mode - Standalone cards directly on the background */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {historyRecords.map((record) => {
            const isCurrent = record.testMonth === currentMonth && record.testYear === currentYear;
            return (
              <div
                key={record.id}
                onClick={() => handleRowClick(record)}
                className={`group p-4 rounded-xl border transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md active:scale-[0.99] flex flex-col justify-between ${isCurrent
                    ? 'bg-primary/5 border-primary/30 hover:border-primary'
                    : 'bg-surface-card border-border-subtle hover:border-primary'
                  }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-10 h-10 rounded-lg bg-surface border border-border-subtle flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-[20px]">assignment</span>
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-text-primary group-hover:text-primary transition-colors">
                          Month {record.testMonth} / {record.testYear}
                        </h3>
                        <span className="text-[11px] font-technical-data text-text-muted">
                          {new Date(record.testedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {isCurrent && (
                      <span className="px-2 py-0.5 bg-status-nominal/15 text-status-nominal font-semibold text-[11px] rounded-full border border-status-nominal/30">
                        Active
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-border-subtle/80 flex items-center justify-between text-primary font-medium text-sm">
                  <span>Daily Inspection Tests</span>
                  <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View Mode */
        <div className="bg-surface-card rounded-xl shadow-xs border border-border-subtle overflow-hidden max-w-full w-full">
          <div className="overflow-x-auto max-w-full w-full">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead className="bg-surface-subtle border-b border-border-subtle">
                <tr>
                  <th className="px-4 sm:px-space-lg py-3 font-label-md text-text-muted uppercase tracking-wider w-[40%] text-xs">Period</th>
                  <th className="px-4 sm:px-space-lg py-3 font-label-md text-text-muted uppercase tracking-wider w-[40%] text-xs">Created At</th>
                  <th className="px-4 sm:px-space-lg py-3 font-label-md text-text-muted uppercase tracking-wider text-right w-[20%] text-xs">Action</th>
                </tr>
              </thead>
              <tbody>
                {historyRecords.map((record) => (
                  <tr
                    key={record.id}
                    onClick={() => handleRowClick(record)}
                    className="group border-b border-border-subtle hover:bg-surface-subtle transition-colors cursor-pointer last:border-0"
                  >
                    <td className="px-4 sm:px-space-lg py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-surface border border-border-subtle flex items-center justify-center text-text-secondary group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                          <span className="material-symbols-outlined text-[20px]">assignment</span>
                        </div>
                        <div>
                          <div className="font-headline-sm font-semibold text-text-primary">Month {record.testMonth}</div>
                          <div className="font-body-sm text-text-secondary text-xs mt-0.5">Year {record.testYear}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-space-lg py-4 font-body-md text-text-secondary text-sm">
                      {new Date(record.testedAt).toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-space-lg py-4 text-right">
                      <span className="material-symbols-outlined text-border-strong group-hover:text-primary transition-colors text-[24px]">
                        arrow_forward
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};