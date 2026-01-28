import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_9DoThPFV_7m8LSqFDmRmL9ZDXTy5ZZsSB');

interface OrderEmailData {
  orderId: string;
  stripeSessionId?: string;
  customerName: string | null;
  customerEmail: string | null;
  cartItems: any[];
  subtotal: number;
  shipping: number;
  vat: number;
  total: number;
  createdAt: string;
  locale?: 'es' | 'en';
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  try {
    const email = data.customerEmail;
    if (!email) {
      console.warn('No email address provided for order confirmation');
      return;
    }

    const locale = data.locale || 'es';
    // Usar stripeSessionId con prefijo NOMA si está disponible
    const orderId = data.stripeSessionId 
      ? `NOMA${data.stripeSessionId.replace(/^cs_test_|^cs_live_/, '').toUpperCase().slice(0, 12)}`
      : data.orderId.slice(0, 12).toUpperCase();
    const customerName = data.customerName || 'Cliente';
    
    // Obtener URL base para imágenes y links
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                    process.env.NEXT_PUBLIC_VERCEL_URL || 
                    'http://localhost:3000';

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const subject = locale === 'es'  ? `Confirmación de Pedido #${orderId} - Nomadigma`: `Order Confirmation #${orderId} - Nomadigma`;

    // Función helper para obtener imagen del producto
    const getProductImage = (item: any) => {
      if (item.productImages && item.productImages.length > 0) {
        const img = item.productImages[0];
        if (img.startsWith('http')) return img;
        if (img.startsWith('/')) return `${baseUrl}${img}`;
        return `${baseUrl}/media/store/client/600x600/${img}`;
      }
      if (item.logo) {
        if (item.logo.startsWith('http')) return item.logo;
        if (item.logo.startsWith('/')) return `${baseUrl}${item.logo}`;
        return `${baseUrl}/media/store/client/600x600/${item.logo}`;
      }
      return null;
    };

    // Función helper para obtener links de descarga (igual que en OrderItems)
    const getDownloadLinks = (item: any) => {
      if (item.productType !== 'DIGITAL' || !item.variantFiles) return [];
      
      const downloadLinks: Array<{ url: string; label: string }> = [];
      
      try {
        const variantFiles = Array.isArray(item.variantFiles)
          ? item.variantFiles
          : Object.entries(item.variantFiles || {}).map(([value, url]: [string, any]) => ({
              values: [value],
              type: 'url',
              url: url
            }));
        
        // Buscar archivos que coincidan con las variaciones seleccionadas
        const selectedVariants = item.selectedVariants || {};
        const selectedValues = Object.values(selectedVariants);
        
        variantFiles.forEach((vf: any) => {
          if (vf.url && (vf.type === 'url' || vf.type === 'file')) {
            // Si los valores de la variante coinciden con los seleccionados
            const vfValues = Array.isArray(vf.values) ? vf.values : [];
            const matches = vfValues.some((val: string) => selectedValues.includes(val));
            
            // Incluir si coincide con las variaciones seleccionadas O si no hay valores en la variante
            if (matches || vfValues.length === 0) {
              const url = vf.url.startsWith('http') 
                ? vf.url 
                : (vf.url.startsWith('/') ? `${baseUrl}${vf.url}` : `${baseUrl}/${vf.url}`);
              const label = vfValues.length > 0 
                ? vfValues.join(', ') 
                : (locale === 'es' ? 'Descargar' : 'Download');
              downloadLinks.push({ url, label });
            }
          }
        });
      } catch (error) {
        console.error('Error processing variant files:', error);
      }
      
      return downloadLinks;
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: white; margin: 0; padding: 0;">
          <div style="max-width: 800px; margin: 0 auto; background: white; border-radius: 0; overflow: hidden;">
            <!-- Progress Bar -->
            <div style="height: 8px; background: linear-gradient(90deg, #D618A3 0%, #1951E0 32.67%, #12C79C 67.17%, #DFBB19 100%);"></div>
            
            <!-- Header -->
            <div style="padding: 40px 24px; text-align: center;">
              <h2 style="margin: 0 auto 10px auto; font-size: 24px; color: #1a1a1a; font-weight: 600; text-align: center;">
                ${locale === 'es' ? 'Confirmación de Pedido' : 'Order Confirmation'}
              </h2>
              <p style="margin: 0 auto; font-size: 14px; color: #666; text-align: center;">
                ${locale === 'es' ? '¡Gracias! Tu pedido' : 'Thank you! Your order'}
                <strong style="color: #1a1a1a;">#${orderId}</strong>
                ${locale === 'es' 
                  ? 'está confirmado y siendo procesado.' 
                  : 'is confirmed and being processed.'}
              </p>
            </div>

            <!-- Order Summary -->
            <div style="background: #f5f5f5; padding: 20px 28px; margin: 0 24px; border: 1px solid #e5e5e5; border-radius: 8px;">
              <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #1a1a1a;">
                ${locale === 'es' ? 'Resumen del Pedido' : 'Order Summary'}
              </h3>
              <div style="display: table; width: 100%; border-collapse: collapse;">
                <div style="display: table-row;">
                  <div style="display: table-cell; padding: 8px 0; vertical-align: top; width: 40%;">
                    <span style="font-size: 12px; color: #666; font-weight: 400;">
                      ${locale === 'es' ? 'Pedido realizado' : 'Order placed'}
                    </span>
                  </div>
                  <div style="display: table-cell; padding: 8px 0; vertical-align: top;">
                    <span style="font-size: 14px; font-weight: 500; color: #1a1a1a;">
                      ${formatDate(data.createdAt)}
                    </span>
                  </div>
                </div>
                ${customerName ? `
                <div style="display: table-row;">
                  <div style="display: table-cell; padding: 8px 0; vertical-align: top;">
                    <span style="font-size: 12px; color: #666; font-weight: 400;">
                      ${locale === 'es' ? 'Enviar a' : 'Ship to'}
                    </span>
                  </div>
                  <div style="display: table-cell; padding: 8px 0; vertical-align: top;">
                    <span style="font-size: 14px; font-weight: 500; color: #1a1a1a;">
                      ${customerName}
                    </span>
                  </div>
                </div>
                ` : ''}
                <div style="display: table-row;">
                  <div style="display: table-cell; padding: 8px 0; vertical-align: top;">
                    <span style="font-size: 12px; color: #666; font-weight: 400;">
                      ${locale === 'es' ? 'Subtotal' : 'Subtotal'}
                    </span>
                  </div>
                  <div style="display: table-cell; padding: 8px 0; vertical-align: top;">
                    <span style="font-size: 14px; font-weight: 500; color: #1a1a1a;">
                      $${data.subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
                ${data.shipping > 0 ? `
                <div style="display: table-row;">
                  <div style="display: table-cell; padding: 8px 0; vertical-align: top;">
                    <span style="font-size: 12px; color: #666; font-weight: 400;">
                      ${locale === 'es' ? 'Envío' : 'Shipping'}
                    </span>
                  </div>
                  <div style="display: table-cell; padding: 8px 0; vertical-align: top;">
                    <span style="font-size: 14px; font-weight: 500; color: #1a1a1a;">
                      $${data.shipping.toFixed(2)}
                    </span>
                  </div>
                </div>
                ` : ''}
                ${data.vat > 0 ? `
                <div style="display: table-row;">
                  <div style="display: table-cell; padding: 8px 0; vertical-align: top;">
                    <span style="font-size: 12px; color: #666; font-weight: 400;">
                      ${locale === 'es' ? 'IVA' : 'VAT'}
                    </span>
                  </div>
                  <div style="display: table-cell; padding: 8px 0; vertical-align: top;">
                    <span style="font-size: 14px; font-weight: 500; color: #1a1a1a;">
                      $${data.vat.toFixed(2)}
                    </span>
                  </div>
                </div>
                ` : ''}
                <div style="display: table-row; border-top: 1px solid #d5d5d5; margin-top: 8px;">
                  <div style="display: table-cell; padding: 12px 0 8px 0; vertical-align: top;">
                    <span style="font-size: 14px; color: #1a1a1a; font-weight: 600;">
                      ${locale === 'es' ? 'Total' : 'Total'}
                    </span>
                  </div>
                  <div style="display: table-cell; padding: 12px 0 8px 0; vertical-align: top;">
                    <span style="font-size: 18px; font-weight: 700; color: #1a1a1a;">
                      $${data.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Products -->
            <div style="padding: 20px 24px;">
              ${data.cartItems.map((item: any) => {
                const productImage = getProductImage(item);
                const downloadLinks = getDownloadLinks(item);
                const isDigital = item.productType === 'DIGITAL';
                const selectedVariants = item.selectedVariants || {};
                const hasVariants = Object.keys(selectedVariants).length > 0;
                
                return `
                  <div style="background: white; border: 1px solid #e5e5e5; border-radius: 0; padding: 16px; margin-bottom: 20px;">
                    <div style="display: flex; gap: 14px; align-items: flex-start;">
                      ${productImage ? `
                        <div style="width: 70px; height: 70px; flex-shrink: 0; border-radius: 4px; overflow: hidden; background: #f5f5f5;">
                          <img src="${productImage}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: contain; display: block;" />
                        </div>
                      ` : ''}
                      <div style="flex: 1; min-width: 0;">
                        <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 500; color: #1a1a1a; line-height: 1.4;">
                          ${item.title}
                        </h3>
                        ${hasVariants ? `
                          <div style="margin-bottom: 8px;">
                            ${Object.entries(selectedVariants).map(([label, value]) => `
                              <div style="font-size: 12px; color: #1a1a1a; margin-bottom: 4px;">
                                <span style="font-weight: 500;">${label}:</span> <span style="color: #666;">${value}</span>
                              </div>
                            `).join('')}
                          </div>
                        ` : ''}
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                          <span style="font-size: 12px; color: #666; font-weight: 400;">
                            ${item.quantity}x
                          </span>
                          <span style="font-size: 14px; font-weight: 600; color: #1a1a1a;">
                            $${parseFloat(item.total).toFixed(2)}
                          </span>
                        </div>
                        ${isDigital && item.variantFiles ? `
                          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
                            <h4 style="font-size: 12px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px;">
                              ${locale === 'es' ? 'Archivos descargables' : 'Downloadable files'}
                            </h4>
                            ${downloadLinks.length > 0 ? downloadLinks.map((link: any, idx: number) => `
                              <a href="${link.url}" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: #1a1a1a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500; border: none; cursor: pointer; margin-bottom: ${idx < downloadLinks.length - 1 ? '10px' : '0'};">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                  <polyline points="7 10 12 15 17 10"></polyline>
                                  <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                <span>${locale === 'es' ? 'Descargar' : 'Download'}${downloadLinks.length > 1 && link.label ? ` (${link.label})` : ''}</span>
                              </a>
                            `).join('') : `
                              <p style="font-size: 12px; color: #666; font-style: italic; margin: 0;">
                                ${locale === 'es' ? 'No hay archivos disponibles para descargar' : 'No files available for download'}
                              </p>
                            `}
                          </div>
                        ` : ''}
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Footer -->
            <div style="padding: 20px 24px; background: #f9f9f9; border-top: 1px solid #e5e5e5; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6;">
                ${locale === 'es' 
                  ? 'Si tienes alguna pregunta, no dudes en contactarnos.' 
                  : 'If you have any questions, please don\'t hesitate to contact us.'}
              </p>
              <p style="margin: 15px 0 0 0; font-size: 14px; color: #666; line-height: 1.6;">
                ${locale === 'es' ? 'Saludos,' : 'Best regards,'}<br>
                <strong style="color: #1a1a1a;">Nomadigma</strong>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Nomadigma <no-reply@nomadigma.com>",
      to: email,
      subject: subject,
      html: html,
    });

    console.log(`Order confirmation email sent to ${email} for order ${orderId}`);
  } catch (error: any) {
    console.error('Error sending order confirmation email:', error);
    // No lanzar error para no interrumpir el flujo de la orden
  }
}

