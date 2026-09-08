import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { equipmentService } from '@/services/equipment';
import type { Equipment } from '@/types/equipment';
import toast from 'react-hot-toast';
import { useViewMode } from '@/context/ViewModeContext';
import { ViewModeToggle } from '@/components/common/ViewModeToggle';

export const EquipmentListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const floorIdParam = searchParams.get('floorId');
  const floorNameParam = searchParams.get('floorName') || 'Equipment';

  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loadingEquipments, setLoadingEquipments] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Synchronized global viewMode
  const { viewMode } = useViewMode();

  useEffect(() => {
    if (!floorIdParam) {
      toast.error('Floor information not found');
      navigate('/dashboard');
      return;
    }
    fetchEquipments(floorIdParam);
  }, [floorIdParam, navigate]);

  const fetchEquipments = async (floorId: string) => {
    setLoadingEquipments(true);
    try {
      const data = await equipmentService.getEquipmentsByFloor(floorId);
      setEquipments(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load equipments');
    } finally {
      setLoadingEquipments(false);
    }
  };

  const openHistoryPage = (equipment: Equipment) => {
    navigate(`/equipments/${equipment.id}/history?code=${encodeURIComponent(equipment.equipmentCode)}&name=${encodeURIComponent(equipment.equipmentName)}&floorId=${floorIdParam}&floorName=${encodeURIComponent(floorNameParam)}`);
  };

  const filteredEquipments = equipments.filter((eq) =>
    eq.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eq.equipmentCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full pt-0.5 sm:pt-1 pb-6 sm:pb-space-xl font-body-md">

      {/* Header Section */}
      <div className="mb-3 sm:mb-4 flex flex-col gap-3 border-b border-border-subtle pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-3 mb-1.5">
              <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 text-primary shrink-0">
                <span className="material-symbols-outlined text-[24px]">layers</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-headline-xl text-text-primary tracking-tight">
                Check {floorNameParam}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary">
              List of registered test equipments for {floorNameParam}.
            </p>
          </div>

          {/* Synchronized View Mode Switcher */}
          <ViewModeToggle className="self-start sm:self-auto" />
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-text-muted pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Search equipment code or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-card border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-2xs transition-all"
          />
        </div>
      </div>

      {loadingEquipments ? (
        <div className="bg-surface-card rounded-xl shadow-xs border border-border-subtle overflow-hidden flex justify-center items-center py-20">
          <span className="material-symbols-outlined text-primary text-[32px] animate-spin">progress_activity</span>
        </div>
      ) : filteredEquipments.length === 0 ? (
        <div className="bg-surface-card rounded-xl shadow-xs border border-border-subtle overflow-hidden flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-16 h-16 bg-surface-subtle rounded-full flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[36px] text-border-strong">precision_manufacturing</span>
          </div>
          <h3 className="font-headline-sm text-text-primary mb-1">No Equipments Found</h3>
          <p className="font-body-sm text-text-secondary max-w-sm">
            {searchQuery ? 'No equipment matching your search query.' : 'There are no equipments registered on this floor yet.'}
          </p>
        </div>
      ) : viewMode === 'card' ? (
        /* Card View Mode - Standalone cards directly on the background */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredEquipments.map((eq, idx) => (
            <div
              key={eq.id}
              onClick={() => openHistoryPage(eq)}
              className="group p-4 bg-surface-card rounded-xl border border-border-subtle shadow-2xs hover:shadow-md hover:border-primary active:scale-[0.99] transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-1 bg-primary/10 text-primary font-technical-data font-semibold text-[12px] rounded-lg border border-primary/20">
                    {eq.equipmentCode}
                  </span>
                  <span className="text-[11px] font-technical-data text-text-muted">
                    #{idx + 1}
                  </span>
                </div>
                <h3 className="font-headline-sm text-base sm:text-lg font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2 mb-3">
                  {eq.equipmentName}
                </h3>
              </div>

              <div className="pt-3 border-t border-border-subtle/80 flex items-center justify-between text-primary font-medium text-sm">
                <span>View Test History</span>
                <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View Mode with Horizontal Scrolling */
        <div className="bg-surface-card rounded-xl shadow-xs border border-border-subtle overflow-hidden max-w-full w-full">
          <div className="overflow-x-auto max-w-full w-full">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="bg-surface-subtle border-b border-border-subtle">
                <tr>
                  <th className="px-4 sm:px-space-lg py-3 font-label-md text-text-muted uppercase tracking-wider w-[10%] text-xs">No.</th>
                  <th className="px-4 sm:px-space-lg py-3 font-label-md text-text-muted uppercase tracking-wider w-[25%] text-xs">Equipment Code</th>
                  <th className="px-4 sm:px-space-lg py-3 font-label-md text-text-muted uppercase tracking-wider w-[40%] text-xs">Equipment Name</th>
                  <th className="px-4 sm:px-space-lg py-3 font-label-md text-text-muted uppercase tracking-wider text-right w-[15%] text-xs">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEquipments.map((eq, idx) => (
                  <tr
                    key={eq.id}
                    onClick={() => openHistoryPage(eq)}
                    className="group border-b border-border-subtle hover:bg-surface-subtle transition-colors cursor-pointer last:border-0"
                  >
                    <td className="px-4 sm:px-space-lg py-4 font-body-md text-text-secondary">
                      {idx + 1}
                    </td>
                    <td className="px-4 sm:px-space-lg py-4 font-technical-data font-semibold text-text-primary">
                      {eq.equipmentCode}
                    </td>
                    <td className="px-4 sm:px-space-lg py-4 font-body-md text-text-secondary group-hover:text-primary transition-colors">
                      {eq.equipmentName}
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

export const EquipmentPage = EquipmentListPage;
export default EquipmentListPage;