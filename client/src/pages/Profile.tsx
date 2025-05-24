import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { planService } from '../utils/apiService';
import { Plan } from '../types/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { analyticsService } from '../utils/apiService';

interface PlanProps {
  plan: Plan;
  onEdit: (plan: Plan) => void;
  onDelete: (planId: string) => void;
  onDownload: (plan: Plan) => void;
}

const PlanCard = ({ plan, onEdit, onDelete, onDownload }: PlanProps) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Plan for {plan.location}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {plan.disasterType} • Created {new Date(plan.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onDownload(plan)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Download PDF
          </button>
          <button
            onClick={() => onEdit(plan)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(plan.id)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <div className="prose max-w-none prose-blue">
          <div className="whitespace-pre-wrap">{plan.content}</div>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editPlanId, setEditPlanId] = React.useState<string | null>(null);
  const [editPlanContent, setEditPlanContent] = React.useState<string>('');
  
  // Fetch user's plans
  React.useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const data = await planService.getPlans();
        setPlans(data);
        setError(null);
      } catch (err) {
        setError('Failed to load your emergency plans. Please try again later.');
        console.error('Error fetching plans:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlans();
  }, [isAuthenticated, navigate]);
  
  // Start editing a plan
  const handleEditPlan = (plan: Plan) => {
    setEditPlanId(plan.id);
    setEditPlanContent(plan.content);
  };
  
  // Save edited plan
  const handleSavePlan = async () => {
    if (!editPlanId) return;
    
    try {
      await planService.updatePlan(editPlanId, { content: editPlanContent });
      
      // Update plans in state
      setPlans(plans.map((plan: Plan) => 
        plan.id === editPlanId 
          ? { ...plan, content: editPlanContent, updatedAt: new Date().toISOString() } 
          : plan
      ));
      
      // Reset edit state
      setEditPlanId(null);
      setEditPlanContent('');
    } catch (err) {
      setError('Failed to save your changes. Please try again.');
      console.error('Error updating plan:', err);
    }
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setEditPlanId(null);
    setEditPlanContent('');
  };
  
  // Delete a plan
  const handleDeletePlan = async (planId: string) => {
    if (window.confirm('Are you sure you want to delete this emergency plan?')) {
      try {
        await planService.deletePlan(planId);
        setPlans(plans.filter((plan: Plan) => plan.id !== planId));
      } catch (err) {
        setError('Failed to delete the plan. Please try again.');
        console.error('Error deleting plan:', err);
      }
    }
  };
  
  // Download plan as PDF
  const handleDownloadPDF = async (plan: Plan) => {
    // Create reference for the plan to convert
    const planElement = document.createElement('div');
    planElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #1e3a8a;">Emergency Response Plan</h1>
        <h2>Location: ${plan.location}</h2>
        <h3>Disaster Type: ${plan.disasterType}</h3>
        <p>Created: ${new Date(plan.createdAt).toLocaleString()}</p>
        ${plan.updatedAt ? `<p>Updated: ${new Date(plan.updatedAt).toLocaleString()}</p>` : ''}
        <hr style="margin: 20px 0;" />
        <div style="white-space: pre-wrap;">${plan.content}</div>
      </div>
    `;
    
    document.body.appendChild(planElement);
    
    try {
      // Track analytics
      analyticsService.trackDisasterType(plan.disasterType);
      
      // Generate PDF
      const canvas = await html2canvas(planElement, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`ResQ-Plan-${plan.location}-${plan.disasterType}.pdf`);
    } catch (err) {
      setError('Failed to generate PDF. Please try again.');
      console.error('Error generating PDF:', err);
    } finally {
      // Clean up
      document.body.removeChild(planElement);
    }
  };
  
  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditPlanContent(e.target.value);
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Loading your emergency plans...</h2>
            <div className="mt-6 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Your Emergency Plans
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Manage and access your saved response plans
          </p>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Plans list */}
        {plans.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No plans found</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't created any emergency plans yet.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create a new plan
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {plans.map((plan: Plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onEdit={handleEditPlan}
                onDelete={handleDeletePlan}
                onDownload={handleDownloadPDF}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 