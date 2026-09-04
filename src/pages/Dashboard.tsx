import React from 'react';
import { TrendingUp, Users, Coins, Percent, ArrowUp, ArrowDown } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const statCards = [
    {
      title: 'TRAFFIC',
      value: '350,897',
      icon: TrendingUp,
      iconColor: 'bg-red-500',
      trend: '+3.48%',
      trendUp: true,
      desc: 'Since last month'
    },
    {
      title: 'NEW USERS',
      value: '2,356',
      icon: Users,
      iconColor: 'bg-orange-500',
      trend: '-3.48%',
      trendUp: false,
      desc: 'Since last week'
    },
    {
      title: 'SALES',
      value: '924',
      icon: Coins,
      iconColor: 'bg-yellow-400',
      trend: '-1.10%',
      trendUp: false,
      desc: 'Since yesterday'
    },
    {
      title: 'PERFORMANCE',
      value: '49,65%',
      icon: Percent,
      iconColor: 'bg-blue-400',
      trend: '+12%',
      trendUp: true,
      desc: 'Since last month'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  {card.title}
                </p>
                <h3 className="text-2xl font-bold text-gray-800">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-full ${card.iconColor} text-white shadow-md`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`flex items-center font-medium ${card.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                {card.trendUp ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                {card.trend}
              </span>
              <span className="text-gray-400 ml-2">{card.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#172b4d] rounded-xl shadow-sm p-6 min-h-[350px] relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Overview</p>
              <h2 className="text-white text-xl font-bold">Sales value</h2>
            </div>
            <div className="flex bg-[#11213d] rounded-lg p-1">
              <button className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded-md shadow">Month</button>
              <button className="px-3 py-1 text-white text-sm font-medium hover:bg-white/10 rounded-md transition">Week</button>
            </div>
          </div>
          {/* Placeholder for actual Chart.js / Recharts */}
          <div className="absolute bottom-0 left-0 w-full h-[250px] flex items-end justify-center pb-10 text-white/20">
            [ Line Chart Area ]
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[350px] relative">
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Performance</p>
          <h2 className="text-gray-800 text-xl font-bold mb-4">Total orders</h2>
          {/* Placeholder for Bar Chart */}
          <div className="absolute bottom-0 left-0 w-full h-[250px] flex items-end justify-center pb-10 text-gray-300">
            [ Bar Chart Area ]
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-gray-800 font-bold text-lg">Page visits</h3>
            <button className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm font-medium rounded transition">
              See all
            </button>
          </div>
          <div className="p-6 text-gray-400 flex items-center justify-center h-[200px]">
            [ Table Content ]
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-gray-800 font-bold text-lg">Social traffic</h3>
            <button className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm font-medium rounded transition">
              See all
            </button>
          </div>
          <div className="p-6 text-gray-400 flex items-center justify-center h-[200px]">
            [ Table Content ]
          </div>
        </div>
      </div>
    </div>
  );
};
