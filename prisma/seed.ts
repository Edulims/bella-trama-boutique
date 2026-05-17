import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed da Bella Trama Boutique...");

  // Limpa dados anteriores
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();

  // Cria a loja
  const store = await prisma.store.create({
    data: {
      slug: "bella-trama",
      name: "Bella Trama Boutique",
      whatsapp: "5511999990000",
      description: "Moda feminina com estilo e elegância",
      logoUrl: null,
    },
  });

  // Cria produtos
  const products = await prisma.product.createMany({
    data: [
      {
        storeId: store.id,
        name: "Vestido Floral Primavera",
        description: "Vestido midi com estampa floral delicada, tecido leve e fresco ideal para o dia a dia.",
        price: 189.9,
        imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop",
        category: "Vestidos",
        stock: 12,
        active: true,
      },
      {
        storeId: store.id,
        name: "Blusa de Seda Rose",
        description: "Blusa com acabamento em seda, caimento perfeito e toque suave. Ideal para trabalho ou passeio.",
        price: 129.9,
        imageUrl: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400&h=500&fit=crop",
        category: "Blusas",
        stock: 8,
        active: true,
      },
      {
        storeId: store.id,
        name: "Calça Palazzo Bege",
        description: "Calça palazzo de cintura alta, fluida e versátil. Combina com qualquer ocasião.",
        price: 159.9,
        imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop",
        category: "Calças",
        stock: 15,
        active: true,
      },
      {
        storeId: store.id,
        name: "Vestido Linho Off-White",
        description: "Vestido longo em linho puro, elegante e confortável. Perfeito para eventos ao ar livre.",
        price: 239.9,
        imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop",
        category: "Vestidos",
        stock: 6,
        active: true,
      },
      {
        storeId: store.id,
        name: "Conjunto Cropped + Saia",
        description: "Conjunto coordenado com cropped e saia midi plissada. Moderno e fashion.",
        price: 219.9,
        imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop",
        category: "Conjuntos",
        stock: 9,
        active: true,
      },
      {
        storeId: store.id,
        name: "Jaqueta Jeans Premium",
        description: "Jaqueta jeans lavagem clara, corte moderno com detalhes em bordado. Atemporal.",
        price: 299.9,
        imageUrl: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400&h=500&fit=crop",
        category: "Jaquetas",
        stock: 5,
        active: true,
      },
    ],
  });

  console.log(`✅ ${products.count} produtos criados`);

  // Cria clientes
  const customer1 = await prisma.customer.create({
    data: {
      storeId: store.id,
      name: "Ana Paula Rodrigues",
      phone: "5511998887766",
      email: "ana.paula@email.com",
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      storeId: store.id,
      name: "Mariana Costa",
      phone: "5511977665544",
      email: "mariana.costa@email.com",
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      storeId: store.id,
      name: "Fernanda Lima",
      phone: "5511966554433",
      email: "fernanda.lima@email.com",
    },
  });

  const customer4 = await prisma.customer.create({
    data: {
      storeId: store.id,
      name: "Camila Souza",
      phone: "5511955443322",
    },
  });

  const customer5 = await prisma.customer.create({
    data: {
      storeId: store.id,
      name: "Juliana Mendes",
      phone: "5511944332211",
    },
  });

  console.log("✅ 5 clientes criados");

  // Busca produtos para usar nos pedidos
  const productList = await prisma.product.findMany({ where: { storeId: store.id } });
  const vestidoFloral = productList[0];
  const blusaSeda = productList[1];
  const calcaPalazzo = productList[2];
  const vestidoLinho = productList[3];
  const conjunto = productList[4];

  // Cria pedidos mockados com datas variadas
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today); twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const threeDaysAgo = new Date(today); threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today); monthAgo.setDate(monthAgo.getDate() - 30);

  // Pedido de hoje — entregue
  await prisma.order.create({
    data: {
      storeId: store.id,
      customerId: customer1.id,
      status: "DELIVERED",
      total: vestidoFloral.price + blusaSeda.price,
      notes: "Pedido via WhatsApp",
      createdAt: today,
      items: {
        create: [
          { productId: vestidoFloral.id, quantity: 1, unitPrice: vestidoFloral.price },
          { productId: blusaSeda.id, quantity: 1, unitPrice: blusaSeda.price },
        ],
      },
    },
  });

  // Pedido de hoje — pendente
  await prisma.order.create({
    data: {
      storeId: store.id,
      customerId: customer2.id,
      status: "PENDING",
      total: calcaPalazzo.price * 2,
      notes: "Cliente quer retirar na loja",
      createdAt: today,
      items: {
        create: [
          { productId: calcaPalazzo.id, quantity: 2, unitPrice: calcaPalazzo.price },
        ],
      },
    },
  });

  // Pedido de ontem — confirmado
  await prisma.order.create({
    data: {
      storeId: store.id,
      customerId: customer3.id,
      status: "CONFIRMED",
      total: vestidoLinho.price,
      createdAt: yesterday,
      items: {
        create: [
          { productId: vestidoLinho.id, quantity: 1, unitPrice: vestidoLinho.price },
        ],
      },
    },
  });

  // Pedido de 2 dias atrás — enviado
  await prisma.order.create({
    data: {
      storeId: store.id,
      customerId: customer4.id,
      status: "SHIPPED",
      total: conjunto.price,
      createdAt: twoDaysAgo,
      items: {
        create: [
          { productId: conjunto.id, quantity: 1, unitPrice: conjunto.price },
        ],
      },
    },
  });

  // Pedido antigo — entregue
  await prisma.order.create({
    data: {
      storeId: store.id,
      customerId: customer5.id,
      status: "DELIVERED",
      total: blusaSeda.price * 3,
      createdAt: weekAgo,
      items: {
        create: [
          { productId: blusaSeda.id, quantity: 3, unitPrice: blusaSeda.price },
        ],
      },
    },
  });

  // Pedido muito antigo — entregue (para métricas)
  await prisma.order.create({
    data: {
      storeId: store.id,
      customerId: customer1.id,
      status: "DELIVERED",
      total: vestidoFloral.price * 2,
      createdAt: monthAgo,
      items: {
        create: [
          { productId: vestidoFloral.id, quantity: 2, unitPrice: vestidoFloral.price },
        ],
      },
    },
  });

  console.log("✅ 6 pedidos criados");
  console.log("\n🎉 Seed concluído! Bella Trama Boutique pronta.");
  console.log(`   Loja ID: ${store.id}`);
  console.log(`   Slug: ${store.slug}`);
  console.log(`   Acesse: http://localhost:3000/loja/bella-trama`);
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
