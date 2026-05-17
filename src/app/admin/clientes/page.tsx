import { ComingSoon } from "@/components/admin/coming-soon";

export default function ClientesPage() {
  return (
    <ComingSoon
      title="Clientes"
      description="Conheça sua base de clientes e crie campanhas direcionadas."
      features={[
        "Perfil completo com histórico de compras e ticket médio",
        "Segmentação automática (VIP, recorrentes, inativas) pela IA",
        "Disparo de mensagens em lote via WhatsApp",
        "Programa de fidelidade com cupons personalizados",
      ]}
    />
  );
}
