
revoke execute on function public.criar_kanban_venda() from public, anon, authenticated;
revoke execute on function public.calcular_comissoes() from public, anon, authenticated;
revoke execute on function public.gerar_numero_contrato() from public, anon, authenticated;
revoke execute on function public.meu_perfil() from public, anon;
grant execute on function public.meu_perfil() to authenticated;
