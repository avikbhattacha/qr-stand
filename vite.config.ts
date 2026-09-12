import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function notificationApiPlugin(): Plugin {
  return {
    name: 'notification-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/notify-feedback', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', () => {
          try {
            const data = JSON.parse(body || '{}');
            const {
              businessName = 'Your Business',
              rating = 1,
              feedback = '',
              customerName = 'Anonymous Customer',
              customerPhone = 'Not provided',
              customerEmail = 'Not provided',
              notificationType = 'whatsapp',
              notificationPhone = '',
              notificationEmail = '',
            } = data;
            const stars = '★'.repeat(Math.max(1, Math.min(5, Number(rating) || 1)));
            const notificationMessage = `⚠️ URGENT PRIVATE FEEDBACK ALERT (${stars})\nBusiness: ${businessName}\nRating: ${rating}/5 Stars\nCustomer: ${customerName}\nPhone: ${customerPhone}\nEmail: ${customerEmail}\nFeedback Message: "${feedback}"\n\nAction Required: Please contact this customer promptly to resolve their concern.`;
            const cleanPhone = (notificationPhone || '').replace(/[^0-9]/g, '');
            const waUrl = cleanPhone
              ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(notificationMessage)}`
              : null;
            const mailtoUrl = notificationEmail
              ? `mailto:${notificationEmail}?subject=${encodeURIComponent(`[Urgent] New ${rating}-Star Customer Feedback for ${businessName}`)}&body=${encodeURIComponent(notificationMessage)}`
              : null;

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                success: true,
                channel: notificationType,
                destination: notificationType === 'whatsapp' ? notificationPhone : notificationEmail,
                whatsappUrl: waUrl,
                mailtoUrl: mailtoUrl,
                messagePreview: notificationMessage,
                timestamp: new Date().toISOString(),
              })
            );
          } catch (err: any) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err?.message || 'Invalid payload' }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), notificationApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});

