import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContextRenamed';

interface Company {
  id: string;
  name: string;
}

const OpportunityForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    opportunity_type: 'tender',
    sector: '',
    deadline: '',
    budget_range: '',
    requirements: '',
    contact_email: '',
    contact_phone: '',
    company_id: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      fetchOpportunity();
    }
  }, [id]);

  const fetchOpportunity = async () => {
    try {
      const { data, error } = await supabase
        .from('business_opportunities')
        .select(`
          *,
          company:company_id (
            id,
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData(data);
        if (data.company_id) {
          setSelectedCompany(data.company_id);
        }
      }
    } catch (error) {
      console.error('Error fetching opportunity:', error);
      setError('Failed to fetch opportunity details');
    }
  };

  useEffect(() => {
    const fetchUserCompanies = async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('id, name')
          .eq('user_id', user?.id)
          .order('name');

        if (error) throw error;
        if (data) {
          setCompanies(data);
          // Only set default company if not editing and no company is selected
          if (!isEditing && !selectedCompany && data.length > 0) {
            setSelectedCompany(data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
        setError('Failed to fetch companies');
      }
    };

    if (user?.id) {
      fetchUserCompanies();
    }
  }, [user?.id, isEditing, selectedCompany]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!selectedCompany) {
        throw new Error('Please select a company');
      }

      const opportunityData = {
        ...formData,
        company_id: selectedCompany
      };

      let result;
      if (isEditing) {
        result = await supabase
          .from('business_opportunities')
          .update(opportunityData)
          .eq('id', id);
      } else {
        result = await supabase
          .from('business_opportunities')
          .insert([opportunityData]);
      }

      if (result.error) throw result.error;

      navigate('/opportunities');
    } catch (error: any) {
      console.error('Error saving opportunity:', error);
      setError(error.message || 'Failed to save opportunity');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit Business Opportunity' : 'Create Business Opportunity'}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Company</label>
          <div className="mt-1">
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select a company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
          {companies.length === 0 && (
            <p className="mt-2 text-sm text-gray-500">
              No companies found. Please{' '}
              <Link to="/directory/new" className="text-primary-600 hover:text-primary-700">
                create a company profile
              </Link>{' '}
              first.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            name="opportunity_type"
            value={formData.opportunity_type}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="tender">Tender</option>
            <option value="partnership">Partnership</option>
            <option value="investment">Investment</option>
            <option value="job">Job</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Sector</label>
          <input
            type="text"
            name="sector"
            value={formData.sector}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Deadline</label>
          <input
            type="datetime-local"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Budget Range</label>
          <input
            type="text"
            name="budget_range"
            value={formData.budget_range}
            onChange={handleChange}
            placeholder="e.g., $10,000 - $20,000"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Requirements</label>
          <textarea
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Email</label>
          <input
            type="email"
            name="contact_email"
            value={formData.contact_email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
          <input
            type="tel"
            name="contact_phone"
            value={formData.contact_phone}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/opportunities')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Opportunity' : 'Create Opportunity'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OpportunityForm;