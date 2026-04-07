// Servicio de notificacion por WhatsApp
// Numero del negocio (formato internacional sin +)
const BUSINESS_PHONE = '18097535382';

export const whatsappService = {
  notifyNewOrder(order, cart, customerInfo, total, paymentMethod) {
    const productsList = cart.map(function(item) {
      return item.quantity + 'x ' + item.name;
    }).join(', ');

    const lines = [
      'NUEVO PEDIDO ONLINE',
      '',
      'Pedido: #' + order.id,
      'Cliente: ' + customerInfo.name,
      'Tel: ' + customerInfo.phone,
    ];

    if (customerInfo.email) lines.push('Email: ' + customerInfo.email);
    if (customerInfo.address) lines.push('Direccion: ' + customerInfo.address);

    lines.push('');
    lines.push('Productos: ' + productsList);
    lines.push('Total: $' + total.toFixed(2));
    lines.push('Pago: ' + paymentMethod);

    if (customerInfo.notes) lines.push('Notas: ' + customerInfo.notes);

    const message = lines.join('\n');
    const url = 'https://api.whatsapp.com/send?phone=' + BUSINESS_PHONE + '&text=' + encodeURIComponent(message);

    // Usar un <a> click para evitar bloqueo de popups
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
