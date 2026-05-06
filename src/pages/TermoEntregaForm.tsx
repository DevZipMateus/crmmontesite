import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { FileCheck, Globe, AlertTriangle, CheckCircle2, Loader2, Mail } from "lucide-react";
import { getProjectByTermHash, checkTermExists, submitDeliveryTerm } from "@/services/deliveryTermService";
import { supabase } from "@/integrations/supabase/client";

const TermoEntregaForm: React.FC = () => {
  const { hash } = useParams<{ hash: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [project, setProject] = useState<{ id: string; client_name: string; domain?: string } | null>(null);
  const [alreadyFilled, setAlreadyFilled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [notaAtendimento, setNotaAtendimento] = useState<number>(8);
  const [comentarios, setComentarios] = useState("");
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      if (!hash) {
        setError("Link inválido");
        setLoading(false);
        return;
      }

      try {
        const projectData = await getProjectByTermHash(hash);
        setProject(projectData);

        // Check if term already exists
        const existingTerm = await checkTermExists(projectData.id);
        if (existingTerm) {
          setAlreadyFilled(true);
        }
      } catch (err) {
        console.error("Erro ao carregar projeto:", err);
        setError("Projeto não encontrado ou link inválido");
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [hash]);

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accepted) {
      toast.error("Você precisa aceitar os termos para continuar");
      return;
    }

    if (!nomeCompleto.trim() || !cpf.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (cpf.replace(/\D/g, '').length !== 11) {
      toast.error("CPF inválido");
      return;
    }

    setSubmitting(true);

    try {
      const result = await submitDeliveryTerm({
        project_id: project!.id,
        nota_atendimento: notaAtendimento,
        comentarios: comentarios || undefined,
        nome_completo: nomeCompleto,
        cpf: cpf,
        email: email || undefined,
      });

      // Send webhook to Make.com (non-blocking)
      try {
        await supabase.functions.invoke('send-delivery-term-webhook', {
          body: {
            project_id: project!.id,
            delivery_term_id: result.id
          }
        });
      } catch (webhookError) {
        console.error('Erro ao enviar webhook:', webhookError);
        // Don't block - term was saved successfully
      }

      toast.success("Revisão enviada com sucesso!");
      setAlreadyFilled(true);
    } catch (err) {
      console.error("Erro ao enviar revisão:", err);
      toast.error("Erro ao enviar revisão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Erro</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (alreadyFilled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Revisão Já Enviada</h2>
            <p className="text-muted-foreground mb-6">
              A etapa de revisão para o projeto <strong>{project?.client_name}</strong> já foi preenchida e enviada.
            </p>
            {project?.domain && (
              <a
                href={`https://${project.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Globe className="h-5 w-5" />
                Acessar seu site: {project.domain}
              </a>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center border-b">
            <div className="flex justify-center mb-4">
              <FileCheck className="h-12 w-12 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Etapa de Revisão do Seu Site</CardTitle>
            <CardDescription className="text-base">
              Projeto: <strong>{project?.client_name}</strong>
            </CardDescription>
            <p className="text-sm text-muted-foreground mt-2">
              Seu site ainda não está 100% pronto. Revise a construção, valide e aponte os ajustes necessários.
            </p>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-8 pt-6">
              {/* Seção 1: Pesquisa de Satisfação */}
              <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                  Pesquisa de Satisfação
                </h3>
                <p className="text-muted-foreground mb-4">
                  Antes de finalizarmos, sua opinião é fundamental para nós!
                </p>

                <div className="space-y-4">
                  <div>
                    <Label className="text-base mb-3 block">
                      Como você avalia o nosso atendimento durante o processo? (0 a 10)
                    </Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[notaAtendimento]}
                        onValueChange={(v) => setNotaAtendimento(v[0])}
                        max={10}
                        min={0}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-2xl font-bold min-w-[3rem] text-center">{notaAtendimento}</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="comentarios">Espaço para comentários ou sugestões (opcional)</Label>
                    <Textarea
                      id="comentarios"
                      value={comentarios}
                      onChange={(e) => setComentarios(e.target.value)}
                      placeholder="Conte-nos como foi sua experiência..."
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                </div>
              </section>

              {/* Seção 2: Condições de Entrega e Suporte */}
              <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                  Condições de Entrega e Suporte
                </h3>

                <div className="bg-gray-100 rounded-lg p-4 space-y-3 text-sm">
                  <p>
                    Ao preencher seus dados de identificação (Nome Completo e CPF) abaixo, você declara que revisou a
                    versão atual do seu site e registra sua avaliação. A partir desta data, passam a valer as
                    seguintes regras de manutenção e ajustes:
                  </p>

                  <ul className="space-y-2 ml-4">
                    <li className="flex gap-2">
                      <span className="font-semibold">•</span>
                      <span><strong>Início da Vigência:</strong> O prazo de suporte inicia-se imediatamente após o preenchimento deste termo.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold">•</span>
                      <span><strong>Período de Ajustes Gratuitos:</strong> Você tem o direito a 30 (trinta) dias corridos de garantia para solicitar correções ou pequenos ajustes.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold">•</span>
                      <span><strong>Limite de Envios:</strong> Dentro deste período de 30 dias, você tem direito a enviar 02 (dois) e-mails com listas de alterações.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold">•</span>
                      <span><strong>Recomendação:</strong> Junte todas as alterações necessárias e envie de uma única vez para aproveitar melhor sua cota.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold">•</span>
                      <span><strong>Canal Oficial:</strong> Todas as solicitações devem ser encaminhadas exclusivamente para o e-mail: <a href="mailto:sites@zipline.com.br" className="text-blue-600 hover:underline">sites@zipline.com.br</a></span>
                    </li>
                  </ul>

                  <div className="bg-yellow-100 border border-yellow-300 rounded p-3 mt-4">
                    <p className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Cobranças Adicionais:</strong> Caso o prazo de 30 dias expire OU o limite de 2 e-mails seja 
                        atingido (o que ocorrer primeiro), qualquer nova solicitação de alteração terá uma taxa de serviço 
                        de <strong>R$ 100,00 (cem reais)</strong> por e-mail/solicitação enviada.
                      </span>
                    </p>
                  </div>
                </div>
              </section>

              {/* Dados de Identificação */}
              <section>
                <h3 className="text-lg font-semibold mb-4">Dados de Identificação</h3>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="nomeCompleto">Nome Completo *</Label>
                    <Input
                      id="nomeCompleto"
                      value={nomeCompleto}
                      onChange={(e) => setNomeCompleto(e.target.value)}
                      placeholder="Digite seu nome completo"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                      id="cpf"
                      value={cpf}
                      onChange={handleCpfChange}
                      placeholder="000.000.000-00"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      E-mail (para receber cópia da revisão)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Informe seu e-mail para receber uma cópia da revisão em PDF.
                    </p>
                  </div>
                </div>
              </section>

              {/* Aceite */}
              <section className="border-t pt-6">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="aceite"
                    checked={accepted}
                    onCheckedChange={(checked) => setAccepted(checked === true)}
                  />
                  <Label htmlFor="aceite" className="text-sm leading-relaxed cursor-pointer">
                    Li e estou ciente das condições acima descritas. Confirmo que revisei a versão atual do meu site e
                    estou ciente das condições de suporte e manutenção.
                  </Label>
                </div>
              </section>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={submitting || !accepted}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Enviar Revisao
                  </>
                )}
              </Button>

              {/* Link para o site */}
              {project?.domain && (
                <div className="text-center border-t pt-6">
                  <p className="text-muted-foreground mb-3">Visualize seu site:</p>
                  <a
                    href={`https://${project.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:underline text-lg"
                  >
                    <Globe className="h-5 w-5" />
                    {project.domain}
                  </a>
                </div>
              )}
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default TermoEntregaForm;
