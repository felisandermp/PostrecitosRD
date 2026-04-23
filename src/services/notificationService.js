import emailjs from '@emailjs/browser';

// ============ CONFIGURACION EMAILJS ============
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_CUSTOMER_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_CUSTOMER_TEMPLATE_ID || EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

// ============ CONFIGURACION TELEGRAM ============
const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID || '';

const STATUS_MESSAGES = {
  pendiente: 'Tu pedido ha sido recibido y esta pendiente de confirmacion.',
  confirmado: 'Tu pedido ha sido confirmado. Pronto comenzaremos a prepararlo.',
  en_preparacion: 'Tu pedido esta siendo preparado con mucho carino.',
  listo: 'Tu pedido esta listo y sera entregado pronto.',
  entregado: 'Tu pedido ha sido entregado. Por favor confirma la recepcion en tu panel de pedidos.',
  cerrado: 'Gracias por confirmar la entrega. Esperamos que disfrutes tu pedido.',
  cancelado: 'Tu pedido ha sido cancelado. Si tienes dudas, contactanos.'
};

const STATUS_LABELS = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  en_preparacion: 'En Preparacion',
  listo: 'Listo para Entrega',
  entregado: 'Entregado',
  cerrado: 'Cerrado',
  cancelado: 'Cancelado'
};

