import emailjs from '@emailjs/browser';

// ============ CONFIGURACION EMAILJS ============
// Crea tu cuenta en https://www.emailjs.com/
// 1. Conecta tu servicio de email (Gmail, Outlook, etc.)
// 2. Crea un template con estas variables: {{order_id}}, {{customer_name}}, {{customer_email}}, {{status}}, {{status_message}}, {{products}}, {{total}}, {{store_name}}
// 3. Pon tus credenciales en el .env

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

// ============ CONFIGURACION TELEGRAM ============
const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID || '';

const STATUS_MESSAGES = {
  pendiente: 'Tu pedido ha sido recibido y está pendiente de confirmación.',
  confirmado: 'Tu pedido ha sido confirmado. Pronto comenzaremos a prepararlo.',
  en_preparacion: 'Tu pedido está siendo preparado con mucho cariño.',
  listo: 'Tu pedido está listo y será entregado pronto.',
  entregado: 'Tu pedido ha sido entregado. Por favor confirma la recepción en tu panel de pedidos.',
  cerrado: '¡Gracias por confirmar la entrega! Esperamos que disfrutes tu pedido.',
  cancelado: 'Tu pedido ha sido cancelado. Si tienes dudas, contáctanos.'
};

const STATUS_LABELS = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  en_preparacion: 'En Preparación',
  listo: 'Listo para Entrega',
  entregado: 'Entregado',
  cerrado: 'Cerrado',
  cancelado: 'Cancelado'
};

