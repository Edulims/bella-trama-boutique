import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const body = await request.json();
  const { customerName, customerPhone, items } = body as {
    customerName: string;
    customerPhone: string;
    items: CartItem[];
  };

  if (!items?.length) {
    return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });
  }

  const store = await prisma.store.findUnique({ where: { slug } });
  if (!store) {
    return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 });
  }

  // Upsert customer by phone
  let customer = null;
  if (customerPhone) {
    customer = await prisma.customer.upsert({
      where: { id: customerPhone }, // fallback — use phone as id isn't ideal but works for MVP
      update: { name: customerName },
      create: {
        storeId: store.id,
        name: customerName || "Cliente",
        phone: customerPhone,
      },
    }).catch(() => null);

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          storeId: store.id,
          name: customerName || "Cliente",
          phone: customerPhone,
        },
      });
    }
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const order = await prisma.order.create({
    data: {
      storeId: store.id,
      customerId: customer?.id,
      status: "PENDING",
      total,
      notes: "Pedido via catálogo digital",
      items: {
        create: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.price,
        })),
      },
    },
    include: { items: { include: { product: true } } },
  });

  // Monta mensagem do WhatsApp
  const lines = items
    .map((i) => `  • ${i.quantity}x ${i.name} — R$ ${(i.price * i.quantity).toFixed(2).replace(".", ",")}`)
    .join("\n");

  const msg = encodeURIComponent(
    `Olá ${store.name}! 👋\n\nGostaria de fazer o seguinte pedido:\n\n${lines}\n\n*Total: R$ ${total.toFixed(2).replace(".", ",")}*\n\nMeu nome: ${customerName || "—"}\nTelefone: ${customerPhone || "—"}`
  );

  const whatsappUrl = store.whatsapp
    ? `https://wa.me/${store.whatsapp}?text=${msg}`
    : null;

  return NextResponse.json({ orderId: order.id, whatsappUrl });
}
