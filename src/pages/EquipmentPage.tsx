import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { equipmentService } from '../services/equipmentService';
import type { Equipment } from '../types/equipment.types';
import toast from 'react-hot-toast';

export const EquipmentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const floorIdParam = searchParams.get('floorId');
  const floorNameParam = searchParams.get('floorName') || 'Equipment';

  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loadingEquipments, setLoadingEquipments] = useState(false);

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

  return (
    <div className="w-full max-w-[88rem] mx-auto py-space-xl px-margin-mobile md:px-margin-tablet lg:px-margin-desktop font-body-md">
      
      {/* Header Section */}
      <div className="mb-space-xl flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-subtle pb-space-lg">
        <div>
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20 text-primary">
              <span className="material-symbols-outlined text-[24px]">layers</span>
            </div>
            <h1 className="font-headline-xl text-text-primary tracking-tight">Check {floorNameParam}</h1>
          </div>
          <p className="font-body-lg text-text-secondary">List of equipments in {floorNameParam}.</p>
        </div>
      </div>

      <div className="bg-surface-card rounded-xl shadow-sm border border-border-subtle overflow-hidden">
        {loadingEquipments ? (
          <div className="flex justify-center items-center py-20">
            <span className="material-symbols-outlined text-primary text-[32px] animate-spin">progress_activity</span>
          </div>
        ) : equipments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-20 h-20 bg-surface-subtle rounded-full flex items-center justify-center mb-4">
               <span className="material-symbols-outlined text-[40px] text-border-strong">precision_manufacturing</span>
            </div>
            <h3 className="font-headline-sm text-text-primary mb-2">No Equipments Found</h3>
            <p className="font-body-sm text-text-secondary max-w-md mx-auto">
              There are no equipments registered on this floor yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-subtle border-b border-border-subtle">
                <tr>
                  <th className="px-space-lg py-3 font-label-md text-text-muted uppercase tracking-wider w-[10%]">No.</th>
                  <th className="px-space-lg py-3 font-label-md text-text-muted uppercase tracking-wider w-[25%]">Equipment Code</th>
                  <th className="px-space-lg py-3 font-label-md text-text-muted uppercase tracking-wider w-[40%]">Equipment Name</th>
                  <th className="px-space-lg py-3 font-label-md text-text-muted uppercase tracking-wider text-right w-[25%]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {equipments.map((eq, idx) => (
                  <tr key={eq.id} className="group border-b border-border-subtle hover:bg-surface-subtle transition-colors last:border-0">
                    <td className="px-space-lg py-4 font-body-md text-text-secondary">
                      {idx + 1}
                    </td>
                    <td className="px-space-lg py-4">
                      <span className="px-2.5 py-1 bg-primary/10 text-primary font-technical-data text-[12px] rounded-md border border-primary/20">
                        {eq.equipmentCode}
                      </span>
                    </td>
                    <td className="px-space-lg py-4 font-headline-sm text-text-primary">
                      {eq.equipmentName}
                    </td>
                    <td className="px-space-lg py-4 text-right">
                      <button
                        onClick={() => openHistoryPage(eq)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-label-md rounded-lg bg-surface border border-border-subtle text-text-secondary hover:text-primary hover:border-primary/30 transition-colors shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[18px]">history</span>
                        View History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
