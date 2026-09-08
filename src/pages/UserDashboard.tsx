import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MonitorCheck,
  Loader2,
  Search,
  ChevronRight
} from 'lucide-react';
import { equipmentService } from '../services/equipmentService';
import type { Floor } from '../types/equipment.types';
import toast from 'react-hot-toast';

export const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
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

  const filteredFloors = floors.filter(floor =>
    floor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-surface-canvas font-body-md">
      <div className="max-w-[88rem] mx-auto py-4 sm:py-space-xl px-2 sm:px-margin-mobile md:px-margin-tablet lg:px-margin-desktop">

        {/* Header Section */}
        <div className="mb-6 sm:mb-space-xl border-b border-border-subtle pb-4 sm:pb-space-lg">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 sm:p-2.5 bg-primary/10 rounded-xl border border-primary/20 text-primary shrink-0">
              <MonitorCheck className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-headline-xl text-text-primary tracking-tight">
                Enterprise Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                Select a floor module below to execute Go/NoGo equipment tests.
              </p>
            </div>
          </div>

          {/* Quick Search for Mobile & Field Techs */}
          <div className="mt-4 max-w-md relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Quick search floor or line..."
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
        ) : (
          <div className="space-y-6">
            {/* Floors Section */}
            <section>
              <div className="flex items-center justify-between mb-4 sm:mb-space-lg">
                <h2 className="text-base sm:text-lg font-bold text-text-primary flex items-center space-x-2">
                  <span className="w-1.5 h-5 sm:h-6 bg-primary rounded-full"></span>
                  <span>GO/NOGO Floors</span>
                  <span className="text-xs font-semibold text-text-muted bg-surface-subtle px-2 py-0.5 rounded-full border border-border-subtle">
                    {filteredFloors.length}
                  </span>
                </h2>
              </div>

              {filteredFloors.length === 0 ? (
                <div className="p-8 text-center bg-surface-card rounded-xl border border-border-subtle">
                  <p className="text-sm text-text-secondary">No matching floors found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-space-base">
                  {filteredFloors.map((floor) => (
                    <div
                      key={`floor-${floor.id}`}
                      onClick={() => navigate(`/equipments?floorId=${floor.id}&floorName=${encodeURIComponent(floor.name)}`)}
                      className="group relative flex flex-col p-4 sm:p-space-lg bg-surface-card rounded-xl border border-border-subtle shadow-xs hover:shadow-md hover:border-primary active:scale-[0.99] transition-all duration-200 cursor-pointer overflow-hidden min-h-[96px]"
                    >
                      {/* Top indicator line */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-fixed-dim transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-surface-subtle border border-border-subtle flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                          <MonitorCheck className="w-5 h-5 sm:w-6 sm:h-6 text-text-secondary group-hover:text-primary transition-colors" />
                        </div>

                        {/* Always visible chevron on mobile, animated on desktop */}
                        <div className="w-8 h-8 rounded-full bg-surface-subtle sm:bg-transparent flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <ChevronRight className="w-5 h-5 text-text-muted sm:text-text-muted/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-text-primary mb-1 group-hover:text-primary transition-colors">
                        Check {floor.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-text-secondary">
                        Equipment test flow for {floor.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};