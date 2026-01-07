import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Calculator, Scale, Target, FileText, Download, Code, Loader2 } from 'lucide-react';

export default function AboutMetrics() {
  const [metricConfig, setMetricConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMetricConfig().then(config => {
      setMetricConfig(config);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to load metric config", err);
      setLoading(false);
    });
  }, []);

  // Helper to formatting camelCase to Title Case
  const formatLabel = (str) => str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());

  const handleDownloadWhitepaper = () => {
    if (!metricConfig) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert("Please allow popups to download the report.");

    const date = new Date().toLocaleDateString();

    const sections = Object.entries(metricConfig).map(([name, conf]) => {
      const weights = Object.entries(conf.weights).map(([k, v]) =>
        `<div>${formatLabel(k)}: <b>${(v * 100).toFixed(0)}%</b></div>`
      ).join('');

      return `
            <tr>
                <td><strong>${name}</strong></td>
                <td>${weights}</td>
                <td>
                    Activity < ${conf.silentArchitectThreshold.activity}<br/>
                    Impact > ${conf.silentArchitectThreshold.impact}
                </td>
            </tr>
        `;
    }).join('');

    const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>ImpactLens Technical Formulation Specification</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
          body { font-family: 'Inter', sans-serif; color: #111; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 40px; }
          h1 { border-bottom: 2px solid #000; padding-bottom: 16px; margin-bottom: 32px; font-size: 28px; }
          h2 { margin-top: 40px; border-bottom: 1px solid #ccc; padding-bottom: 8px; font-size: 20px; }
          .meta { font-size: 12px; color: #666; margin-bottom: 40px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
          th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: 600; }
          .footer { margin-top: 60px; font-size: 10px; text-align: center; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <h1>ImpactLens Technical Specification</h1>
        <div class="meta">
          <strong>Generated:</strong> ${date} &bull; 
          <strong>Version:</strong> 3.0 (Backend Verified) &bull;
          <strong>Confidentiality:</strong> Internal Use Only
        </div>
        
        <section>
          <h2>Team Configuration & Weights</h2>
          <table>
            <thead>
              <tr>
                <th>Department</th>
                <th>Metric Weights</th>
                <th>Silent Architect Thresholds</th>
              </tr>
            </thead>
            <tbody>
              ${sections}
            </tbody>
          </table>
        </section>

        <div class="footer">
            Verified by ImpactLens Backend Service
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
    </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  if (loading || !metricConfig) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent tracking-tight mb-2">
            Verified Metrics
          </h1>
          <p className="text-zinc-400">
            Performance scores are centrally calculated by the Backend Engine.
          </p>
        </div>
        <button
          onClick={handleDownloadWhitepaper}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-sky-900/20"
        >
          <Download className="w-4 h-4" />
          Download Spec PDF
        </button>
      </div>

      <div className="bg-[#09090B] border border-zinc-800 rounded-xl p-8 shadow-lg relative overflow-hidden">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Code className="w-5 h-5 text-emerald-500" />
          Backend-Driven Verification
        </h2>
        <p className="text-zinc-300 leading-relaxed max-w-2xl">
          ImpactLens now delegates all scoring to the secure backend engine.
          The values below are fetched directly from the configured server logic, ensuring a Single Source of Truth.
        </p>
      </div>

      <h2 className="text-xl font-bold text-white mt-8 flex items-center gap-2">
        <Scale className="w-5 h-5 text-amber-500" />
        Live Team Configuration
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(metricConfig).map(([team, config]) => (
          <div key={team} className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-white text-lg">{team}</h3>
              {team !== 'Default' && <span className="text-xs font-mono bg-zinc-800 px-2 py-1 rounded text-zinc-400">Custom Profile</span>}
            </div>

            <div className="space-y-3">
              <div className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">Impact Weights</div>
              {Object.entries(config.weights).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-indigo-500"
                      style={{ width: `${value * 100}%` }}
                    />
                  </div>
                  <div className="w-24 text-right text-sm">
                    <span className="text-zinc-300">{(value * 100).toFixed(0)}%</span>
                    <span className="text-zinc-600 text-xs ml-1">{formatLabel(key)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800/50">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-zinc-200">Silent Architect Thresholds</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                  <div className="text-zinc-500 text-xs mb-1">Min Impact</div>
                  <div className="font-mono text-white font-bold">{config.silentArchitectThreshold.impact}</div>
                </div>
                <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                  <div className="text-zinc-500 text-xs mb-1">Max Activity</div>
                  <div className="font-mono text-white font-bold">{config.silentArchitectThreshold.activity}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
