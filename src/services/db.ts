import { Business, Complaint, ComplaintStatus } from '../types';

export const DEMO_BUSINESS_ID = 'demo-business';

export async function getBusiness(idOrSlug: string): Promise<Business | null> {
  return null;
}

export async function saveBusiness(business: Business): Promise<void> {
  localStorage.setItem(`rp_business_${business.id}`, JSON.stringify(business));
}

export async function submitComplaint(complaint: Complaint): Promise<void> {
  const existing = JSON.parse(localStorage.getItem(`rp_complaints_${complaint.businessId}`) || '[]');
  localStorage.setItem(`rp_complaints_${complaint.businessId}`, JSON.stringify([complaint, ...existing]));
}

export function subscribeToComplaints(
  businessId: string,
  callback: (complaints: Complaint[]) => void
) {
  const data = JSON.parse(localStorage.getItem(`rp_complaints_${businessId}`) || '[]');
  callback(data);
  return () => {};
}

export async function updateComplaintStatus(
  businessId: string,
  complaintId: string,
  status: ComplaintStatus,
  notes?: string
): Promise<void> {
  const list: Complaint[] = JSON.parse(localStorage.getItem(`rp_complaints_${businessId}`) || '[]');
  const updated = list.map((c) => (c.id === complaintId ? { ...c, status, notes: notes || c.notes } : c));
  localStorage.setItem(`rp_complaints_${businessId}`, JSON.stringify(updated));
}
