import { NotificationResult, NotificationType } from '../types';

export interface SendFeedbackNotificationParams {
  businessName: string;
  rating: number;
  feedback: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  notificationType: NotificationType;
  notificationPhone?: string;
  notificationEmail?: string;
}

export async function sendFeedbackNotification(
  params: SendFeedbackNotificationParams
): Promise<NotificationResult> {
  const msg = `URGENT PRIVATE FEEDBACK\nBusiness: ${params.businessName}\nRating: ${params.rating}/5 Stars\nFeedback: "${params.feedback}"`;
  const cleanPhone = (params.notificationPhone || '').replace(/[^0-9]/g, '');
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}` : undefined;

  return {
    success: true,
    channel: params.notificationType,
    destination: params.notificationType === 'whatsapp' ? params.notificationPhone || '' : params.notificationEmail || '',
    whatsappUrl: waUrl,
    messagePreview: msg,
    timestamp: new Date().toISOString(),
  };
}
