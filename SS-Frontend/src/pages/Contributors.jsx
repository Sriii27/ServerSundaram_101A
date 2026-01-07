import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { Search, Filter, Download, FileText, ChevronDown, ChevronUp, Loader2, Sparkles } from 'lucide-react';

// Helper to format AI response text safely (Bold markers **text**, Lists - item, Newlines)
const ReportFormatter = ({ text }) => {
    if (!text) return null;
    const lines = text.split('\n').filter(line => line.trim() !== '');

    const parseBoldToReact = (text) => {
        // Split by **text** markers
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            // Check if this part is wrapped in **...**
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    return (
        <div className="space-y-3 text-sm text-zinc-300">
            {lines.map((line, idx) => {
                const trimmed = line.trim();

                // List items
                if (trimmed.startsWith('- ')) {
                    return (
                        <div key={idx} className="flex gap-3 pl-2">
                            <div className="min-w-[4px] h-[4px] bg-sky-500 rounded-full mt-2" />
                            <p>{parseBoldToReact(trimmed.replace('- ', ''))}</p>
                        </div>
                    );
                }

                // Headers (Standalone bold lines shorter than 80 chars - heuristic for titles)
                if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 80) {
                    return (
                        <h4 key={idx} className="text-sky-400 font-bold mt-4 mb-2 text-base">
                            {trimmed.replace(/\*\*/g, '')}
                        </h4>
                    );
                }

                // Regular text
                return (
                    <p key={idx} className="leading-relaxed">
                        {parseBoldToReact(line)}
                    </p>
                );
            })}
        </div>
    );
};

