-- Correção de segurança: Adicionar search_path a todas as funções

-- 1. Corrigir função is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- 2. Corrigir função log_admin_action
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action_type TEXT,
  p_target_type TEXT,
  p_target_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT '',
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- 3. Corrigir função log_user_changes
CREATE OR REPLACE FUNCTION public.log_user_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- 4. Corrigir função get_admin_dashboard_stats
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSON 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- 5. Corrigir funções existentes do sistema
CREATE OR REPLACE FUNCTION public.check_driver_contact_limit(driver_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_month TEXT;
  views_count INTEGER;
  limit_count INTEGER;
BEGIN
  current_month := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- Buscar limite do plano atual
  SELECT sp.contact_views_limit INTO limit_count
  FROM subscriptions s
  JOIN subscription_plans sp ON s.plan_id = sp.id
  WHERE s.user_id = driver_user_id
  AND s.status = 'active';
  
  -- Se não encontrou assinatura, usar plano gratuito
  IF limit_count IS NULL THEN
    limit_count := 5;
  END IF;
  
  -- Se ilimitado, retornar -1
  IF limit_count = -1 THEN
    RETURN -1;
  END IF;
  
  -- Contar visualizações do mês atual
  SELECT COUNT(*) INTO views_count
  FROM driver_contact_views dcv
  JOIN drivers d ON dcv.driver_id = d.id
  WHERE d.user_id = driver_user_id
  AND dcv.month_year = current_month;
  
  RETURN limit_count - views_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_company_in_trial(company_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM subscriptions s
    JOIN subscription_plans sp ON s.plan_id = sp.id
    WHERE s.user_id = company_user_id
    AND sp.slug = 'company-trial'
    AND s.status = 'trialing'
    AND s.trial_ends_at > NOW()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.check_cpf_exists(cpf_param text)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(SELECT 1 FROM public.drivers WHERE cpf = cpf_param);
$$;

CREATE OR REPLACE FUNCTION public.check_cnh_exists(cnh_param text)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(SELECT 1 FROM public.drivers WHERE cnh = cnh_param);
$$;

CREATE OR REPLACE FUNCTION public.check_cnpj_exists(cnpj_param text)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(SELECT 1 FROM public.companies WHERE cnpj = cnpj_param);
$$;

CREATE OR REPLACE FUNCTION public.check_company_phone_exists(phone_param text)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(SELECT 1 FROM public.companies WHERE phone = phone_param);
$$;

CREATE OR REPLACE FUNCTION public.check_email_exists(email_param text)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE email = email_param);
$$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'company')
  );
  
  -- Criar registro de verificação de documentos
  INSERT INTO public.document_verifications (user_id, user_role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'company')
  );
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_overall_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Para empresas
  IF NEW.user_role = 'company' THEN
    IF NEW.address_proof_status = 'approved' AND 
       NEW.cnpj_card_status = 'approved' AND 
       NEW.responsible_document_status = 'approved' THEN
      NEW.overall_status = 'approved';
      NEW.verified_at = NOW();
    ELSIF NEW.address_proof_status = 'rejected' OR 
          NEW.cnpj_card_status = 'rejected' OR 
          NEW.responsible_document_status = 'rejected' THEN
      NEW.overall_status = 'rejected';
    ELSIF NEW.address_proof_status = 'pending' OR 
          NEW.cnpj_card_status = 'pending' OR 
          NEW.responsible_document_status = 'pending' THEN
      NEW.overall_status = 'pending';
    END IF;
  END IF;
  
  -- Para motoristas
  IF NEW.user_role = 'driver' THEN
    IF NEW.cnh_document_status = 'approved' AND 
       NEW.photo_status = 'approved' AND 
       NEW.driver_address_proof_status = 'approved' THEN
      NEW.overall_status = 'approved';
      NEW.verified_at = NOW();
    ELSIF NEW.cnh_document_status = 'rejected' OR 
          NEW.photo_status = 'rejected' OR 
          NEW.driver_address_proof_status = 'rejected' THEN
      NEW.overall_status = 'rejected';
    ELSIF NEW.cnh_document_status = 'pending' OR 
          NEW.photo_status = 'pending' OR 
          NEW.driver_address_proof_status = 'pending' THEN
      NEW.overall_status = 'pending';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;