-- ============================================================
-- Correção: remover SECURITY DEFINER das views bíblicas
-- ============================================================
-- Motivo: O Supabase Database Linter sinalizou que as views
-- public.vw_bible_verses e public.vw_bible_chapters estão com
-- SECURITY DEFINER (default do PostgreSQL para views).
--
-- Isso faz com que as views executem com privilégios do
-- criador, ignorando RLS do usuário consultante.
--
-- Auditoria concluiu:
--   - Ambas só são consumidas pelo backend (service_role)
--   - Nenhum consumer usa anon key
--   - Nenhuma dependência conhecida de SECURITY DEFINER
--   - RLS já permite SELECT público nas tabelas base
--   - Risco: muito baixo, mas corrigível sem impacto
--
-- SQL aplicado em: 2026-07-09
-- ============================================================

ALTER VIEW public.vw_bible_verses SET (security_invoker = on);
ALTER VIEW public.vw_bible_chapters SET (security_invoker = on);

-- ============================================================
-- Validação pós-alteração:
-- 1. As views continuam retornando os mesmos dados
-- 2. O Database Linter não deve mais mostrar o alerta
-- 3. Backend e frontend continuam funcionando normalmente
-- ============================================================