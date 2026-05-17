import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Catálogo ────────────────────────────────────────────────────────────────
// Estrutura: 3 categorias top-level. "Acessórios" não tem subcategoria.
type ProductSeed = {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: "Masculino" | "Feminino" | "Acessórios";
  subcategory: string | null;
  stock: number;
  active?: boolean;
};

const PRODUCTS: ProductSeed[] = [
  // ─── MASCULINO ──────────────────────────────────────────────────────────────
  {
    name: "Camisa Social Branca Slim",
    description: "Camisa social em algodão pima, corte slim, ideal para o ambiente corporativo.",
    price: 219.9,
    imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=500&fit=crop",
    category: "Masculino",
    subcategory: "Camisas",
    stock: 14,
  },
  {
    name: "Camisa Linho Areia",
    description: "Camisa em linho puro, fresca e elegante, ideal para o verão.",
    price: 249.9,
    imageUrl: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=400&h=500&fit=crop",
    category: "Masculino",
    subcategory: "Camisas",
    stock: 8,
  },
  {
    name: "Camiseta Básica Preta",
    description: "Camiseta básica em algodão peruano, corte regular, gola careca reforçada.",
    price: 89.9,
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop",
    category: "Masculino",
    subcategory: "Camisetas",
    stock: 25,
  },
  {
    name: "Camiseta Estampada Geométrica",
    description: "Camiseta com estampa geométrica exclusiva, tecido leve e respirável.",
    price: 109.9,
    imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=500&fit=crop",
    category: "Masculino",
    subcategory: "Camisetas",
    stock: 12,
  },
  {
    name: "Calça Chino Bege",
    description: "Calça chino em sarja stretch, caimento moderno, perfeita para o casual smart.",
    price: 199.9,
    imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=500&fit=crop",
    category: "Masculino",
    subcategory: "Calças",
    stock: 10,
  },
  {
    name: "Calça Jeans Escura",
    description: "Calça jeans lavagem escura, modelagem reta, com elastano para conforto.",
    price: 229.9,
    imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop",
    category: "Masculino",
    subcategory: "Calças",
    stock: 16,
  },
  {
    name: "Bermuda Sarja Marinho",
    description: "Bermuda em sarja peletizada, com bolsos laterais e cordão na cintura.",
    price: 129.9,
    imageUrl: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=500&fit=crop",
    category: "Masculino",
    subcategory: "Bermudas",
    stock: 18,
  },
  {
    name: "Bermuda Jeans Destroyed",
    description: "Bermuda jeans com efeito destroyed e lavagem clara, vibe descontraída.",
    price: 149.9,
    imageUrl: "https://images.unsplash.com/photo-1606902965551-dce093cda6e7?w=400&h=500&fit=crop",
    category: "Masculino",
    subcategory: "Bermudas",
    stock: 3, // estoque baixo
  },
  {
    name: "Jaqueta Jeans Lavada",
    description: "Jaqueta jeans clássica, lavagem média, bolsos frontais e corte atemporal.",
    price: 329.9,
    imageUrl: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=400&h=500&fit=crop",
    category: "Masculino",
    subcategory: "Jaquetas",
    stock: 6,
  },
  {
    name: "Blazer Alfaiataria Grafite",
    description: "Blazer slim em tecido frio com forro interno, costura impecável.",
    price: 459.9,
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=500&fit=crop",
    category: "Masculino",
    subcategory: "Jaquetas",
    stock: 4,
  },
  {
    name: "Tênis Casual Branco",
    description: "Tênis em couro sintético branco, solado emborrachado, conforto para o dia todo.",
    price: 289.9,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop",
    category: "Masculino",
    subcategory: "Sapatos",
    stock: 11,
  },
  {
    name: "Sapato Social Couro",
    description: "Sapato social em couro legítimo, modelo Derby, cor castanho escuro.",
    price: 489.9,
    imageUrl: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400&h=500&fit=crop",
    category: "Masculino",
    subcategory: "Sapatos",
    stock: 0, // esgotado
  },

  // ─── FEMININO ───────────────────────────────────────────────────────────────
  {
    name: "Vestido Floral Primavera",
    description: "Vestido midi com estampa floral delicada, tecido leve e fresco ideal para o dia a dia.",
    price: 189.9,
    imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop",
    category: "Feminino",
    subcategory: "Vestidos",
    stock: 12,
  },
  {
    name: "Vestido Linho Off-White",
    description: "Vestido longo em linho puro, elegante e confortável. Perfeito para eventos ao ar livre.",
    price: 239.9,
    imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop",
    category: "Feminino",
    subcategory: "Vestidos",
    stock: 6,
  },
  {
    name: "Vestido Midi Marsala",
    description: "Vestido midi em jersey acetinado, cor marsala, caimento fluido para festas.",
    price: 269.9,
    imageUrl: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=500&fit=crop",
    category: "Feminino",
    subcategory: "Vestidos",
    stock: 5,
  },
  {
    name: "Blusa de Seda Rose",
    description: "Blusa com acabamento em seda, caimento perfeito e toque suave. Ideal para trabalho ou passeio.",
    price: 129.9,
    imageUrl: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400&h=500&fit=crop",
    category: "Feminino",
    subcategory: "Blusas",
    stock: 8,
  },
  {
    name: "Cropped Tricot Off-White",
    description: "Cropped em tricot finíssimo, manga longa, gola redonda. Combina com saias e calças altas.",
    price: 139.9,
    imageUrl: "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=400&h=500&fit=crop",
    category: "Feminino",
    subcategory: "Blusas",
    stock: 9,
  },
  {
    name: "Saia Midi Plissada Preta",
    description: "Saia midi plissada em tecido acetinado, cintura alta, super versátil.",
    price: 169.9,
    imageUrl: "https://images.unsplash.com/photo-1577900232427-18219b9166a0?w=400&h=500&fit=crop",
    category: "Feminino",
    subcategory: "Saias",
    stock: 7,
  },
  {
    name: "Saia Jeans Midi",
    description: "Saia jeans modelagem midi, fenda frontal discreta, fechamento por botão.",
    price: 149.9,
    imageUrl: "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=400&h=500&fit=crop",
    category: "Feminino",
    subcategory: "Saias",
    stock: 11,
  },
  {
    name: "Calça Palazzo Bege",
    description: "Calça palazzo de cintura alta, fluida e versátil. Combina com qualquer ocasião.",
    price: 159.9,
    imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop",
    category: "Feminino",
    subcategory: "Calças",
    stock: 15,
  },
  {
    name: "Calça Jeans Skinny",
    description: "Calça jeans skinny lavagem média, com elastano, modela e valoriza a silhueta.",
    price: 199.9,
    imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=500&fit=crop",
    category: "Feminino",
    subcategory: "Calças",
    stock: 13,
  },
  {
    name: "Jaqueta Jeans Premium",
    description: "Jaqueta jeans lavagem clara, corte moderno com detalhes em bordado. Atemporal.",
    price: 299.9,
    imageUrl: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400&h=500&fit=crop",
    category: "Feminino",
    subcategory: "Jaquetas",
    stock: 5,
  },
  {
    name: "Trench Coat Camel",
    description: "Trench coat cor camel em algodão encerado, com cinto e abotoamento duplo.",
    price: 599.9,
    imageUrl: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=500&fit=crop",
    category: "Feminino",
    subcategory: "Jaquetas",
    stock: 3, // estoque baixo
  },
  {
    name: "Scarpin Nude Salto Médio",
    description: "Scarpin clássico bico fino, nude, salto 7cm, em couro sintético macio.",
    price: 259.9,
    imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=500&fit=crop",
    category: "Feminino",
    subcategory: "Sapatos",
    stock: 8,
  },
  {
    name: "Sandália Rasteira Tiras",
    description: "Sandália rasteira com tiras finas trançadas, ajuste por fivela no tornozelo.",
    price: 179.9,
    imageUrl: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&h=500&fit=crop",
    category: "Feminino",
    subcategory: "Sapatos",
    stock: 14,
  },

  // ─── ACESSÓRIOS ─────────────────────────────────────────────────────────────
  {
    name: "Bolsa Couro Caramelo",
    description: "Bolsa estruturada em couro legítimo cor caramelo, alça regulável.",
    price: 429.9,
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop",
    category: "Acessórios",
    subcategory: null,
    stock: 7,
  },
  {
    name: "Cinto Pele Bege Fivela Dourada",
    description: "Cinto em pele genuína bege com fivela dourada, largura clássica de 3 cm.",
    price: 119.9,
    imageUrl: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=400&h=500&fit=crop",
    category: "Acessórios",
    subcategory: null,
    stock: 22,
  },
  {
    name: "Óculos de Sol Redondo Tartaruga",
    description: "Óculos de sol redondo armação acetato tartaruga, lentes UV400.",
    price: 199.9,
    imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=500&fit=crop",
    category: "Acessórios",
    subcategory: null,
    stock: 16,
  },
  {
    name: "Relógio Dourado Feminino",
    description: "Relógio analógico feminino com pulseira dourada e mostrador madrepérola.",
    price: 389.9,
    imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400&h=500&fit=crop",
    category: "Acessórios",
    subcategory: null,
    stock: 4,
  },
  {
    name: "Colar Pérolas Cultivadas",
    description: "Colar com pérolas cultivadas de água doce, fecho em prata 925.",
    price: 279.9,
    imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=500&fit=crop",
    category: "Acessórios",
    subcategory: null,
    stock: 9,
  },
  {
    name: "Chapéu Fedora Palha",
    description: "Chapéu fedora em palha natural com faixa preta, ideal para o verão.",
    price: 159.9,
    imageUrl: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400&h=500&fit=crop",
    category: "Acessórios",
    subcategory: null,
    stock: 0, // esgotado
    active: false, // descontinuado para demonstrar filtro
  },
];

