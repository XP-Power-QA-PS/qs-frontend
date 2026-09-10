import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MonitorCheck,
  Loader2,
  Search,
  ChevronRight,
  Shield,
  ArrowRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { equipmentService } from '@/services/equipment';
import { authService } from '@/services/auth';
import type { Floor } from '@/types/equipment';
import toast from 'react-hot-toast';

// ─── Types & Configuration ───────────────────────────────────────────────────

export type SectionAccent = 'violet' | 'primary' | 'emerald' | 'amber' | 'rose' | 'cyan';

export interface DashboardModuleItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  path: string;
  badge?: string;
}

export interface DashboardSectionConfig {
  id: string;
  title: string;
  accent: SectionAccent;
  items: DashboardModuleItem[];
}

const ACCENT_STYLES: Record<SectionAccent, {
  pill: string;
  gradient: string;
  iconBox: string;
  iconColor: string;
  hoverText: string;
  hoverBorder: string;
  hoverBg: string;
  chevronHover: string;
}> = {
  violet: {
    pill: 'bg-violet-600',
    gradient: 'from-violet-600 to-purple-400',
    iconBox: 'bg-violet-50 border-violet-100 group-hover:bg-violet-100',
    iconColor: 'text-violet-600 group-hover:text-violet-700',
    hoverText: 'group-hover:text-violet-600',
    hoverBorder: 'hover:border-violet-400',
    hoverBg: 'group-hover:bg-violet-50',
    chevronHover: 'group-hover:text-violet-600',
  },
  primary: {
    pill: 'bg-primary',
    gradient: 'from-primary to-primary-fixed-dim',
    iconBox: 'bg-surface-subtle border-border-subtle group-hover:bg-primary/10',
    iconColor: 'text-text-secondary group-hover:text-primary',
    hoverText: 'group-hover:text-primary',
    hoverBorder: 'hover:border-primary',
    hoverBg: 'group-hover:bg-primary/10',
    chevronHover: 'group-hover:text-primary',
  },
  emerald: {
    pill: 'bg-emerald-600',
    gradient: 'from-emerald-600 to-teal-400',
    iconBox: 'bg-emerald-50 border-emerald-100 group-hover:bg-emerald-100',
    iconColor: 'text-emerald-600 group-hover:text-emerald-700',
    hoverText: 'group-hover:text-emerald-600',
    hoverBorder: 'hover:border-emerald-400',
    hoverBg: 'group-hover:bg-emerald-50',
    chevronHover: 'group-hover:text-emerald-600',
  },
  amber: {
    pill: 'bg-amber-600',
    gradient: 'from-amber-600 to-yellow-400',
    iconBox: 'bg-amber-50 border-amber-100 group-hover:bg-amber-100',
    iconColor: 'text-amber-600 group-hover:text-amber-700',
    hoverText: 'group-hover:text-amber-600',
    hoverBorder: 'hover:border-amber-400',
    hoverBg: 'group-hover:bg-amber-50',
    chevronHover: 'group-hover:text-amber-600',
  },
  rose: {
    pill: 'bg-rose-600',
    gradient: 'from-rose-600 to-pink-400',
    iconBox: 'bg-rose-50 border-rose-100 group-hover:bg-rose-100',
    iconColor: 'text-rose-600 group-hover:text-rose-700',
    hoverText: 'group-hover:text-rose-600',
    hoverBorder: 'hover:border-rose-400',
    hoverBg: 'group-hover:bg-rose-50',
    chevronHover: 'group-hover:text-rose-600',
  },
  cyan: {
    pill: 'bg-cyan-600',
    gradient: 'from-cyan-600 to-sky-400',
    iconBox: 'bg-cyan-50 border-cyan-100 group-hover:bg-cyan-100',
    iconColor: 'text-cyan-600 group-hover:text-cyan-700',
    hoverText: 'group-hover:text-cyan-600',
    hoverBorder: 'hover:border-cyan-400',
    hoverBg: 'group-hover:bg-cyan-50',
    chevronHover: 'group-hover:text-cyan-600',
  },
};

// ─── Module Card Component ────────────────────────────────────────────────────

interface ModuleCardProps {
  item: DashboardModuleItem;
  accent: SectionAccent;
  onSelect: (path: string) => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ item, accent, onSelect }) => {
  const styles = ACCENT_STYLES[accent] || ACCENT_STYLES.primary;
  const Icon = item.icon;

  return (
    <div
      onClick={() => onSelect(item.path)}
      className={`group relative flex flex-col p-4 sm:p-space-lg bg-surface-card rounded-xl border border-border-subtle shadow-xs hover:shadow-md ${styles.hoverBorder} active:scale-[0.99] transition-all duration-200 cursor-pointer overflow-hidden min-h-[96px]`}
    >
      {/* Top indicator line */}
      <div
        className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${styles.gradient} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}
      />

      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center transition-colors shrink-0 ${styles.iconBox}`}
        >
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${styles.iconColor}`} />
        </div>

        <div
          className={`w-8 h-8 rounded-full bg-surface-subtle sm:bg-transparent flex items-center justify-center ${styles.hoverBg} transition-colors`}
        >
          <ChevronRight
            className={`w-5 h-5 text-text-muted sm:text-text-muted/60 ${styles.chevronHover} group-hover:translate-x-0.5 transition-all`}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <h3 className={`text-base sm:text-lg font-bold text-text-primary ${styles.hoverText} transition-colors`}>
          {item.title}
        </h3>
        {item.badge && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-surface-subtle text-text-muted border border-border-subtle">
            {item.badge}
          </span>
        )}
      </div>

      <p className="text-xs sm:text-sm text-text-secondary line-clamp-2">
        {item.description}
      </p>
    </div>
  );
};

