'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import UserLayout from '@/components/UserLayout';

interface MemberFormData {
  member_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  amount_paid: number;
  year: number;
  database: '2025' | '2026';
}

export default function AddMemberPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<MemberFormData>({
    member_number: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    amount_paid: 35,
    year: 2025,
    database: '2025'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount_paid' ? parseFloat(value) || 0 : value
    }));
  };

  const handleDatabaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const database = e.target.value as '2025' | '2026';
    setFormData(prev => ({
      ...prev,
      database,
      year: database === '2025' ? 2025 : 2026
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/database/add-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Member successfully added to ${formData.database} database${formData.database === '2026' ? ' and MailChimp!' : '!'}`);
        setFormData({
          member_number: '',
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          amount_paid: 35,
          year: formData.database === '2025' ? 2025 : 2026,
          database: formData.database
        });
      } else {
        setError(data.error || 'Failed to add member');
      }
    } catch (err) {
      setError('Network error occurred while adding member');
      console.error('Add member error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('addMember.title')}</h1>
            <p className="text-gray-600">
              {t('addMember.description')}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Database Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('addMember.targetDatabase')}
              </label>
              <select
                name="database"
                value={formData.database}
                onChange={handleDatabaseChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="2025">{t('addMember.database2025')}</option>
                <option value="2026">{t('addMember.database2026')}</option>
              </select>
              {formData.database === '2026' && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ {t('addMember.mailchimpSync')}
                </p>
              )}
            </div>

            {/* Member Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('addMember.memberNumber')} *
              </label>
              <input
                type="text"
                name="member_number"
                value={formData.member_number}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('addMember.memberNumberPlaceholder')}
                required
              />
            </div>

            {/* Name Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('addMember.firstName')} *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('addMember.firstNamePlaceholder')}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('addMember.lastName')} *
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('addMember.lastNamePlaceholder')}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('addMember.email')} *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('addMember.emailPlaceholder')}
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('addMember.phone')}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('addMember.phonePlaceholder')}
              />
            </div>

            {/* Amount Paid */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('addMember.amountPaid')}
              </label>
              <select
                name="amount_paid"
                value={formData.amount_paid}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={20}>€20</option>
                <option value={35}>€35</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? t('addMember.adding') : t('addMember.addButton')}
              </button>
              
              <div className="text-sm text-gray-500">
                {formData.database === '2026' && (
                  <span className="text-green-600">✓ {t('addMember.willSync')}</span>
                )}
              </div>
            </div>
          </form>

          {/* Success Message */}
          {success && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-700">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
