import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, FileImage, MessageSquare, Globe, Trash2, Eye, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HistoryPage() {
  const { history, setCurrentResult, setCurrentView, deleteScan, t } = useApp();

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionMenuOpenId, setActionMenuOpenId] = useState(null);
  const pageSize = 5;

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      if (activeFilter === 'high' && item.riskCategory !== 'high') return false;
      if (activeFilter === 'review' && item.riskCategory !== 'review') return false;
      if (activeFilter === 'safe' && item.riskCategory !== 'safe') return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        return item.submittedItem?.toLowerCase().includes(query) ||
               item.typeLabel?.toLowerCase().includes(query) ||
               item.dateFormatted?.toLowerCase().includes(query);
      }
      return true;
    });
  }, [history, activeFilter, searchTerm]);

  const totalPages = Math.ceil(filteredHistory.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredHistory.slice(start, start + pageSize);
  }, [filteredHistory, currentPage]);

  const getIcon = (type) => {
    switch (type) {
      case 'screenshot': return FileImage;
      case 'url': return Globe;
      default: return MessageSquare;
    }
  };

  const getRiskBadge = (category) => {
    switch (category) {
      case 'high':
        return { label: t.highConcern, bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' };
      case 'review':
        return { label: t.needsVerification, bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
      default:
        return { label: t.noMajorWarnings, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
    }
  };

  const handleView = (item) => {
    setCurrentResult(item);
    setCurrentView('results');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="animate-slide-in-right">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
          {t.scanHistoryTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t.scanHistorySubtitle}
        </p>
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4 animate-slide-in-bottom">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder={t.searchHistoryPlaceholder}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['all', 'high', 'review', 'safe'].map((filterKey) => {
            const labels = {
              all: t.filterAll,
              high: t.filterHigh,
              review: t.filterNeedsVerification,
              safe: t.filterNoMajor
            };
            return (
              <button
                key={filterKey}
                type="button"
                onClick={() => { setActiveFilter(filterKey); setCurrentPage(1); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeFilter === filterKey
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {labels[filterKey]}
              </button>
            );
          })}
        </div>

        <div className="overflow-x-auto -mx-2 sm:mx-0 pt-2">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">{t.colType}</th>
                <th className="py-3 px-3">{t.colSubmittedItem}</th>
                <th className="py-3 px-3 whitespace-nowrap">{t.colDateTime}</th>
                <th className="py-3 px-3 whitespace-nowrap">{t.colRiskCategory}</th>
                <th className="py-3 px-3">{t.colStatus}</th>
                <th className="py-3 px-3 text-right">{t.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item) => {
                  const Icon = getIcon(item.type);
                  const risk = getRiskBadge(item.riskCategory);
                  const isMenuOpen = actionMenuOpenId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-slate-700 text-xs">
                            {item.typeLabel}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 max-w-[200px] sm:max-w-[280px]">
                        <span 
                          onClick={() => handleView(item)}
                          className="font-bold text-slate-900 hover:text-slate-700 cursor-pointer truncate block"
                          title={item.submittedItem}
                        >
                          {item.submittedItem}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-500 text-xs whitespace-nowrap">
                        {item.dateFormatted}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${risk.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} />
                          <span>{risk.label}</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{t.completed}</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap relative">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleView(item)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                          >
                            {t.view}
                          </button>

                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setActionMenuOpenId(isMenuOpen ? null : item.id)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {isMenuOpen && (
                              <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-xs">
                                <button
                                  type="button"
                                  onClick={() => { handleView(item); setActionMenuOpenId(null); }}
                                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>{t.view}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { deleteScan(item.id); setActionMenuOpenId(null); }}
                                  className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 font-medium"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>{t.delete}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">No matching scans found.</p>
                    <p className="text-xs mt-1">Try adjusting your filters or search term.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <span>{t.showing} </span>
            <strong className="text-slate-800">{paginatedItems.length}</strong>
            <span> {t.of} </span>
            <strong className="text-slate-800">{filteredHistory.length}</strong>
            <span> {t.scans}</span>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setCurrentPage(num)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                  currentPage === num ? 'bg-slate-900 text-white shadow-xs' : 'border border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}