// ─── User / Operations Dashboard Page ─────────────────────────────────────────

export const UserDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const isAdmin = authService.getUserRole() === 'ROLE_ADMIN';
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchFloors = async () => {
      try {
        const data = await equipmentService.getAllFloors();
        setFloors(data);
      } catch (error: any) {
        toast.error('Failed to load floors');
      } finally {
        setLoading(false);
      }
    };
    fetchFloors();
  }, []);

  // ─── Functional Sections Registry ──────────────────────────────────────────
  // Mỗi khi muốn thêm phân hệ mới (Bảo trì, Hiệu chuẩn, Kho...), chỉ cần thêm 1 object vào đây!
  const sections: DashboardSectionConfig[] = useMemo(() => [
    {
      id: 'gonogo-testing',
      title: 'GO/NOGO',
      accent: 'primary',
      items: floors.map((floor) => ({
        id: `floor-${floor.id}`,
        title: `Check ${floor.name}`,
        description: `Equipment test flow for ${floor.name}`,
        icon: MonitorCheck,
        path: `/equipments?floorId=${floor.id}&floorName=${encodeURIComponent(floor.name)}`,
      })),
    },
    // 🚀 THÊM SECTION MỚI TẠI ĐÂY:
    // {
    //   id: 'maintenance',
    //   title: 'Maintenance',
    //   accent: 'emerald',
    //   items: [...],
    // },
  ], [floors]);

  // Lọc theo từ khóa tìm kiếm
  const query = searchQuery.trim().toLowerCase();
  const filteredSections = useMemo(() => {
    if (!query) return sections;

    return sections
      .map((section) => {
        const sectionTitleMatches = section.title.toLowerCase().includes(query);
        const filteredItems = section.items.filter((item) =>
          sectionTitleMatches ||
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
        );
        return {
          ...section,
          items: filteredItems,
        };
      })
      .filter((section) => section.items.length > 0);
  }, [sections, query]);

  const totalVisibleItems = filteredSections.reduce((sum, sec) => sum + sec.items.length, 0);

  return (
    <div className="w-full font-body-md">
      <div className="w-full pt-0.5 sm:pt-1 pb-6 sm:pb-space-xl">

        {/* Header Section */}
        <div className="mb-4 sm:mb-5 border-b border-border-subtle pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 sm:p-2.5 bg-primary/10 rounded-xl border border-primary/20 text-primary shrink-0">
                <MonitorCheck className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-headline-xl text-text-primary tracking-tight">
                  Operations Portal
                </h1>
                <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                  Operational modules, statistics and equipment testing workflows.
                </p>
              </div>
            </div>

            {/* 🛡️ Switcher Button - CHỈ hiển thị với Admin */}
            {isAdmin && (
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-surface-card hover:bg-surface-subtle text-text-primary hover:text-primary border border-border-subtle hover:border-primary/40 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs transition-all duration-200 cursor-pointer shrink-0 self-start sm:self-auto"
                title="Switch to Administration Dashboard"
              >
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Admin Dashboard</span>
                <ArrowRight className="w-4 h-4 text-text-muted" />
              </button>
            )}
          </div>

          {/* Quick Search */}
          <div className="mt-4 max-w-md relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Quick search floor or module..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-card border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : totalVisibleItems === 0 ? (
          <div className="p-10 text-center bg-surface-card rounded-xl border border-border-subtle shadow-xs">
            <p className="text-sm font-medium text-text-secondary">
              No matching modules or floors found for &ldquo;{searchQuery}&rdquo;.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredSections.map((section) => {
              const styles = ACCENT_STYLES[section.accent] || ACCENT_STYLES.primary;
              return (
                <section key={section.id}>
                  {/* Section Title & Badge */}
                  <div className="flex items-center justify-between mb-4 sm:mb-space-lg">
                    <h2 className="text-base sm:text-lg font-bold text-text-primary flex items-center space-x-2">
                      <span className={`w-1.5 h-5 sm:h-6 ${styles.pill} rounded-full`} />
                      <span>{section.title}</span>
                      <span className="text-xs font-semibold text-text-muted bg-surface-subtle px-2 py-0.5 rounded-full border border-border-subtle">
                        {section.items.length}
                      </span>
                    </h2>
                  </div>

                  {/* Section Grid Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-space-base">
                    {section.items.map((item) => (
                      <ModuleCard
                        key={item.id}
                        item={item}
                        accent={section.accent}
                        onSelect={(path) => navigate(path)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboardPage;
