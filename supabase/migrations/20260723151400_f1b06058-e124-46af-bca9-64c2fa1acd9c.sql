
-- Extra columns
ALTER TABLE public.contas_pagar
  ADD COLUMN IF NOT EXISTS categoria text,
  ADD COLUMN IF NOT EXISTS fornecedor text;

ALTER TABLE public.contas_receber
  ADD COLUMN IF NOT EXISTS categoria text;

-- Audit triggers reusing existing log_change()
DROP TRIGGER IF EXISTS audit_contas_pagar ON public.contas_pagar;
CREATE TRIGGER audit_contas_pagar
AFTER INSERT OR UPDATE OR DELETE ON public.contas_pagar
FOR EACH ROW EXECUTE FUNCTION public.log_change();

DROP TRIGGER IF EXISTS audit_contas_receber ON public.contas_receber;
CREATE TRIGGER audit_contas_receber
AFTER INSERT OR UPDATE OR DELETE ON public.contas_receber
FOR EACH ROW EXECUTE FUNCTION public.log_change();

-- Function to refresh overdue status and notify financeiro/admin
CREATE OR REPLACE FUNCTION public.atualizar_status_contas()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE r record; u record;
BEGIN
  -- flag overdue
  UPDATE public.contas_pagar
    SET status = 'atrasado'
    WHERE status IN ('pendente','em aberto') AND vencimento < current_date;
  UPDATE public.contas_receber
    SET status = 'atrasado'
    WHERE status IN ('pendente','em aberto') AND vencimento < current_date;

  -- notify each admin/financeiro/gestor once per day per doc
  FOR u IN
    SELECT DISTINCT ur.user_id
    FROM public.user_roles ur
    WHERE ur.role IN ('admin','gestor','financeiro')
  LOOP
    FOR r IN
      SELECT id, descricao, vencimento, valor, status FROM public.contas_pagar
      WHERE status IN ('pendente','atrasado')
        AND vencimento <= current_date + INTERVAL '3 days'
    LOOP
      IF NOT EXISTS (
        SELECT 1 FROM public.notificacoes
        WHERE user_id = u.user_id AND link = '/app/financeiro'
          AND titulo = CASE WHEN r.status='atrasado' THEN 'Conta a pagar vencida' ELSE 'Conta a pagar vencendo' END
          AND mensagem LIKE '%'||r.id::text||'%'
          AND created_at::date = current_date
      ) THEN
        INSERT INTO public.notificacoes(user_id,titulo,mensagem,tipo,link)
        VALUES (u.user_id,
          CASE WHEN r.status='atrasado' THEN 'Conta a pagar vencida' ELSE 'Conta a pagar vencendo' END,
          COALESCE(r.descricao,'Conta')||' • '||to_char(r.vencimento,'DD/MM')||' • ref '||r.id::text,
          CASE WHEN r.status='atrasado' THEN 'error' ELSE 'warning' END,
          '/app/financeiro');
      END IF;
    END LOOP;

    FOR r IN
      SELECT cr.id, COALESCE(c.razao_social,'Recebível') as descricao, cr.vencimento, cr.valor, cr.status
      FROM public.contas_receber cr
      LEFT JOIN public.vendas v ON v.id = cr.venda_id
      LEFT JOIN public.clientes c ON c.id = v.cliente_id
      WHERE cr.status IN ('pendente','atrasado')
        AND cr.vencimento <= current_date + INTERVAL '3 days'
    LOOP
      IF NOT EXISTS (
        SELECT 1 FROM public.notificacoes
        WHERE user_id = u.user_id AND link = '/app/financeiro'
          AND titulo = CASE WHEN r.status='atrasado' THEN 'Recebível vencido' ELSE 'Recebível vencendo' END
          AND mensagem LIKE '%'||r.id::text||'%'
          AND created_at::date = current_date
      ) THEN
        INSERT INTO public.notificacoes(user_id,titulo,mensagem,tipo,link)
        VALUES (u.user_id,
          CASE WHEN r.status='atrasado' THEN 'Recebível vencido' ELSE 'Recebível vencendo' END,
          r.descricao||' • '||to_char(r.vencimento,'DD/MM')||' • ref '||r.id::text,
          CASE WHEN r.status='atrasado' THEN 'error' ELSE 'warning' END,
          '/app/financeiro');
      END IF;
    END LOOP;
  END LOOP;
END $$;

GRANT EXECUTE ON FUNCTION public.atualizar_status_contas() TO authenticated;
