import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  Clock,
  Plus,
  Search,
  CheckCircle2,
  ChevronRight,
  Layers,
  CheckSquare,
  FileSpreadsheet,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { complaintService } from '@/services/complaint/complaintService';
import type { ComplaintSummary } from '@/types/complaint/complaint.types';
import { COMPLAINT_STAGE_META } from '@/types/complaint/complaint.types';
import { computeSlaStatus } from '@/utils/slaUtils';
import { ComplaintCreateModal } from './ComplaintCreateModal';

export const ComplaintListPage: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const [complaints, setComplaints] = useState<ComplaintSummary[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([currentYear]);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const data = await complaintService.getComplaints({
        year: selectedYear,
        month: selectedMonth || undefined,
        status: selectedStatus || undefined,
        size: 100,
      });
      setComplaints(data.content || []);
    } catch (err) {
      console.error('Failed to load complaints', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchYears = async () => {
    try {
      const years = await complaintService.getAvailableYears();
      if (years && years.length > 0) {
        setAvailableYears(years.includes(currentYear) ? years : [currentYear, ...years]);
      }
    } catch (err) {
      console.error('Failed to load years', err);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [selectedYear, selectedMonth, selectedStatus]);

  // Client search filter
  const filteredComplaints = complaints.filter((c) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.trackingNo.toLowerCase().includes(query) ||
      c.customerName.toLowerCase().includes(query) ||
      c.model.toLowerCase().includes(query) ||
      (c.defectName && c.defectName.toLowerCase().includes(query)) ||
      c.issueDescription.toLowerCase().includes(query)
    );
  });

  // KPI Metrics
  const totalCount = complaints.length;
  const waitingMeetingCount = complaints.filter((c) => c.status === 'RECEIVED').length;
  const inProgressCount = complaints.filter(
    (c) => c.status !== 'CLOSED' && c.status !== 'RECEIVED'
  ).length;
  const closedCount = complaints.filter((c) => c.status === 'CLOSED').length;

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      await complaintService.exportComplaintsExcel(selectedYear);
      toast.success(`Successfully exported complaint records for ${selectedYear}!`);
    } catch (err: any) {
      console.error('Export failed', err);
      toast.error('Failed to export Excel report: ' + (err.message || 'Unknown error'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border border-border-subtle p-6 rounded-2xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            Quality System • Issue & CAPA Tracking
          </div>
          <h1 className="text-xl font-bold text-text-primary">
            Customer Complaint Management (CAPA)
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Standardized 8D CAPA tracking, Jeanette 7-step SLA monitoring, and CFT review meeting management.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={isExporting}
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
            title={`Export complaint report for ${selectedYear} using Customer Complaint template (sorted by Tracking No)`}
          >
            {isExporting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4" />
            )}
            <span>Export Excel ({selectedYear})</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-container text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Complaint Intake
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-border-subtle p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Total Complaints ({selectedYear})</span>
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
              #
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-text-primary">{totalCount}</div>
          <p className="text-[11px] text-text-muted mt-0.5">Sequential tracking ({selectedYear}-MM-ZZZZ)</p>
        </div>

        <div className="bg-white border border-amber-200/70 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">Awaiting Preliminary Review</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600">{waitingMeetingCount}</div>
          <p className="text-[11px] text-amber-700 mt-0.5">SLA: Convene CFT within 1 business day</p>
        </div>

        <div className="bg-white border border-sky-200/70 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-800">In Progress (RC / CAPA)</span>
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-600">{inProgressCount}</div>
          <p className="text-[11px] text-sky-700 mt-0.5">Containment & 5-Why root cause analysis</p>
        </div>

        <div className="bg-white border border-emerald-200/70 p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">Completed (Closed)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">{closedCount}</div>
          <p className="text-[11px] text-emerald-700 mt-0.5">Effectiveness verified & case archived</p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white border border-border-subtle p-4 rounded-xl shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Year Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-text-muted">Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="px-2.5 py-1.5 text-xs font-semibold bg-surface-canvas border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Year {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-text-muted">Month:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-semibold bg-surface-canvas border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Months</option>
              {Array.from({ length: 12 }, (_, i) => {
                const m = String(i + 1).padStart(2, '0');
                return (
                  <option key={m} value={m}>
                    Month {m}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-text-muted">Stage:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-semibold bg-surface-canvas border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Stages</option>
              {Object.entries(COMPLAINT_STAGE_META).map(([key, meta]) => (
                <option key={key} value={key}>
                  Phase {meta.stage}: {meta.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search tracking no, customer, model, defect..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface-canvas border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-border-subtle rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-canvas border-b border-border-subtle text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                <th className="py-3 px-4">Tracking No</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Model</th>
                <th className="py-3 px-4">Defect & Description</th>
                <th className="py-3 px-4 text-center">Qty (EA)</th>
                <th className="py-3 px-4">Received Date</th>
                <th className="py-3 px-4 text-center">Ageing</th>
                <th className="py-3 px-4">Jeanette SLA Progress</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-text-muted">
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent mr-2"></div>
                    Loading complaint records...
                  </td>
                </tr>
              ) : filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-text-muted">
                    <div className="w-12 h-12 rounded-full bg-surface-subtle flex items-center justify-center mx-auto mb-2 text-text-muted">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    No complaints found for {selectedYear}. Click "+ New Complaint Intake" to record an issue.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => {
                  const stageMeta = COMPLAINT_STAGE_META[c.status];
                  const slaInfo = computeSlaStatus(c);
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-surface-canvas/80 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/complaints/${c.id}`)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-primary">
                        <span className="hover:underline flex items-center gap-1">
                          {c.trackingNo}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-text-primary">
                        {c.customerName}
                      </td>
                      <td className="py-3.5 px-4 text-text-secondary font-medium">
                        {c.model}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-text-secondary" title={c.issueDescription}>
                        <span className="font-semibold text-text-primary mr-1">
                          {c.defectName || c.defectCategory || 'Defect'}:
                        </span>
                        {c.issueDescription}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-text-primary">
                        {c.quantity || 1}
                      </td>
                      <td className="py-3.5 px-4 text-text-muted">
                        {c.receivedDate}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {c.status === 'CLOSED' ? (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {c.ageingClosed != null ? `${c.ageingClosed}d (Closed)` : 'Closed'}
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                            {c.ageingOpen != null ? `${c.ageingOpen}d (Open)` : '-'}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${stageMeta.badgeClass}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            Phase {stageMeta.stage}: {stageMeta.title}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] border ${slaInfo.badgeClass}`}
                            title={slaInfo.message}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${slaInfo.dotClass}`}></span>
                            {slaInfo.statusText}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {c.status === 'RECEIVED' && (
                            <button
                              onClick={() => navigate(`/meeting-invite?complaintId=${c.id}`, { state: { complaint: c } })}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-semibold shadow-2xs transition-all"
                              title="Schedule Preliminary Review (SLA: 1 business day)"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              Schedule
                            </button>
                          )}
                          {c.status === 'MEETING_SCHEDULED' && (
                            <button
                              onClick={() => navigate(`/complaints/${c.id}?tab=meetings`)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-semibold shadow-2xs transition-all"
                              title="View meetings & record minutes / conclusions"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              Minutes
                            </button>
                          )}
                          {c.status === 'CONTAINMENT_COMMITTED' && (
                            <button
                              onClick={() => navigate(`/complaints/${c.id}?tab=action`)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-semibold shadow-2xs transition-all"
                              title="5-Why Root Cause Analysis (SLA: 5 business days)"
                            >
                              <Search className="w-3.5 h-3.5" />
                              Root Cause
                            </button>
                          )}
                          {c.status === 'ROOT_CAUSE_ANALYZED' && (
                            <button
                              onClick={() => navigate(`/complaints/${c.id}?tab=action`)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-semibold shadow-2xs transition-all"
                              title="Formulate CAPA actions (SLA: 10 business days)"
                            >
                              <CheckSquare className="w-3.5 h-3.5" />
                              CAPA Plan
                            </button>
                          )}
                          {(c.status === 'CAPA_COMMITTED' || c.status === 'EFFECTIVENESS_VERIFYING') && (
                            <button
                              onClick={() => navigate(`/complaints/${c.id}?tab=action`)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[11px] font-semibold shadow-2xs transition-all"
                              title="Verify effectiveness & finalize closure"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Verify
                            </button>
                          )}
                          <Link
                            to={`/complaints/${c.id}`}
                            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors"
                            title="View Details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Intake Modal */}
      <ComplaintCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchComplaints();
        }}
      />
    </div>
  );
};
