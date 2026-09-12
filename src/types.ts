export type NotificationType = 'whatsapp' | 'email';

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  googleReviewUrl: string;
  notificationType: NotificationType;
  notificationPhone?: string;
  notificationEmail?: string;
  reviewTemplates: string[];
  createdAt: string;
  updatedAt: string;
}

export type ComplaintStatus = 'new' | 'in_progress' | 'resolved';

export interface Complaint {
  id: string;
  businessId: string;
  rating: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  feedback: string;
  status: ComplaintStatus;
  notes?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface NotificationResult {
  success: boolean;
  channel: NotificationType;
  destination: string;
  whatsappUrl?: string;
  mailtoUrl?: string;
  messagePreview: string;
  timestamp: string;
}
