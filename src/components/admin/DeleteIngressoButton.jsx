"use client";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function DeleteIngressoButton({ id, onDeleted }) {
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/ingressos/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro?.error || "Erro desconhecido");
      }

      toast.success("Ingresso excluído com sucesso!");
      onDeleted();
    } catch (err) {
      const msg = err.message.includes("vinculado")
        ? "Este ingresso está vinculado a agendamentos e não pode ser excluído."
        : "Erro ao excluir ingresso";
      toast.error(msg);
      console.error("Erro ao excluir ingresso:", err);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          className="text-red-600 text-xs p-0 hover:underline"
        >
          Excluir
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deseja realmente excluir?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não poderá ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            Confirmar exclusão
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
