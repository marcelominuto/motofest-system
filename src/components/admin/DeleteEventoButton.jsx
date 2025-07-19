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

export default function DeleteEventoButton({ id, onDeleted }) {
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/eventos/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.error || "Erro ao excluir evento");
      }

      toast.success("Evento excluído com sucesso!");
      onDeleted();
    } catch (error) {
      toast.error(error.message || "Erro ao excluir evento");
      console.error(error);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Excluir
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não poderá ser desfeita. O evento será removido do
            sistema.
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
