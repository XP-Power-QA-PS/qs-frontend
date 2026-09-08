import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { equipmentService } from '@/services/equipment';
import type { DayComparisonDTO } from '@/types/equipment';
import {
  ComparisonHeader,
  ComparisonInsightsBanner,
  ComparisonDayCard,
} from '@/components/features/gonogo';
import toast from 'react-hot-toast';

export const EquipmentDayComparisonPage: React.FC = () => {
  const { equipmentId, recordId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const equipmentCode = searchParams.get('code') || '';
  const equipmentName = searchParams.get('name') || '';
  const month = searchParams.get('month') || '';
  const year = searchParams.get('year') || '';
  const dayIdsParam = searchParams.get('dayIds') || '';

  const [comparisonData, setComparisonData] = useState<DayComparisonDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const backUrl = `/equipments/${equipmentId}/records/${recordId}/daily?code=${encodeURIComponent(
    equipmentCode
  )}&name=${encodeURIComponent(equipmentName)}&month=${month}&year=${year}`;

  useEffect(() => {
    const fetchComparison = async () => {
      if (!recordId) {
        setError('Inspection period information (recordId) not found.');
        setLoading(false);
        return;
      }

      const dayIds = dayIdsParam
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id.length > 0);

      if (dayIds.length !== 2) {
        setError('Please select exactly 2 test days to compare.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await equipmentService.compareDays(recordId, dayIds);
        setComparisonData(data);
      } catch (err: any) {
        setError(err.message || 'Unable to load comparison data between the 2 days.');
        toast.error('Error loading comparison data');
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [recordId, dayIdsParam]);

  const comparisonRangeLabel =
    comparisonData && comparisonData.days.length === 2
      ? `${comparisonData.days[0].testDate} vs ${comparisonData.days[1].testDate}`
      : undefined;

  return (
    <div className="w-full pt-0.5 sm:pt-1 pb-6 sm:pb-8 font-body-md space-y-5 animate-in fade-in duration-200">
      {/* Navigation & Header */}
      <ComparisonHeader
        backUrl={backUrl}
        equipmentName={equipmentName}
        equipmentCode={equipmentCode}
        month={month}
        year={year}
        comparisonRangeLabel={comparisonRangeLabel}
      />

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <span className="material-symbols-outlined text-primary text-[36px] animate-spin">
            progress_activity
          </span>
          <p className="text-sm font-medium text-text-secondary">
            Loading and analyzing comparison data...
          </p>
        </div>
      )}

      {/* Error / Invalid State */}
      {!loading && error && (
        <div className="p-6 bg-surface-card rounded-2xl border border-status-critical/30 shadow-xs max-w-xl mx-auto text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-status-critical/10 text-status-critical flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[28px]">error</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary mb-1">Unable to display comparison</h3>
            <p className="text-xs sm:text-sm text-text-muted">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(backUrl)}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-primary hover:bg-[#0369a1] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Back to Date Selection
          </button>
        </div>
      )}

      {/* Main Comparison Content */}
      {!loading && !error && comparisonData && (
        <div className="space-y-6">
          {/* Top Insights & AI Summary Banner */}
          {comparisonData.insights && (
            <ComparisonInsightsBanner insights={comparisonData.insights} />
          )}

          {/* Side-by-Side 2-Column Comparison Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {comparisonData.days.map((day, dIdx) => (
              <ComparisonDayCard
                key={day.dailyTestId || dIdx}
                day={day}
                dayLabel={`Day ${dIdx === 0 ? 'A' : 'B'}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