export default function Contributors() {
    // Data State (from hook)
    const { metrics, loading: hookLoading, error } = useDashboardMetrics('All Teams');

    // Local UI State
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('top'); // top, bottom, activity
    const [searchQuery, setSearchQuery] = useState('');

    // State for AI Reports
    const [expandedEmployeeId, setExpandedEmployeeId] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [reports, setReports] = useState({}); // Cache reports: { id: "report text" }

    // Sync hook data to local state for filtering/sorting
    useEffect(() => {
        if (metrics) {
            setEmployees(metrics.employees);
            setLoading(false);
        }
    }, [metrics]);

    // Error state handling
    if (error) {
        console.error("Failed to load contributors via hook", error);
    }

    const handleGenerateReport = async (employeeId, e) => {
        e.stopPropagation();

        // Toggle close if already open
        if (expandedEmployeeId === employeeId) {
            setExpandedEmployeeId(null);
            return;
        }

        setExpandedEmployeeId(employeeId);

        // If already has report, don't fetch again
        if (reports[employeeId]) return;

        setReportLoading(true);
        try {
            const data = await api.generateSummary(employeeId);
            setReports(prev => ({
                ...prev,
                [employeeId]: data.ai_summary
            }));
        } catch (error) {
            console.error("Failed to generate report", error);
            setReports(prev => ({
                ...prev,
                [employeeId]: "Failed to generate analysis. Please try again."
            }));
        } finally {
            setReportLoading(false);
        }
    };

    const handleExportSinglePDF = (emp, e) => {
        e.stopPropagation();
        // Open a new window for printing specifically this employee
        // Note: In a real app, you might restart the component in a print-only mode or use @react-pdf/renderer
        // Here we inject a clean HTML structure into a new popup window.

        const printContent = `
        <html>
          <head>
            <title>${emp.name} - Performance Report</title>
            <style>
              body { font-family: sans-serif; padding: 40px; color: #111; max-width: 800px; margin: 0 auto; }
              h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
              .meta { margin-bottom: 30px; background: #f9f9f9; padding: 20px; border-radius: 8px; }
              .meta div { margin-bottom: 8px; }
              .label { font-weight: bold; width: 120px; display: inline-block; color: #666; }
              .scores { display: flex; gap: 20px; margin-bottom: 30px; }
              .score-box { border: 1px solid #ddd; padding: 15px; border-radius: 8px; flex: 1; text-align: center; }
              .score-val { font-size: 24px; font-weight: bold; color: #000; }
              .report-section { margin-top: 30px; line-height: 1.6; }
              strong { color: #000; }
              .footer { margin-top: 50px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
            </style>
          </head>
          <body>
            <h1>Performance Report</h1>
            <div class="meta">
              <div><span class="label">Employee:</span> ${emp.name}</div>
              <div><span class="label">Role:</span> ${emp.role}</div>
              <div><span class="label">Team:</span> ${emp.team}</div>
              <div><span class="label">Generated:</span> ${new Date().toLocaleDateString()}</div>
            </div>
            
            <div class="scores">
              <div class="score-box">
                <div class="score-val">${emp.impactScore}</div>
                <div style="font-size: 12px; color: #666; margin-top: 5px;">IMPACT SCORE</div>
              </div>
              <div class="score-box">
                <div class="score-val">${emp.activityScore}</div>
                <div style="font-size: 12px; color: #666; margin-top: 5px;">ACTIVITY SCORE</div>
              </div>
            </div>

            ${reports[emp.id] ? `
              <div class="report-section">
                <h3>AI Analysis</h3>
                <div>${reports[emp.id]
                    .replace(/\n/g, '<br/>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/- /g, '&bull; ')}</div>
              </div>
            ` : '<p><em>No detailed AI analysis generated yet. Please generate the report in the dashboard first.</em></p>'}
            
            <div class="footer">
              Generated by ImpactLens Workforce Analytics
            </div>
          </body>
        </html>
      `;

        const win = window.open('', '', 'width=900,height=900');
        win.document.write(printContent);
        win.document.close();
        // Wait for content to load then print
        setTimeout(() => {
            win.print();
            // win.close(); // Optional: close after print
        }, 500);
    };

    // Filter & Sort Logic
    const getFilteredEmployees = () => {
        let result = [...employees];

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(e =>
                e.name.toLowerCase().includes(q) ||
                e.role.toLowerCase().includes(q) ||
                e.team.toLowerCase().includes(q)
            );
        }

        switch (filter) {
            case 'top':
                return result.sort((a, b) => b.impactScore - a.impactScore);
            case 'bottom':
                return result.sort((a, b) => a.impactScore - b.impactScore);
            case 'activity':
                return result.sort((a, b) => b.activityScore - a.activityScore);
            default:
                return result;
        }
    };

    const filteredData = getFilteredEmployees();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Contributors</h1>
                    <p className="text-zinc-400 text-sm">Consolidated view of workforce performance across all teams.</p>
                </div>
            </div>

            {/* Filters Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-[#09090B] border border-zinc-800 rounded-xl print:hidden">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search employees, roles, or teams..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder:text-zinc-600"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-zinc-500" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                        <option value="top">Top Contributors</option>
                        <option value="bottom">Least Contributors</option>
                        <option value="activity">High Activity</option>
                    </select>
                </div>
            </div>

            {/* Contributors Table */}
            <div className="bg-[#09090B] border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Team</th>
                                <th className="px-6 py-4 text-center">Impact Score</th>
                                <th className="px-6 py-4 text-center">Activity Score</th>
                                <th className="px-6 py-4 text-right print:hidden">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {filteredData.map((emp) => (
                                <React.Fragment key={emp.id}>
                                    <tr className="hover:bg-zinc-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${emp.silentArchitect ? 'bg-amber-500/20 text-amber-500' : 'bg-zinc-800 text-zinc-400'
                                                    }`}>
                                                    {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-zinc-200 group-hover:text-sky-400 transition-colors flex items-center gap-2">
                                                        {emp.name}
                                                        {emp.silentArchitect && <Sparkles className="w-3 h-3 text-amber-500" />}
                                                    </div>
                                                    <div className="text-xs text-zinc-500">{emp.role}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-400 border border-zinc-700">
                                                {emp.team}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`font-mono font-bold ${emp.impactScore >= 80 ? 'text-sky-400' : 'text-zinc-300'}`}>
                                                {emp.impactScore}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-zinc-400">
                                            {emp.activityScore}
                                        </td>
                                        <td className="px-6 py-4 text-right print:hidden">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={(e) => handleGenerateReport(emp.id, e)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${expandedEmployeeId === emp.id
                                                        ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                                                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                                                        }`}
                                                >
                                                    {expandedEmployeeId === emp.id ? (
                                                        <>
                                                            <ChevronUp className="w-3 h-3" /> Hide
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FileText className="w-3 h-3" /> Report
                                                        </>
                                                    )}
                                                </button>

                                                <button
                                                    onClick={(e) => handleExportSinglePDF(emp, e)}
                                                    className="p-1.5 bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-700"
                                                    title="Export to PDF"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Expanded AI Report Row */}
                                    {expandedEmployeeId === emp.id && (
                                        <tr className="bg-[#09090B] animate-in slide-in-from-top-2 duration-200">
                                            <td colSpan="5" className="px-6 py-0">
                                                <div className="my-4 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl relative overflow-hidden">
                                                    {/* Decorative background element */}
                                                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                                        <Sparkles className="w-32 h-32 text-sky-500" />
                                                    </div>

                                                    <div className="relative z-10">
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <div className="p-1.5 bg-sky-500/10 rounded-lg">
                                                                <Sparkles className="w-4 h-4 text-sky-500" />
                                                            </div>
                                                            <h3 className="font-bold text-white text-sm uppercase tracking-wider">AI Performance Analysis</h3>
                                                            <span className="text-xs text-zinc-500 ml-auto">
                                                                Generated for: {emp.name}
                                                            </span>
                                                        </div>

                                                        {reportLoading && !reports[emp.id] ? (
                                                            <div className="py-8 flex flex-col items-center justify-center text-zinc-500 space-y-3">
                                                                <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
                                                                <span className="text-sm">Analyzing contribution patterns...</span>
                                                            </div>
                                                        ) : (
                                                            // Use the new Formatter component here
                                                            <ReportFormatter text={reports[emp.id]} />
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}

                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-zinc-500">
                                        No contributors found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
