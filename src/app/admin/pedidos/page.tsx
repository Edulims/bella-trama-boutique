import { ComingSoon } from "@/components/admin/coming-soon";

export default function PedidosPage() {
  return (
    <ComingSoon
      title="Pedidos"
      description="Acompanhe e gerencie os pedidos da loja."
      features={[
        "Kanban visual por status (Pendente, Confirmado, Enviado, Entregue)",
        "Detalhes do pedido com histórico de comunicação no WhatsApp",
        "Geração automática de etiquetas e nota fiscal",
        "Métricas de tempo médio por etapa do funil",
      ]}
    />
  );
}
