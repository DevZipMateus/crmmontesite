
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProject } from "@/server/project";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Project } from "@/types/project";

const formSchema = z.object({
  client_name: z.string().min(1, "Nome do cliente é obrigatório"),
  template: z.string().optional(),
  status: z.string().optional(),
  responsible_name: z.string().optional(),
  domain: z.string().optional(),
  client_type: z.string().optional(),
  blaster_link: z.string().optional(),
  partner_link: z.string().optional(),
  provider_credentials: z.string().optional(),
  assigned_programmer: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ProjectFormEditProps {
  initialValues: Project;
  submitButtonText?: string;
  mode?: 'create' | 'edit';
}

export function ProjectFormEdit({ initialValues, submitButtonText = "Salvar", mode = 'edit' }: ProjectFormEditProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_name: initialValues.client_name || "",
      template: initialValues.template || "",
      status: initialValues.status || "",
      responsible_name: initialValues.responsible_name || "",
      domain: initialValues.domain || "",
      client_type: initialValues.client_type || "",
      blaster_link: initialValues.blaster_link || "",
      partner_link: initialValues.partner_link || "",
      provider_credentials: initialValues.provider_credentials || "",
      assigned_programmer: initialValues.assigned_programmer || "",
    },
  });

  const watchedClientType = watch("client_type");

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    console.log("Submitting form with data:", data);

    try {
      const result = await updateProject(initialValues.id, data);
      
      if (result.success) {
        toast({
          title: "Projeto atualizado com sucesso",
          description: "As informações do projeto foram atualizadas.",
        });
        
        // Redirect to project detail page
        navigate(`/projeto/${initialValues.id}`);
      } else {
        toast({
          title: "Erro ao atualizar projeto",
          description: result.message || "Ocorreu um erro ao atualizar o projeto.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Erro ao atualizar projeto",
        description: "Ocorreu um erro inesperado ao atualizar o projeto.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="client_name">Nome do Cliente *</Label>
            <Input
              id="client_name"
              {...register("client_name")}
              placeholder="Digite o nome do cliente"
            />
            {errors.client_name && (
              <p className="text-sm text-red-500 mt-1">{errors.client_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="template">Template</Label>
            <Input
              id="template"
              {...register("template")}
              placeholder="Template utilizado"
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={watch("status")}
              onValueChange={(value) => setValue("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Recebido">Recebido</SelectItem>
                <SelectItem value="Criando site">Criando site</SelectItem>
                <SelectItem value="Configurando Domínio">Configurando Domínio</SelectItem>
                <SelectItem value="Site pronto">Site pronto</SelectItem>
                <SelectItem value="Entregue">Entregue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="assigned_programmer">Programador Responsável</Label>
            <Select
              value={watch("assigned_programmer")}
              onValueChange={(value) => setValue("assigned_programmer", value === "none" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um programador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Não atribuído</SelectItem>
                <SelectItem value="Mateus">Mateus</SelectItem>
                <SelectItem value="Davi">Davi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="responsible_name">Nome do Responsável (Cliente)</Label>
            <Input
              id="responsible_name"
              {...register("responsible_name")}
              placeholder="Nome do responsável no cliente"
            />
          </div>

          <div>
            <Label htmlFor="domain">Domínio</Label>
            <Input
              id="domain"
              {...register("domain")}
              placeholder="www.exemplo.com"
            />
          </div>

          <div>
            <Label htmlFor="client_type">Tipo de Cliente</Label>
            <Select
              value={watchedClientType}
              onValueChange={(value) => setValue("client_type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direto">Direto</SelectItem>
                <SelectItem value="parceiro">Parceiro</SelectItem>
                <SelectItem value="indicacao">Indicação</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="blaster_link">Link do Blaster</Label>
            <Input
              id="blaster_link"
              {...register("blaster_link")}
              placeholder="https://blaster.exemplo.com"
            />
          </div>

          {watchedClientType === "parceiro" && (
            <div>
              <Label htmlFor="partner_link">Link do Parceiro</Label>
              <Input
                id="partner_link"
                {...register("partner_link")}
                placeholder="https://parceiro.exemplo.com"
              />
            </div>
          )}

          <div>
            <Label htmlFor="provider_credentials">Credenciais do Provedor</Label>
            <Textarea
              id="provider_credentials"
              {...register("provider_credentials")}
              placeholder="Credenciais de acesso ao provedor"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : submitButtonText}
        </Button>
      </div>
    </form>
  );
}
