import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  FileImage, 
  MessageSquare, 
  Globe, 
  Trash2, 
  Eye, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';

export default function HistoryPage() {
  const { history, setCurrentResult, setCurrentView, deleteScan, t } = useApp();

  const [activeFilter, setActiveFilter] = useState('all'); // all, high, review, safe
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionMenuOpenId, setActionMenuOpenId] = useState(null);
  const pageSize = 5;

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      // Risk filter
      if (activeFilter === 'high' && item.riskCategory !== 'high') return false;
      if (activeFilter === 'review' && item.riskCategory !== 'review') return false;
      if (activeFilter === 'safe' && item.riskCategory !== 'safe') return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesItem = item.submittedItem?.toLowerCase().includes(query);
        const matchesType = item.typeLabel?.toLowerCase().includes(query);
        const matchesDate = item.dateFormatted?.toLowerCase().includes(query);
        return matchesItem || matchesType || matchesDate;
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
      case 'screenshot':
        return FileImage;
      case 'url':
        return Globe;
      default:
        return MessageSquare;
    }
  };

  const getRiskBadge = (category) => {
    switch (category) {
      case 'high':
        return {
          label: t.highConcern,
          bg: 'bg-red-50 text-red-700 border-red-200',
          dot: 'bg-red-500'
        };
      case 'review':
        return {
          label: t.needsVerification,
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500'
        };
      default:
        return {
          label: t.noMajorWarnings,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500'
        };
    }
  };

  const handleView = (item) => {
    setCurrentResult(item);
    setCurrentView('results');
  };

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight font-heading">
          {t.scanHistoryTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t.scanHistorySubtitle}
        </p>
      </div>

      {/* Search Bar & Filters Card */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={t.searchHistoryPlaceholder}
            className="w-full bg-[#F7F9FC] border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => { setActiveFilter('all'); setCurrentPage(1); }}
            className={`
              px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all
              ${activeFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }
            `}
          >
            {t.filterAll}
          </button>

          <button
            type="button"
            onClick={() => { setActiveFilter('high'); setCurrentPage(1); }}
            className={`
              px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all
              ${activeFilter === 'high'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }
            `}
          >
            {t.filterHigh}
          </button>

          <button
            type="button"
            onClick={() => { setActiveFilter('review'); setCurrentPage(1); }}
            className={`
              px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all
              ${activeFilter === 'review'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }
            `}
          >
            {t.filterNeedsVerification}
          </button>

          <button
            type="button"
            onClick={() => { setActiveFilter('safe'); setCurrentPage(1); }}
            className={`
              px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all
              ${activeFilter === 'safe'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }
            `}
          >
            {t.filterNoMajor}
          </button>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold text-xs">
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
                    <tr 
                      key={item.id} 
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Type */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-medium text-slate-700 text-xs">
                            {item.typeLabel}
                          </span>
                        </div>
                      </td>

                      {/* Submitted Item */}
                      <td className="py-3 px-3 max-w-[220px] sm:max-w-[300px]">
                        <span 
                          onClick={() => handleView(item)}
                          className="font-semibold text-slate-900 hover:text-blue-600 cursor-pointer truncate block"
                          title={item.submittedItem}
                        >
                          {item.submittedItem}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-3 text-slate-500 text-xs whitespace-nowrap">
                        {item.dateFormatted}
                      </td>

                      {/* Risk Category */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${risk.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} />
                          <span>{risk.label}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{t.completed}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap relative">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleView(item)}
                            className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 text-xs font-semibold transition-colors"
                          >
                            {t.view}
                          </button>

                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setActionMenuOpenId(isMenuOpen ? null : item.id)}
                              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {isMenuOpen && (
                              <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-30 text-xs">
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleView(item);
                                    setActionMenuOpenId(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>{t.view}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    deleteScan(item.id);
                                    setActionMenuOpenId(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-2"
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
                    <p className="text-sm font-medium">No matching scans found.</p>
                    <p className="text-xs mt-1">Try adjusting your filters or search term.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Counter matching reference image */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <span>{t.showing} </span>
            <strong className="text-slate-700">{paginatedItems.length}</strong>
            <span> {t.of} </span>
            <strong className="text-slate-700">{filteredHistory.length}</strong>
            <span> {t.scans}</span>
          </div>

          <div className="flex items-center gap-1 self-end sm:self-auto">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setCurrentPage(num)}
                className={`
                  w-7 h-7 rounded-lg text-xs font-semibold transition-all
                  ${currentPage === num 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'border border-slate-200 hover:bg-slate-50 text-slate-600'
                  }
                `}
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
