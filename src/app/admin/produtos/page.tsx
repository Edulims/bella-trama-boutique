import { ComingSoon } from "@/components/admin/coming-soon";

export default function ProdutosPage() {
  return (
    <ComingSoon
      title="Produtos"
      description="Gerencie o catálogo da Bella Trama Boutique."
      features={[
        "Listagem com busca e filtros por categoria, status e estoque",
        "Cadastro e edição inline com upload de imagens",
        "Controle de estoque com alertas de reposição",
        "Sugestões de preço baseadas em IA",
      ]}
    />
  );
}
