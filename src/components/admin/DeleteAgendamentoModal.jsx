import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function DeleteAgendamentoModal({
  open,
  onClose,
  agendamento,
  onDeleted,
}) {
  if (!agendamento) return null;

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/agendamentos/${agendamento.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao excluir agendamento");
      toast.success("Agendamento excluído com sucesso!");
      onDeleted && onDeleted();
      onClose();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Excluir Agendamento</DialogTitle>
        </DialogHeader>
        <p>Tem certeza que deseja excluir este agendamento?</p>
        <DialogFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
