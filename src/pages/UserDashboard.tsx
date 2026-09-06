import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  HelpCircle,
  Bell,
  MessageSquare,
  Search,
  ClipboardList,
  MonitorCheck,
  Loader2
} from 'lucide-react';
import { equipmentService } from '../services/equipmentService';
import type { Floor } from '../types/equipment.types';
import toast from 'react-hot-toast';

export const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(true);

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

  const staticActions = [
    {
      title: 'Notifications',
      description: 'System alerts and updates',
      icon: Bell,
      path: '/notifications'
    },
    {
      title: 'Messages',
      description: 'Internal communications',
      icon: MessageSquare,
      path: '/messages'
    },
    {
      title: 'Search',
      description: 'Global parametric search',
      icon: Search,
      path: '/search'
    },
    {
      title: 'Reports',
      description: 'Analytics and telemetry',
      icon: ClipboardList,
      path: '/reports'
    },
    {
      title: 'Help Center',
      description: 'Documentation & support',
      icon: HelpCircle,
      path: '/help'
    },
    {
      title: 'Settings',
      description: 'Preferences & security',
      icon: Settings,
      path: '/settings'
    }
  ];

  return (
    <div className="min-h-screen bg-surface-canvas font-body-md">
      <div className="max-w-[88rem] mx-auto py-space-xl px-margin-mobile md:px-margin-tablet lg:px-margin-desktop">

        {/* Header Section */}
        <div className="mb-space-xl border-b border-border-subtle pb-space-lg">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <MonitorCheck className="w-6 h-6 text-primary" />
            </div>
            <h1 className="font-headline-xl text-text-primary tracking-tight">Enterprise Dashboard</h1>
          </div>
          <p className="font-body-lg text-text-secondary">Select a module below to manage equipment tests or access system tools.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-space-xl">

            {/* Floors Section */}
            <section>
              <h2 className="font-headline-md text-text-primary mb-space-lg flex items-center space-x-2">
                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                <span>GO/NOGO</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-space-base">
                {floors.map((floor) => (
                  <div
                    key={`floor-${floor.id}`}
                    onClick={() => navigate(`/equipments?floorId=${floor.id}&floorName=${encodeURIComponent(floor.name)}`)}
                    className="group relative flex flex-col p-space-lg bg-surface-card rounded-xl border border-border-subtle shadow-sm hover:shadow-md hover:border-primary transition-all duration-200 cursor-pointer overflow-hidden"
                  >
                    {/* Top hover indicator line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-fixed-dim transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-surface-subtle border border-border-subtle flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <MonitorCheck className="w-6 h-6 text-text-secondary group-hover:text-primary transition-colors" />
                      </div>
                      <span className="material-symbols-outlined text-text-muted opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200">
                        arrow_forward
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-text-primary mb-1">Check {floor.name}</h3>
                    <p className="font-body-sm text-text-secondary">Equipment test flow for {floor.name}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* System Tools Section */}
            <section>
              <h2 className="font-headline-md text-text-primary mb-space-lg flex items-center space-x-2">
                <span className="w-1.5 h-6 bg-text-muted rounded-full"></span>
                <span>System Tools</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-space-base">
                {staticActions.map((action, index) => (
                  <div
                    key={`static-${index}`}
                    onClick={() => navigate(action.path)}
                    className="group flex items-start space-x-4 p-space-base bg-surface-card rounded-xl border border-border-subtle shadow-sm hover:shadow-md hover:bg-surface-subtle transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex-shrink-0 p-2.5 rounded-lg bg-surface border border-border-subtle text-text-secondary group-hover:text-primary group-hover:border-primary/30 transition-colors">
                      <action.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-col justify-center pt-1">
                      <h3 className="font-label-md text-text-primary">{action.title}</h3>
                      <p className="font-body-sm text-text-muted mt-0.5">{action.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}
      </div>
    </div>
  );
};
