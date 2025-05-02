
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ModelTemplate } from "@/services/modelTemplateService";
import ModelForm from "./ModelForm";

interface ModelDialogsProps {
  editDialogOpen: boolean;
  setEditDialogOpen: (open: boolean) => void;
  currentEditModel: ModelTemplate | null;
  handleEditModelChange: (field: string, value: string) => void;
  handleSaveEdit: () => void;
  modelToDelete: ModelTemplate | null;
  setModelToDelete: (model: ModelTemplate | null) => void;
  handleDeleteModel: () => void;
  saving?: boolean;
  deleting?: boolean;
}

export const ModelDialogs: React.FC<ModelDialogsProps> = ({
  editDialogOpen,
  setEditDialogOpen,
  currentEditModel,
  handleEditModelChange,
  handleSaveEdit,
  modelToDelete,
  setModelToDelete,
  handleDeleteModel,
  saving = false,
  deleting = false
}) => {
  return (
    <>
      {/* Edit Model Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Modelo</DialogTitle>
            <DialogDescription>
              Atualize as informações do modelo e a URL personalizada
            </DialogDescription>
          </DialogHeader>
          
          {currentEditModel && (
            <ModelForm 
              model={{
                name: currentEditModel.name,
                description: currentEditModel.description,
                image_url: currentEditModel.image_url,
                custom_url: currentEditModel.custom_url || ""
              }}
              isEdit={true}
              onChange={handleEditModelChange}
              onSubmit={handleSaveEdit}
              onCancel={() => setEditDialogOpen(false)}
              isSubmitting={saving}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation */}
      {modelToDelete && (
        <AlertDialog open={!!modelToDelete} onOpenChange={() => setModelToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o modelo "{modelToDelete.name}"?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setModelToDelete(null)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteModel}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleting}
              >
                {deleting ? "Excluindo..." : "Excluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};

export default ModelDialogs;
