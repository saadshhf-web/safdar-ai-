import React, { useState } from 'react';
import {
  BarChart3,
  Upload,
  FileSpreadsheet,
  Table,
  Sparkles,
  RotateCw,
  AlertCircle,
  TrendingUp,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { ApiService } from '../services/api.ts';
import { ProviderType } from '../types.ts';

interface DataAnalysisViewProps {
  onAskAboutData: (datasetSummary: string, initialPrompt: string) => void;
  selectedProvider: ProviderType;
}

export const DataAnalysisView: React.FC<DataAnalysisViewProps> = ({
  onAskAboutData,
  selectedProvider,
}) => {
  const [dataContent, setDataContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [format, setFormat] = useState('csv');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Result state
  const [analysisResult, setAnalysisResult] = useState<{
    fileName: string;
    totalRows: number;
    totalColumns: number;
    headers: string[];
    preview: Record<string, any>[];
    stats: Record<string, any>;
  } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const isJson = file.name.endsWith('.json');
    setFormat(isJson ? 'json' : 'csv');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setDataContent(text);
      runAnalysis(text, isJson ? 'json' : 'csv', file.name);
    };
    reader.readAsText(file);
  };

  const runAnalysis = async (content: string, fmt: string, name: string) => {
    if (!content.trim()) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await ApiService.analyzeData({
        content,
        format: fmt,
        fileName: name || 'dataset.csv',
      });
      setAnalysisResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to parse and analyze dataset.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadSample = () => {
    const sampleCsv = `Product,Category,Price,QuantitySold,Rating,Region
Ultra Smartwatch,Electronics,299,145,4.8,North America
Ergonomic Chair,Furniture,349,85,4.6,Europe
Noise Canceling Headphones,Electronics,199,320,4.9,Asia
Organic Matcha,Beverages,28,640,4.7,North America
Mechanical Keyboard,Electronics,120,210,4.5,Europe
Standing Desk,Furniture,499,55,4.4,North America
Roasted Coffee Beans,Beverages,22,890,4.8,Asia`;

    setFileName('sales_performance_sample.csv');
    setFormat('csv');
    setDataContent(sampleCsv);
    runAnalysis(sampleCsv, 'csv', 'sales_performance_sample.csv');
  };

  const handleGenerateAIReport = () => {
    if (!analysisResult) return;

    const summary = `DATASET SUMMARY:
File: ${analysisResult.fileName}
Rows: ${analysisResult.totalRows}, Columns: ${analysisResult.totalColumns}
Columns: ${analysisResult.headers.join(', ')}
Key Statistics:
${Object.entries(analysisResult.stats)
  .map(
    ([col, s]) =>
      `- ${col} (${s.type}): ${
        s.type === 'numeric'
          ? `Min=${s.min}, Max=${s.max}, Avg=${s.avg}, Missing=${s.missing}`
          : `Unique=${s.unique}, Missing=${s.missing}`
      }`
  )
  .join('\n')}

Data Sample:
${JSON.stringify(analysisResult.preview.slice(0, 4), null, 2)}`;

    onAskAboutData(
      summary,
      'Perform a comprehensive statistical and business intelligence analysis on this dataset. Identify top trends, high-performing segments, potential anomalies, and strategic recommendations.'
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 md:p-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="text-violet-400" size={24} />
            <h1 className="text-xl md:text-2xl font-bold text-white">Data Analysis Engine</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Server-side statistical computation, pattern detection, cleaning & AI-powered data science.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadSample}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors cursor-pointer"
        >
          Load Sample Dataset
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="my-4 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Zone */}
      <div className="py-6">
        {!analysisResult ? (
          <div className="border-2 border-dashed border-slate-800 hover:border-violet-500/50 rounded-2xl p-8 md:p-12 text-center bg-slate-900/40 transition-colors">
            <FileSpreadsheet size={40} className="mx-auto mb-3 text-violet-400 opacity-80" />
            <h3 className="font-semibold text-sm text-slate-200">Upload CSV or JSON Dataset</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
              Drag & drop your file here to calculate statistics, distributions, and missing values.
            </p>
            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs shadow-md shadow-violet-600/20 cursor-pointer transition-all">
              <Upload size={14} />
              <span>Choose File</span>
              <input
                type="file"
                accept=".csv,.json,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Meta and AI Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span>{analysisResult.fileName}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {analysisResult.totalRows} records &bull; {analysisResult.totalColumns} attributes
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer">
                  Upload Different File
                  <input
                    type="file"
                    accept=".csv,.json,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleGenerateAIReport}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-xs shadow-md shadow-violet-600/20 cursor-pointer transition-all"
                >
                  <Sparkles size={14} />
                  <span>Generate Full AI Report</span>
                </button>
              </div>
            </div>

            {/* Column Statistics Cards */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                Column Attributes & Statistics
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.entries(analysisResult.stats).map(([col, st]) => (
                  <div
                    key={col}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-200 truncate">{col}</span>
                      <span
                        className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-mono ${
                          st.type === 'numeric'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                            : 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/40'
                        }`}
                      >
                        {st.type}
                      </span>
                    </div>

                    {st.type === 'numeric' ? (
                      <div className="space-y-1 text-slate-400 text-[11px]">
                        <div className="flex justify-between">
                          <span>Average:</span>
                          <span className="text-slate-200 font-mono font-medium">{st.avg}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Min / Max:</span>
                          <span className="text-slate-200 font-mono">
                            {st.min} / {st.max}
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span>Missing:</span>
                          <span>{st.missing}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 text-slate-400 text-[11px]">
                        <div className="flex justify-between">
                          <span>Unique items:</span>
                          <span className="text-slate-200 font-mono">{st.unique}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span>Missing:</span>
                          <span>{st.missing}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Data Preview Table */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Table size={13} />
                <span>Dataset Preview (Top 10 Records)</span>
              </h4>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-300 font-semibold font-mono">
                      {analysisResult.headers.map((h) => (
                        <th key={h} className="p-2.5 truncate max-w-[150px]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {analysisResult.preview.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-800/30">
                        {analysisResult.headers.map((h) => (
                          <td key={h} className="p-2.5 truncate max-w-[150px]">
                            {String(row[h] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
