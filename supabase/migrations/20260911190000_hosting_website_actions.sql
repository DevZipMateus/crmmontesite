-- Suporte a ações de controle por site no painel de Hospedagem:
-- vincular/desvincular projeto, tirar do ar / reativar (Agency Growth), excluir.

ALTER TABLE public.hosting_websites
  ADD COLUMN panel_state TEXT NOT NULL DEFAULT 'active'
  CHECK (panel_state IN ('active', 'offline'));

CREATE INDEX idx_hosting_websites_panel_state ON public.hosting_websites(panel_state);

-- Necessário para o vínculo manual a projeto ser feito direto do frontend autenticado.
CREATE POLICY "Authenticated users can update hosting websites"
  ON public.hosting_websites FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Eventos de ações manuais (vincular projeto, desativar, etc.) também são
-- inseridos pelo frontend em alguns casos (ex: vínculo de projeto não passa
-- por Edge Function), então authenticated precisa poder inserir eventos.
CREATE POLICY "Authenticated users can insert hosting events"
  ON public.hosting_events FOR INSERT
  TO authenticated
  WITH CHECK (true);
