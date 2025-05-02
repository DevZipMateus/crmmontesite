
import React from "react";
import { CardContent } from "@/components/ui/card";
import ModelTable from "./ModelTable";
import ModelDialogs from "./ModelDialogs";
import { useModelEdit } from "./hooks/useModelEdit";
import { useModelDelete } from "./hooks/useModelDelete";

interface ModelTableManagerProps {
  baseUrl: string;
}

const ModelTableManager: React.FC<ModelTableManagerProps> = ({ baseUrl }) => {
  // Get edit functionality from our hook
  const {
    editDialogOpen,
    setEditDialogOpen,
    currentEditModel,
    saving,
    handleEditClick,
    handleEditModelChange,
    handleSaveEdit
  } = useModelEdit();
  
  // Get delete functionality from our hook
  const {
    modelToDelete,
    setModelToDelete,
    deleting,
    confirmDelete,
    handleDeleteModel
  } = useModelDelete();

  return (
    <>
      <CardContent>
        <ModelTable 
          baseUrl={baseUrl}
          onEditClick={handleEditClick}
          onDeleteConfirm={confirmDelete}
        />
      </CardContent>
      
      <ModelDialogs
        editDialogOpen={editDialogOpen}
        setEditDialogOpen={setEditDialogOpen}
        currentEditModel={currentEditModel}
        handleEditModelChange={handleEditModelChange}
        handleSaveEdit={handleSaveEdit}
        modelToDelete={modelToDelete}
        setModelToDelete={setModelToDelete}
        handleDeleteModel={handleDeleteModel}
        saving={saving}
        deleting={deleting}
      />
    </>
  );
};

export default ModelTableManager;