export const notificationService = {
  isConfigured() {
    return EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY;
  },

  async sendStatusEmail(order, newStatus) {
    if (!this.isConfigured()) {
      console.log('[Notificacion] EmailJS no configurado. Email simulado:');
      console.log(`  Para: ${order.customer?.email}`);
      console.log(`  Pedido: #${order.id}`);
      console.log(`  Estado: ${STATUS_LABELS[newStatus]}`);
      console.log(`  Mensaje: ${STATUS_MESSAGES[newStatus]}`);
      return { simulated: true, status: newStatus };
    }

    if (!order.customer?.email) {
      console.log('[Notificacion] El cliente no tiene email registrado');
      return { skipped: true, reason: 'no_email' };
    }

    try {
      const productsList = order.products
        .map(p => `${p.quantity}x ${p.name}`)
        .join(', ');

      const templateParams = {
        order_id: order.id,
        customer_name: order.customer.name || 'Cliente',
        customer_email: order.customer.email,
        status: STATUS_LABELS[newStatus],
        status_message: STATUS_MESSAGES[newStatus],
        products: productsList,
        total: '$' + order.total.toFixed(2),
        store_name: 'Postrecitos de Mama'
      };

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      console.log('[Notificacion] Email enviado:', response.status);
      return { sent: true, status: response.status };
    } catch (error) {
      console.error('[Notificacion] Error al enviar email:', error);
      return { error: true, message: error.text || error.message };
    }
  },

  // Notificacion in-app (toast)
  showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const colors = {
      success: '#198754',
      info: '#0dcaf0',
      warning: '#ffc107',
      error: '#dc3545'
    };

    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.style.cssText = `
      background: ${colors[type] || colors.info};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      margin-bottom: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      gap: 8px;
      animation: slideIn 0.3s ease;
      font-size: 14px;
      max-width: 350px;
    `;
    toast.innerHTML = `<i class="bi bi-bell-fill"></i> ${message}`;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  // Notificar cambio de estado completo (email + toast)
  async notifyStatusChange(order, newStatus) {
    const label = STATUS_LABELS[newStatus] || newStatus;

    // Toast in-app
    this.showToast(
      `Pedido #${order.id} → ${label}`,
      newStatus === 'cancelado' ? 'error' : 'success'
    );

    // Email
    const result = await this.sendStatusEmail(order, newStatus);
    return result;
  },

  // Push Notification del navegador
  async requestPushPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  sendPushNotification(title, body) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      new Notification(title, {
        body,
        icon: '/logo.png',
        badge: '/logo.png',
        tag: 'new-order'
      });
    } catch (e) {
      console.log('[Push] No se pudo enviar notificacion:', e);
    }
  },

  // Enviar mensaje por Telegram
  async sendTelegram(message) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.log('[Telegram] No configurado. Mensaje:', message);
      return { skipped: true };
    }
    try {
      const url = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        })
      });
      const data = await res.json();
      if (data.ok) {
        console.log('[Telegram] Mensaje enviado');
        return { sent: true };
      } else {
        console.error('[Telegram] Error:', data.description);
        return { error: true, message: data.description };
      }
    } catch (error) {
      console.error('[Telegram] Error de red:', error);
      return { error: true, message: error.message };
    }
  },

  // Notificar al admin cuando llega un pedido nuevo
  async notifyNewOrderToAdmin(order, cart, customerInfo, total, paymentMethod) {
    const productsList = cart.map(function(item) {
      return item.quantity + 'x ' + item.name;
    }).join(', ');

    // 1. Push Notification al navegador
    this.sendPushNotification(
      'Nuevo Pedido Online #' + order.id,
      customerInfo.name + ' - $' + total.toFixed(2) + ' - ' + productsList
    );

    // 2. Email al admin via EmailJS
    if (this.isConfigured()) {
      try {
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          {
            order_id: order.id,
            customer_name: customerInfo.name || 'Cliente',
            customer_email: customerInfo.email || 'No proporcionado',
            status: 'Nuevo Pedido',
            status_message: 'Se ha recibido un nuevo pedido online. Cliente: ' + customerInfo.name + ', Tel: ' + customerInfo.phone + ', Productos: ' + productsList + ', Total: $' + total.toFixed(2) + ', Pago: ' + paymentMethod,
            products: productsList,
            total: '$' + total.toFixed(2),
            store_name: 'Postrecitos de Mama'
          },
          EMAILJS_PUBLIC_KEY
        );
        console.log('[Notificacion] Email de nuevo pedido enviado al admin');
      } catch (error) {
        console.error('[Notificacion] Error al enviar email:', error);
      }
    } else {
      console.log('[Notificacion] Nuevo pedido #' + order.id + ' - EmailJS no configurado');
    }

    // 3. Telegram
    const telegramMsg = '🆕 <b>Nuevo Pedido Online</b>\n\n'
      + '📋 <b>Pedido:</b> #' + order.id + '\n'
      + '👤 <b>Cliente:</b> ' + customerInfo.name + '\n'
      + '📞 <b>Tel:</b> ' + customerInfo.phone + '\n'
      + (customerInfo.email ? '📧 <b>Email:</b> ' + customerInfo.email + '\n' : '')
      + (customerInfo.address ? '📍 <b>Dir:</b> ' + customerInfo.address + '\n' : '')
      + '\n🛒 <b>Productos:</b> ' + productsList + '\n'
      + '\n💰 <b>Total: $' + total.toFixed(2) + '</b>\n'
      + '💳 <b>Pago:</b> ' + paymentMethod
      + (customerInfo.notes ? '\n📝 <b>Notas:</b> ' + customerInfo.notes : '');
    this.sendTelegram(telegramMsg);

    // 4. Sonido de notificacion
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbsGczHjqIxN/Uu2BFLVF8rNjVwHxSQFZ0l8fNwIRiVWBvhq+3sYlwZGlxfIqbm5eLgHhxcnR8hI2NjYuFfnl2dXZ5foWLjY2Lh4F8eHZ1dnh+hYuNjYuHgXx4dnV2eH6Fi42Ni4eBfHh2dXZ4foWLjY2Lh4F8eHZ1dnh+hYuNjYuHgXx4dnV2eH6Fi42Ni4eBfA==');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (e) {}
  }
};
