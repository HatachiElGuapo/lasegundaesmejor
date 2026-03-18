import { NextRequest, NextResponse } from 'next/server';
import { mpPreference } from '@/lib/mercadopago';
import { createClient } from '@supabase/supabase-js';
import type { CartItem, ShippingAddress } from '@/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
  let items: CartItem[];
  let shipping: ShippingAddress;

  try {
    const body = await req.json();
    items    = body.items;
    shipping = body.shipping;
  } catch {
    return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 });
  }

  if (!items?.length) {
    return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
  }

  if (!shipping?.nombre || !shipping?.ciudad || !shipping?.direccion || !shipping?.telefono) {
    return NextResponse.json({ error: 'Faltan datos de envío requeridos' }, { status: 400 });
  }

  const total  = items.reduce((sum, { product }) => sum + product.price, 0);
  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  // 1. Guardar la orden en Supabase antes de redirigir a MP
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_email: shipping.telefono, // se actualiza con el email real tras el pago
      items: items.map(({ product }) => ({
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        size: product.size,
        condition: product.condition,
        image: product.images?.[0] ?? null,
      })),
      total,
      status: 'pendiente',
      shipping_address: shipping,
    })
    .select('id')
    .single();

  if (orderError || !order) {
    console.error('[checkout] Supabase insert error:', orderError);
    return NextResponse.json({ error: 'No se pudo registrar la orden' }, { status: 500 });
  }

  // 2. Crear preferencia en MercadoPago
  try {
    const preference = await mpPreference.create({
      body: {
        items: items.map(({ product }) => ({
          id: product.id,
          title: product.name,
          quantity: 1,
          unit_price: product.price,
          currency_id: 'COP',
          picture_url: product.images?.[0],
          description: `Talla ${product.size} — ${product.condition}`,
        })),
        payer: {
          name: shipping.nombre,
          phone: { number: shipping.telefono },
        },
        external_reference: order.id,
        back_urls: {
          success: `${origin}/carrito/gracias`,
          failure: `${origin}/carrito`,
          pending: `${origin}/carrito/gracias`,
        },
        statement_descriptor: 'La Segunda Es Mejor',
      },
    });

    // 3. Actualizar la orden con el preference_id de MP
    await supabase
      .from('orders')
      .update({ mercadopago_preference_id: preference.id })
      .eq('id', order.id);

    return NextResponse.json({ init_point: preference.init_point });
  } catch (err) {
    console.error('[checkout] MercadoPago error:', err);
    // Marcar la orden como fallida para no dejar registros huérfanos
    await supabase.from('orders').update({ status: 'fallido' }).eq('id', order.id);
    return NextResponse.json({ error: 'No se pudo crear la preferencia de pago' }, { status: 500 });
  }
}
