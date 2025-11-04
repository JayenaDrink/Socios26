'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

interface MigrationError {
  member_number: string;
  error: string;
  details?: {
    email?: string;
    name?: string;
    code?: string;
  };
}

interface MigrationResult {
  imported: number;
  failed: number;
  total: number;
  errors: MigrationError[] | string[];
  successful?: string[];
  message: string;
  timestamp?: string;
}

export default function MigrationStatusPage() {
  const [results, setResults] = useState<MigrationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState<MigrationResult | null>(null);

  // Load results from localStorage (stored after each import)
  useEffect(() => {
    const storedResults = localStorage.getItem('migration_results');
    if (storedResults) {
      try {
        const parsed = JSON.parse(storedResults);
        setResults(Array.isArray(parsed) ? parsed : [parsed]);
      } catch (e) {
        console.error('Error loading migration results:', e);
      }
    }
  }, []);

  const clearResults = () => {
    localStorage.removeItem('migration_results');
    setResults([]);
    setSelectedResult(null);
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'Unknown';
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const isDetailedError = (error: any): error is MigrationError => {
    return typeof error === 'object' && error !== null && 'member_number' in error && 'error' in error;
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Migration Status</h1>
          {results.length > 0 && (
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear All Results
            </button>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-yellow-800 mb-2">How to view migration results:</h2>
          <p className="text-yellow-700 text-sm">
            After importing an Excel file on the <a href="/admin/import" className="underline font-semibold">Import page</a>, 
            the results will be saved here automatically. Check this page right after your import to see detailed success and error information.
          </p>
        </div>

        {results.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">No migration results found.</p>
            <p className="text-sm text-gray-500">
              Import an Excel file from the <a href="/admin/import" className="text-blue-600 underline">Import page</a> to see results here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedResult === result
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedResult(selectedResult === result ? null : result)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-sm text-gray-500">
                        {formatTimestamp(result.timestamp)}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        result.failed === 0
                          ? 'bg-green-100 text-green-800'
                          : result.imported === 0
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {result.imported} / {result.total} imported
                        {result.failed > 0 && ` (${result.failed} failed)`}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{result.message}</p>
                  </div>
                  <div className="text-right">
                    {selectedResult === result ? (
                      <span className="text-xs text-blue-600">▼ Hide details</span>
                    ) : (
                      <span className="text-xs text-gray-500">▶ Show details</span>
                    )}
                  </div>
                </div>

                {selectedResult === result && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {/* Success Stats */}
                    {result.successful && result.successful.length > 0 && (
                      <div className="mb-4">
                        <h3 className="font-semibold text-green-700 mb-2">
                          ✅ Successfully Imported ({result.successful.length})
                        </h3>
                        <div className="bg-green-50 border border-green-200 rounded p-3 max-h-40 overflow-y-auto">
                          <div className="grid grid-cols-6 gap-2 text-xs">
                            {result.successful.map((memberNum) => (
                              <span key={memberNum} className="text-green-800">
                                #{memberNum}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Errors */}
                    {result.errors && result.errors.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-red-700 mb-2">
                          ❌ Failed Imports ({result.errors.length})
                        </h3>
                        <div className="bg-red-50 border border-red-200 rounded p-3 max-h-96 overflow-y-auto">
                          <div className="space-y-2">
                            {result.errors.map((error, errorIndex) => {
                              if (isDetailedError(error)) {
                                return (
                                  <div
                                    key={errorIndex}
                                    className="bg-white border border-red-200 rounded p-2 text-sm"
                                  >
                                    <div className="font-semibold text-red-800">
                                      Member #{error.member_number}
                                    </div>
                                    <div className="text-red-700 mt-1">{error.error}</div>
                                    {error.details && (
                                      <div className="text-xs text-gray-600 mt-1">
                                        {error.details.name && <span>Name: {error.details.name}</span>}
                                        {error.details.email && (
                                          <span className="ml-3">Email: {error.details.email}</span>
                                        )}
                                        {error.details.code && (
                                          <span className="ml-3">Code: {error.details.code}</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              } else {
                                // Legacy string format
                                return (
                                  <div
                                    key={errorIndex}
                                    className="bg-white border border-red-200 rounded p-2 text-sm text-red-700"
                                  >
                                    {error}
                                  </div>
                                );
                              }
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Total:</span>
                          <span className="ml-2 font-semibold">{result.total}</span>
                        </div>
                        <div>
                          <span className="text-green-600">Success:</span>
                          <span className="ml-2 font-semibold text-green-700">
                            {result.imported}
                          </span>
                        </div>
                        <div>
                          <span className="text-red-600">Failed:</span>
                          <span className="ml-2 font-semibold text-red-700">
                            {result.failed}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}



