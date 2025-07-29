-- Migração para melhorar o painel administrativo

-- 1. Garantir que a tabela admin_actions tenha todas as colunas necessárias
ALTER TABLE public.admin_actions 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS ip_address INET,
ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- 2. Criar índices para melhor performance nas consultas admin
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON public.admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON public.admin_actions(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action_type ON public.admin_actions(action_type);

CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON public.support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at);

-- 3. Melhorar políticas RLS para admins
-- Função para verificar se é admin (evita recursão)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 4. Políticas para payments (admin pode ver todos)
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
CREATE POLICY "Admins can view all payments" ON public.payments
FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;
CREATE POLICY "Admins can manage payments" ON public.payments
FOR ALL USING (public.is_admin());

-- 5. Políticas para subscriptions (admin pode ver todos)
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions
FOR ALL USING (public.is_admin());

-- 6. Políticas para support_tickets (admin pode ver todos)
DROP POLICY IF EXISTS "Admins can view all support tickets" ON public.support_tickets;
CREATE POLICY "Admins can view all support tickets" ON public.support_tickets
FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage support tickets" ON public.support_tickets;
CREATE POLICY "Admins can manage support tickets" ON public.support_tickets
FOR ALL USING (public.is_admin());

-- 7. Políticas para system_settings (apenas admin)
DROP POLICY IF EXISTS "Admins can manage system settings" ON public.system_settings;
CREATE POLICY "Admins can manage system settings" ON public.system_settings
FOR ALL USING (public.is_admin());

-- 8. Políticas para subscription_plans (admin pode gerenciar)
DROP POLICY IF EXISTS "Admins can manage subscription plans" ON public.subscription_plans;
CREATE POLICY "Admins can manage subscription plans" ON public.subscription_plans
FOR ALL USING (public.is_admin());

-- 9. Função para registrar ações administrativas
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action_type TEXT,
  p_target_type TEXT,
  p_target_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT '',
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  action_id UUID;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem registrar ações';
  END IF;

  INSERT INTO public.admin_actions (
    admin_id,
    action_type,
    target_type,
    target_id,
    description,
    metadata
  ) VALUES (
    auth.uid(),
    p_action_type,
    p_target_type,
    p_target_id,
    p_description,
    p_metadata
  ) RETURNING id INTO action_id;

  RETURN action_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Trigger para log automático de alterações importantes
CREATE OR REPLACE FUNCTION public.log_user_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log alterações em perfis de usuário por admins
  IF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
    PERFORM public.log_admin_action(
      'role_change',
      'user',
      NEW.id,
      format('Role alterado de %s para %s', OLD.role, NEW.role),
      jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger
DROP TRIGGER IF EXISTS log_profile_changes ON public.profiles;
CREATE TRIGGER log_profile_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_user_changes();

-- 11. Função para estatísticas do dashboard admin
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'total_companies', (SELECT COUNT(*) FROM public.companies),
    'total_drivers', (SELECT COUNT(*) FROM public.drivers),
    'total_freights', (SELECT COUNT(*) FROM public.fretes),
    'active_freights', (SELECT COUNT(*) FROM public.fretes WHERE status = 'ativo'),
    'pending_documents', (SELECT COUNT(*) FROM public.document_verifications WHERE overall_status = 'pending'),
    'active_subscriptions', (SELECT COUNT(*) FROM public.subscriptions WHERE status = 'active'),
    'total_revenue', (SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE status = 'succeeded'),
    'monthly_revenue', (
      SELECT COALESCE(SUM(amount), 0) 
      FROM public.payments 
      WHERE status = 'succeeded' 
      AND created_at >= date_trunc('month', CURRENT_DATE)
    )
  ) INTO stats;

  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Criar alguns dados de configuração padrão se não existirem
INSERT INTO public.system_settings (key, value, description) 
VALUES 
  ('platform_name', '"FreteFlow"', 'Nome da plataforma'),
  ('support_email', '"suporte@freteflow.com"', 'Email de suporte'),
  ('maintenance_mode', 'false', 'Modo de manutenção'),
  ('allow_new_registrations', 'true', 'Permitir novos cadastros'),
  ('max_freights_per_company', '100', 'Máximo de fretes por empresa'),
  ('contact_views_free_limit', '5', 'Limite de visualizações gratuitas')
ON CONFLICT (key) DO NOTHING;