import Stripe from 'stripe';

// Función helper para obtener instancia de Stripe
export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY no está configurada');
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-12-15.clover',
  });
}
