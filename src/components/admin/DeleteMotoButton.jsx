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

export default function DeleteMotoButton({ id, onDeleted }) {
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/motos/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.error || "Erro ao excluir moto");
      }

      toast.success("Moto excluída com sucesso!");
      onDeleted();
    } catch (error) {
      toast.error(error.message || "Erro ao excluir moto");
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
            Esta ação não poderá ser desfeita. A moto será removida do sistema.
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
