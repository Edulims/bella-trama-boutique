"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { deleteProduct } from "../actions";

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
}

/**
 * Botão destrutivo no card de produto. Iteração 5 do CRUD.
 *
 * Fluxo:
 * 1. AlertDialog controlado por `useState` (sheet/dialog do shadcn não fecham
 *    sozinhos após um server action — precisamos comandar `setOpen(false)`).
 * 2. `useTransition` mantém o servidor amigável durante o action e dá-nos o
 *    `isPending` para desabilitar o botão e trocar label.
 * 3. Se `HAS_ORDERS`, fechamos o dialog e mostramos um toast.error explicando
 *    quantos pedidos têm o produto, com instrução de desativar em vez de excluir.
 *    Fechar o dialog é proposital: o usuário não pode prosseguir mesmo, então
 *    deixá-lo aberto seria fricção desnecessária.
 */
export function DeleteProductButton({
  productId,
  productName,
}: DeleteProductButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function runDelete() {
    startTransition(async () => {
      const result = await deleteProduct(productId);

      if (result.ok) {
        toast.success("Produto excluído", {
          description: `${productName} foi removido do catálogo.`,
        });
        setOpen(false);
        return;
      }

      if (result.reason === "HAS_ORDERS") {
        setOpen(false);
        toast.error(
          `Este produto está em ${result.orderCount} pedido${
            result.orderCount === 1 ? "" : "s"
          }. Desative em vez de excluir.`,
          {
            description:
              "Excluir quebraria o histórico de vendas. Use o botão Desativar para tirar do catálogo público.",
          }
        );
        return;
      }

      if (result.reason === "NOT_FOUND") {
        setOpen(false);
        toast.error("Produto não encontrado", {
          description: "Talvez já tenha sido removido. A página será atualizada.",
        });
        return;
      }

      toast.error("Erro ao excluir, tente novamente.");
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={`Excluir ${productName}`}
          className={cn(
            "h-8 px-2.5 text-xs font-medium text-stone-500 hover:text-destructive hover:bg-destructive/10"
          )}
        >
          <Trash2 size={14} className="mr-1.5" />
          Excluir
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif text-2xl text-stone-900 tracking-tight">
            Excluir produto?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-stone-500">
            Tem certeza que deseja excluir &quot;{productName}&quot;? Esta ação
            não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(e) => {
              // Prevenimos o fechamento automático do AlertDialog para que
              // o `setOpen(false)` seja comandado por nós apenas no fluxo
              // correto (sucesso ou HAS_ORDERS). Sem isso, em erro o dialog
              // some e o usuário perde contexto.
              e.preventDefault();
              runDelete();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
