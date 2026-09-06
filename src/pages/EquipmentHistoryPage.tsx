import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { equipmentService } from '../services/equipmentService';
import type { EquipmentTestRecord } from '../types/equipment.types';
import toast from 'react-hot-toast';

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
    <div className="w-full max-w-[88rem] mx-auto py-space-xl px-margin-mobile md:px-margin-tablet lg:px-margin-desktop font-body-md">
      
      {/* Header Section */}
      <div className="mb-space-xl flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-subtle pb-space-lg">
        <div>
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20 text-primary">
              <span className="material-symbols-outlined text-[24px]">precision_manufacturing</span>
            </div>
            <h1 className="font-headline-xl text-text-primary tracking-tight">Test History</h1>
          </div>
          <div className="flex items-center space-x-3">
            <span className="font-headline-md text-text-primary">{equipmentName}</span>
            <span className="px-2.5 py-1 bg-primary/10 text-primary font-technical-data text-[12px] rounded-md border border-primary/20">
              {equipmentCode}
            </span>
          </div>
        </div>
        
        {/* Action Button */}
        <div>
          <button
            onClick={handleCreateTest}
            disabled={creating || hasCurrentMonthTest}
            className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg font-headline-sm text-[14px] transition-all duration-200 ${
              hasCurrentMonthTest 
                ? 'bg-surface-subtle text-text-muted border border-border-subtle cursor-not-allowed shadow-none' 
                : 'bg-primary hover:bg-[#0369a1] text-white shadow-sm hover:shadow-md'
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

      {/* Main Content Area */}
      <div className="bg-surface-card rounded-xl shadow-sm border border-border-subtle overflow-hidden">
        <div className="p-space-lg border-b border-border-subtle bg-surface-subtle/50 flex items-center space-x-2">
          <span className="material-symbols-outlined text-text-secondary text-[20px]">calendar_month</span>
          <h2 className="font-headline-sm text-text-primary">Monthly Test Records</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="material-symbols-outlined text-primary text-[32px] animate-spin">progress_activity</span>
          </div>
        ) : historyRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-subtle border-b border-border-subtle">
                <tr>
                  <th className="px-space-lg py-3 font-label-md text-text-muted uppercase tracking-wider w-[40%]">Period</th>
                  <th className="px-space-lg py-3 font-label-md text-text-muted uppercase tracking-wider w-[40%]">Created At</th>
                  <th className="px-space-lg py-3 font-label-md text-text-muted uppercase tracking-wider text-right w-[20%]">Action</th>
                </tr>
              </thead>
              <tbody>
                {historyRecords.map((record) => (
                  <tr 
                    key={record.id} 
                    onClick={() => handleRowClick(record)}
                    className="group border-b border-border-subtle hover:bg-surface-subtle transition-colors cursor-pointer last:border-0"
                  >
                    <td className="px-space-lg py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-surface border border-border-subtle flex items-center justify-center text-text-secondary group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                          <span className="material-symbols-outlined text-[20px]">assignment</span>
                        </div>
                        <div>
                          <div className="font-headline-sm text-text-primary">Month {record.testMonth}</div>
                          <div className="font-body-sm text-text-secondary mt-0.5">Year {record.testYear}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-space-lg py-4 font-body-md text-text-secondary">
                      {new Date(record.testedAt).toLocaleString()}
                    </td>
                    <td className="px-space-lg py-4 text-right">
                       <span className="material-symbols-outlined text-border-strong group-hover:text-primary transition-colors text-[24px]">
                         arrow_forward
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-20 h-20 bg-surface-subtle rounded-full flex items-center justify-center mb-4">
               <span className="material-symbols-outlined text-[40px] text-border-strong">history_edu</span>
            </div>
            <h3 className="font-headline-sm text-text-primary mb-2">No Test Records Found</h3>
            <p className="font-body-sm text-text-secondary max-w-md mx-auto mb-6">
              This equipment doesn't have any test records yet. Create a new test month to begin logging data.
            </p>
            <button
              onClick={handleCreateTest}
              disabled={creating}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-lg font-headline-sm text-[14px] bg-primary hover:bg-[#0369a1] text-white shadow-sm hover:shadow-md transition-all duration-200"
            >
              {creating ? (
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
              )}
              <span>Create First Record</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
