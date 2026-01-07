import React, { useState } from 'react';
import { LayoutDashboard, Users, Activity, Settings, Search, Bell, Menu, X, LogOut, Scale } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function DashboardLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Users, label: 'Contributors', path: '/contributors' },
        { icon: Activity, label: 'Activity', path: '/activity' },
        { icon: Scale, label: 'Metrics', path: '/metrics' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <div className="min-h-screen bg-[#000000] flex text-zinc-200 font-sans">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#09090B] border-r border-zinc-800
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-white">ImpactLens</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
                  ${isActive
                                        ? 'bg-zinc-800 text-sky-400 font-medium'
                                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                                    }
                `}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-sky-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-zinc-800">
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300">
                            JD
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-medium text-white">Jane Doe</div>
                            <div className="text-xs text-zinc-500">Engineering Lead</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Top Header */}
                <header className="h-16 bg-[#09090B]/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-6 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 text-zinc-400 hover:bg-zinc-800 rounded-lg"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* <div className="hidden md:flex items-center relative">
                            <Search className="w-4 h-4 absolute left-3 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search employees, teams..."
                                className="bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm rounded-lg pl-9 pr-4 py-2 w-64 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-zinc-600"
                            />
                        </div> */}
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-zinc-400 hover:text-sky-400 hover:bg-zinc-800 rounded-lg transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-sky-500 border-2 border-[#09090B]"></span>
                        </button>

                        <Link to="/login" className="p-2 text-zinc-400 hover:text-sky-400 hover:bg-zinc-800 rounded-lg transition-colors" title="Sign Out">
                            <LogOut className="w-5 h-5" />
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