async function main() {
  console.log("🌱 Iniciando seed da Bella Trama Boutique...");

  // Limpa dados anteriores
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();

  // Cria a loja (descrição atualizada para refletir catálogo unissex + acessórios)
  const store = await prisma.store.create({
    data: {
      slug: "bella-trama",
      name: "Bella Trama Boutique",
      whatsapp: "5511999990000",
      description: "Moda feminina, masculina e acessórios com estilo",
      logoUrl: null,
    },
  });

  // Cria produtos (createMany não retorna IDs no SQLite — criamos um a um)
  for (const p of PRODUCTS) {
    await prisma.product.create({
      data: {
        storeId: store.id,
        name: p.name,
        description: p.description,
        price: p.price,
        imageUrl: p.imageUrl,
        category: p.category,
        subcategory: p.subcategory,
        stock: p.stock,
        active: p.active ?? true,
      },
    });
  }
  console.log(`✅ ${PRODUCTS.length} produtos criados`);

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

  // Busca produtos para usar nos pedidos (mix de feminino, masculino e acessório)
  const allProducts = await prisma.product.findMany({ where: { storeId: store.id } });
  const byName = (n: string) => {
    const p = allProducts.find((x) => x.name === n);
    if (!p) throw new Error(`Produto '${n}' não encontrado no seed`);
    return p;
  };

  const vestidoFloral = byName("Vestido Floral Primavera");
  const blusaSeda = byName("Blusa de Seda Rose");
  const calcaPalazzo = byName("Calça Palazzo Bege");
  const vestidoLinho = byName("Vestido Linho Off-White");
  const camisaSocial = byName("Camisa Social Branca Slim");
  const tenis = byName("Tênis Casual Branco");
  const bolsa = byName("Bolsa Couro Caramelo");
  const oculos = byName("Óculos de Sol Redondo Tartaruga");
  const trench = byName("Trench Coat Camel");

  // Pedidos mockados com datas variadas
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today); twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today); monthAgo.setDate(monthAgo.getDate() - 30);

  // Hoje — entregue (feminino + acessório)
  await prisma.order.create({
    data: {
      storeId: store.id,
      customerId: customer1.id,
      status: "DELIVERED",
      total: vestidoFloral.price + bolsa.price,
      notes: "Pedido via WhatsApp",
      createdAt: today,
      items: {
        create: [
          { productId: vestidoFloral.id, quantity: 1, unitPrice: vestidoFloral.price },
          { productId: bolsa.id, quantity: 1, unitPrice: bolsa.price },
        ],
      },
    },
  });

  // Hoje — pendente (masculino)
  await prisma.order.create({
    data: {
      storeId: store.id,
      customerId: customer2.id,
      status: "PENDING",
      total: camisaSocial.price + tenis.price,
      notes: "Cliente quer retirar na loja",
      createdAt: today,
      items: {
        create: [
          { productId: camisaSocial.id, quantity: 1, unitPrice: camisaSocial.price },
          { productId: tenis.id, quantity: 1, unitPrice: tenis.price },
        ],
      },
    },
  });

  // Ontem — confirmado (feminino premium)
  await prisma.order.create({
    data: {
      storeId: store.id,
      customerId: customer3.id,
      status: "CONFIRMED",
      total: vestidoLinho.price + oculos.price,
      createdAt: yesterday,
      items: {
        create: [
          { productId: vestidoLinho.id, quantity: 1, unitPrice: vestidoLinho.price },
          { productId: oculos.id, quantity: 1, unitPrice: oculos.price },
        ],
      },
    },
  });

  // 2 dias atrás — enviado (trench coat)
  await prisma.order.create({
    data: {
      storeId: store.id,
      customerId: customer4.id,
      status: "SHIPPED",
      total: trench.price,
      createdAt: twoDaysAgo,
      items: {
        create: [
          { productId: trench.id, quantity: 1, unitPrice: trench.price },
        ],
      },
    },
  });

  // Semana atrás — entregue (3 blusas)
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

  // Mês atrás — entregue (calça)
  await prisma.order.create({
    data: {
      storeId: store.id,
      customerId: customer1.id,
      status: "DELIVERED",
      total: calcaPalazzo.price * 2,
      createdAt: monthAgo,
      items: {
        create: [
          { productId: calcaPalazzo.id, quantity: 2, unitPrice: calcaPalazzo.price },
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
