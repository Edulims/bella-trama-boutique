"use client";

import { useTransition } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleProductActive } from "../actions";

interface ToggleActiveButtonProps {
  productId: string;
  productName: string;
  active: boolean;
}

/**
 * Botão discreto no card de produto que alterna visibilidade no catálogo.
 *
 * Fluxo:
 * 1. useTransition mantém o servidor amigável ao streaming durante o action.
 * 2. Em sucesso, dispara um toast Sonner com ação "Desfazer" que reaplica
 *    o mesmo action — efetivamente um toggle de volta, já que o produto
 *    agora está no estado oposto.
 * 3. Em erro, toast.error genérico (a Server Action já loga detalhes).
 */
export function ToggleActiveButton({
  productId,
  productName,
  active,
}: ToggleActiveButtonProps) {
  const [isPending, startTransition] = useTransition();

  function runToggle() {
    startTransition(async () => {
      const result = await toggleProductActive(productId);

      if (!result.ok) {
        toast.error("Falha ao atualizar produto", {
          description: result.error,
        });
        return;
      }

      const undoAction = {
        label: "Desfazer",
        // Reaplica o toggle — como `active` já foi invertido no banco,
        // chamar de novo restaura o estado original.
        onClick: () => {
          startTransition(async () => {
            await toggleProductActive(productId);
          });
        },
      };

      if (result.active) {
        toast.success(`${result.name} reativado`, {
          description: "Voltou a aparecer no catálogo público.",
          action: undoAction,
        });
      } else {
        toast.warning(`${result.name} desativado`, {
          description: "Não aparece mais no catálogo público.",
          action: undoAction,
        });
      }
    });
  }

  const Icon = isPending ? Loader2 : active ? EyeOff : Eye;
  const label = active ? "Desativar" : "Reativar";

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={runToggle}
      aria-label={`${label} ${productName}`}
      className={cn(
        "h-8 px-2.5 text-xs font-medium text-stone-500 hover:text-stone-800 hover:bg-stone-100",
        isPending && "cursor-wait"
      )}
    >
      <Icon size={14} className={cn("mr-1.5", isPending && "animate-spin")} />
      {isPending ? "Atualizando..." : label}
    </Button>
  );
}