export const notificationService = {
  isConfigured() {
    return EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY;
  },

  // Enviar email al CLIENTE sobre su pedido
  async sendCustomerEmail(customerEmail, customerName, orderId, productsList, total, status, message) {
    if (!this.isConfigured() || !customerEmail) {
      console.log('[Email Cliente] No configurado o sin email. Simulado para:', customerEmail);
      return { skipped: true };
    }
    try {
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_CUSTOMER_TEMPLATE_ID,
        {
          to_email: customerEmail,
          customer_name: customerName || 'Cliente',
          order_id: orderId,
          products: productsList,
          total: '$' + total,
          status: status,
          message: message,
          store_name: 'Postrecitos de Mama',
          store_phone: '(809) 753-5382'
        },
        EMAILJS_PUBLIC_KEY
      );
      console.log('[Email Cliente] Enviado a ' + customerEmail);
      return { sent: true, status: response.status };
    } catch (error) {
      console.error('[Email Cliente] Error:', error);
      return { error: true, message: error.text || error.message };
    }
  },

  // Enviar email de cambio de estado (al admin)
  async sendStatusEmail(order, newStatus) {
    if (!this.isConfigured()) {
      console.log('[Email] No configurado. Simulado - Pedido #' + order.id + ' -> ' + STATUS_LABELS[newStatus]);
      return { simulated: true };
    }
    if (!order.customer?.email) return { skipped: true, reason: 'no_email' };
    try {
      const productsList = order.products.map(function(p) { return p.quantity + 'x ' + p.name; }).join(', ');
      const response = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        order_id: order.id,
        customer_name: order.customer.name || 'Cliente',
        customer_email: order.customer.email,
        status: STATUS_LABELS[newStatus],
        status_message: STATUS_MESSAGES[newStatus],
        products: productsList,
        total: '$' + order.total.toFixed(2),
        store_name: 'Postrecitos de Mama'
      }, EMAILJS_PUBLIC_KEY);
      console.log('[Email] Enviado:', response.status);
      return { sent: true };
    } catch (error) {
      console.error('[Email] Error:', error);
      return { error: true };
    }
  },

  // Toast in-app
  showToast(message, type) {
    var toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    var colors = { success: '#198754', info: '#0dcaf0', warning: '#ffc107', error: '#dc3545' };
    var toast = document.createElement('div');
    toast.style.cssText = 'background:' + (colors[type] || colors.info) + ';color:white;padding:12px 20px;border-radius:8px;margin-bottom:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:flex;align-items:center;gap:8px;animation:slideIn 0.3s ease;font-size:14px;max-width:350px;';
    toast.innerHTML = '<i class="bi bi-bell-fill"></i> ' + message;
    toastContainer.appendChild(toast);
    setTimeout(function() { toast.style.animation = 'slideOut 0.3s ease'; setTimeout(function() { toast.remove(); }, 300); }, 4000);
  },

  // Notificar cambio de estado (admin cambia estado -> email al cliente + toast)
  async notifyStatusChange(order, newStatus) {
    var label = STATUS_LABELS[newStatus] || newStatus;
    this.showToast('Pedido #' + order.id + ' -> ' + label, newStatus === 'cancelado' ? 'error' : 'success');

    // Email al cliente cuando cambia el estado
    if (order.customer?.email && (newStatus === 'entregado' || newStatus === 'confirmado' || newStatus === 'listo' || newStatus === 'cancelado')) {
      var productsList = order.products.map(function(p) { return p.quantity + 'x ' + p.name; }).join(', ');
      await this.sendCustomerEmail(
        order.customer.email,
        order.customer.name,
        order.id,
        productsList,
        order.total.toFixed(2),
        label,
        STATUS_MESSAGES[newStatus]
      );
    }

    return await this.sendStatusEmail(order, newStatus);
  },

  // Push Notification
  async requestPushPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    return (await Notification.requestPermission()) === 'granted';
  },

  sendPushNotification(title, body) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try { new Notification(title, { body: body, icon: '/logo.png', tag: 'new-order' }); } catch (e) {}
  },

  // Telegram
  async sendTelegram(message) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.log('[Telegram] No configurado');
      return { skipped: true };
    }
    try {
      var url = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';
      var res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'HTML' })
      });
      var data = await res.json();
      if (data.ok) { console.log('[Telegram] Enviado'); return { sent: true }; }
      console.error('[Telegram] Error:', data.description);
      return { error: true };
    } catch (error) {
      console.error('[Telegram] Error de red:', error);
      return { error: true };
    }
  },

  // Notificar al admin cuando llega un pedido nuevo + email confirmacion al cliente
  async notifyNewOrderToAdmin(order, cart, customerInfo, total, paymentMethod) {
    var productsList = cart.map(function(item) { return item.quantity + 'x ' + item.name; }).join(', ');

    // 1. Push al navegador
    this.sendPushNotification('Nuevo Pedido Online #' + order.id, customerInfo.name + ' - $' + total.toFixed(2) + ' - ' + productsList);

    // 2. Email al admin
    if (this.isConfigured()) {
      try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          order_id: order.id,
          customer_name: customerInfo.name || 'Cliente',
          customer_email: customerInfo.email || 'No proporcionado',
          status: 'Nuevo Pedido',
          status_message: 'Nuevo pedido online. Cliente: ' + customerInfo.name + ', Tel: ' + customerInfo.phone + ', Productos: ' + productsList + ', Total: $' + total.toFixed(2) + ', Pago: ' + paymentMethod,
          products: productsList,
          total: '$' + total.toFixed(2),
          store_name: 'Postrecitos de Mama'
        }, EMAILJS_PUBLIC_KEY);
        console.log('[Email Admin] Nuevo pedido notificado');
      } catch (error) {
        console.error('[Email Admin] Error:', error);
      }
    }

    // 3. Email de confirmacion al CLIENTE
    if (customerInfo.email) {
      await this.sendCustomerEmail(
        customerInfo.email,
        customerInfo.name,
        order.id,
        productsList,
        total.toFixed(2),
        'Pedido Recibido',
        'Hemos recibido tu pedido y lo estamos procesando. Te notificaremos cuando este listo para entrega. Gracias por tu compra!'
      );
    }

    // 4. Telegram
    var telegramMsg = '\u{1F195} <b>Nuevo Pedido Online</b>\n\n'
      + '\u{1F4CB} <b>Pedido:</b> #' + order.id + '\n'
      + '\u{1F464} <b>Cliente:</b> ' + customerInfo.name + '\n'
      + '\u{1F4DE} <b>Tel:</b> ' + customerInfo.phone + '\n'
      + (customerInfo.email ? '\u{1F4E7} <b>Email:</b> ' + customerInfo.email + '\n' : '')
      + (customerInfo.address ? '\u{1F4CD} <b>Dir:</b> ' + customerInfo.address + '\n' : '')
      + '\n\u{1F6D2} <b>Productos:</b> ' + productsList + '\n'
      + '\n\u{1F4B0} <b>Total: $' + total.toFixed(2) + '</b>\n'
      + '\u{1F4B3} <b>Pago:</b> ' + paymentMethod
      + (customerInfo.notes ? '\n\u{1F4DD} <b>Notas:</b> ' + customerInfo.notes : '');
    this.sendTelegram(telegramMsg);

    // 5. Sonido
    try {
      var audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbsGczHjqIxN/Uu2BFLVF8rNjVwHxSQFZ0l8fNwIRiVWBvhq+3sYlwZGlxfIqbm5eLgHhxcnR8hI2NjYuFfnl2dXZ5foWLjY2Lh4F8eHZ1dnh+hYuNjYuHgXx4dnV2eH6Fi42Ni4eBfHh2dXZ4foWLjY2Lh4F8eHZ1dnh+hYuNjYuHgXx4dnV2eH6Fi42Ni4eBfA==');
      audio.volume = 0.3;
      audio.play().catch(function() {});
    } catch (e) {}
  }
};
