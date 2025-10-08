'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Member {
  member_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  amount_paid?: number;
  year: number;
  is_active: boolean;
  source: string;
}

interface SearchResults {
  searchCriteria: { member_number?: string; email?: string };
  members: Member[];
  count: number;
}

export default function MemberSearch() {
  const { t } = useTranslation();
  const [searchCriteria, setSearchCriteria] = useState({
    member_number: '',
    email: ''
  });
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transferring, setTransferring] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchCriteria.member_number && !searchCriteria.email) {
      setError('Please enter either member number or email');
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResults(null);

    try {
      const response = await fetch('/api/database/search-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchCriteria),
      });

      const data = await response.json();

      if (data.success) {
        setSearchResults(data.data);
      } else {
        setError(data.error || 'Search failed');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (member: Member) => {
    setTransferring(member.member_number);
    setError(null);

    try {
      const response = await fetch('/api/database/transfer-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ member }),
      });

      const data = await response.json();

      if (data.success) {
        // Remove transferred member from results
        if (searchResults) {
          setSearchResults({
            ...searchResults,
            members: searchResults.members.filter(m => m.member_number !== member.member_number),
            count: searchResults.count - 1
          });
        }
        alert('Member successfully transferred to 2026 and added to MailChimp!');
      } else {
        setError(data.error || 'Transfer failed');
      }
    } catch (err) {
      setError('Network error occurred during transfer');
      console.error('Transfer error:', err);
    } finally {
      setTransferring(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          {t('memberSearch.title')}
        </h2>
        <p className="text-gray-600 mb-6">
          {t('memberSearch.description')}
        </p>

        {/* Search Form */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('memberSearch.memberNumber')}
            </label>
            <input
              type="text"
              value={searchCriteria.member_number}
              onChange={(e) => setSearchCriteria({ ...searchCriteria, member_number: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter member number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('memberSearch.email')}
            </label>
            <input
              type="text"
              value={searchCriteria.email}
              onChange={(e) => setSearchCriteria({ ...searchCriteria, email: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email or part of email (e.g., 'gmail')"
            />
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? t('common.loading') : t('memberSearch.searchButton')}
          </button>
          
          <div className="text-sm text-gray-500 text-center">
            💡 <strong>Tip:</strong> You can search with partial emails (e.g., "gmail" finds all Gmail addresses)
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchResults && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {t('memberSearch.foundMember')} ({searchResults.count})
          </h3>

          {searchResults.members.length === 0 ? (
            <p className="text-gray-600">{t('memberSearch.noResults')}</p>
          ) : (
            <div className="space-y-4">
              {searchResults.members.map((member) => (
                <div key={member.member_number} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {member.first_name} {member.last_name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        <strong>Member #:</strong> {member.member_number}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Email:</strong> {member.email}
                      </p>
                      {member.phone && (
                        <p className="text-sm text-gray-600">
                          <strong>Phone:</strong> {member.phone}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => handleTransfer(member)}
                        disabled={transferring === member.member_number}
                        className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
                      >
                        {transferring === member.member_number ? t('common.loading') : t('memberSearch.transferButton')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
