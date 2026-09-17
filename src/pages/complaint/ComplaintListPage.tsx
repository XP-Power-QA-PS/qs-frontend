import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  Plus,
  Search,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { complaintService } from '@/services/complaint/complaintService';
import { authService } from '@/services/auth';
import type { ComplaintSummary } from '@/types/complaint/complaint.types';
import { COMPLAINT_STAGE_META } from '@/types/complaint/complaint.types';
import { ComplaintCreateModal } from './ComplaintCreateModal';
import {
  TableContainer,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableEmptyRow,
} from '@/components/common/table';


export const ComplaintListPage: React.FC = () => {
  const userRoles = authService.getUserRoles();
  const isOperatorOnly = userRoles.includes('ROLE_OPERATOR') && !userRoles.some((r) => r !== 'ROLE_OPERATOR');
  if (isOperatorOnly) {
    return <Navigate to="/dashboard" replace />;
  }

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
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* Top Filter & Actions Toolbar */}
      <div className="bg-white border border-border-subtle p-4 rounded-2xl shadow-2xs flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        {/* Left: Filters & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Year Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-text-muted">Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="px-2.5 py-1.5 text-xs font-semibold bg-surface-canvas border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
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
              className="px-2.5 py-1.5 text-xs font-semibold bg-surface-canvas border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
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
            <label className="text-xs font-semibold text-text-muted">Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-semibold bg-surface-canvas border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="">All Statuses</option>
              {Object.entries(COMPLAINT_STAGE_META).map(([key, meta]) => (
                <option key={key} value={key}>
                  Phase {meta.stage}: {meta.title}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2 text-text-muted" />
            <input
              type="text"
              placeholder="Search tracking no, customer, model, defect..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface-canvas border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Right: Actions (Export Excel & New Complaint) */}
        <div className="flex items-center gap-2.5 shrink-0 self-end xl:self-auto">
          <button
            type="button"
            disabled={isExporting}
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
            title={`Export complaint report for ${selectedYear} using Customer Complaint template (sorted by Tracking No)`}
          >
            {isExporting ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5" />
            )}
            <span>Export Excel ({selectedYear})</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Complaint</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <TableContainer>
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Tracking No</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Defect</TableHead>
              <TableHead align="center">Qty (EA)</TableHead>
              <TableHead>Received Date</TableHead>
              <TableHead align="center">Ageing</TableHead>
              <TableHead>Status</TableHead>
              <TableHead align="right">Actions</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableEmptyRow colSpan={9}>
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent mr-2"></div>
                Loading complaint records...
              </TableEmptyRow>
            ) : filteredComplaints.length === 0 ? (
              <TableEmptyRow colSpan={9}>
                <div className="w-12 h-12 rounded-full bg-surface-subtle flex items-center justify-center mx-auto mb-2 text-text-muted">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                No complaints found for {selectedYear}. Click "New Complaint" to record an issue.
              </TableEmptyRow>
            ) : (
              filteredComplaints.map((c) => {
                const stageMeta = COMPLAINT_STAGE_META[c.status];
                return (
                  <TableRow
                    key={c.id}
                    onClick={() => navigate(`/complaints/${c.trackingNo || c.id}`, { state: { trackingNo: c.trackingNo } })}
                  >
                      <TableCell className="font-mono font-bold text-primary">
                        <span className="hover:underline flex items-center gap-1">
                          {c.trackingNo}
                        </span>
                        {c.capaNo && (
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                              {c.capaNo}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-text-primary">
                        {c.customerName}
                      </TableCell>
                      <TableCell className="text-text-secondary font-medium">
                        {c.model}
                      </TableCell>
                      <TableCell className="font-medium text-text-primary" title={c.issueDescription || c.defectName}>
                        <span className="font-semibold text-text-primary block">
                          {c.defectName || c.defectCategory || 'N/A'}
                        </span>
                        {c.defectCategory && c.defectName && (
                          <span className="text-[10px] text-text-muted block">
                            {c.defectCategory}
                          </span>
                        )}
                      </TableCell>
                      <TableCell align="center" className="font-bold text-text-primary">
                        {c.quantity || 1}
                      </TableCell>
                      <TableCell className="text-text-muted">
                        {c.receivedDate}
                      </TableCell>
                      <TableCell align="center">
                        {c.status === 'CLOSED' ? (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {c.ageingClosed != null ? `${c.ageingClosed}d (Closed)` : 'Closed'}
                          </span>
                        ) : (
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                            (c.ageingOpen ?? 0) > 14
                              ? 'text-rose-700 bg-rose-50 font-bold'
                              : (c.ageingOpen ?? 0) > 7
                              ? 'text-amber-700 bg-amber-50'
                              : 'text-blue-700 bg-blue-50'
                          }`}>
                            {c.ageingOpen != null ? `${c.ageingOpen}d (Open)` : '-'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${stageMeta.badgeClass}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {stageMeta.title}
                        </span>
                      </TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {c.status === 'RECEIVED' ? (
                            <button
                              onClick={() => navigate(`/meeting-invite?complaintId=${c.id}`, { state: { complaint: c } })}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary hover:bg-primary-hover text-white rounded-lg text-[11px] font-semibold shadow-2xs transition-all cursor-pointer"
                              title="Schedule CFT review meeting"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              Schedule Meeting
                            </button>
                          ) : c.status !== 'CLOSED' ? (
                            <button
                              onClick={() => navigate(`/complaints/${c.trackingNo || c.id}?tab=action`, { state: { trackingNo: c.trackingNo } })}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-canvas hover:bg-surface-subtle text-text-primary border border-border-subtle rounded-lg text-[11px] font-semibold shadow-2xs transition-all cursor-pointer"
                              title="Update CAPA actions"
                            >
                              Action Board
                            </button>
                          ) : (
                            <button
                              onClick={() => navigate(`/complaints/${c.trackingNo || c.id}`, { state: { trackingNo: c.trackingNo } })}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-canvas hover:bg-surface-subtle text-text-muted hover:text-text-primary border border-border-subtle rounded-lg text-[11px] font-medium transition-all cursor-pointer"
                            >
                              Details
                            </button>
                          )}
                          <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors ml-1" />
                        </div>
                      </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

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