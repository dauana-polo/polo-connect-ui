import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface Filtros {
  periodo: string;
  consultor: string;
  palestrante: string;
  cliente: string;
}

export interface Option {
  id: string;
  nome: string;
}

export function KanbanFilters({
  filtros,
  setFiltros,
  consultores,
  palestrantes,
  clientes,
}: {
  filtros: Filtros;
  setFiltros: (f: Filtros) => void;
  consultores: Option[];
  palestrantes: Option[];
  clientes: Option[];
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      <Select value={filtros.periodo} onValueChange={(v) => setFiltros({ ...filtros, periodo: v })}>
        <SelectTrigger><SelectValue placeholder="Período" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os períodos</SelectItem>
          <SelectItem value="7">Próximos 7 dias</SelectItem>
          <SelectItem value="30">Próximos 30 dias</SelectItem>
          <SelectItem value="90">Próximos 90 dias</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filtros.consultor} onValueChange={(v) => setFiltros({ ...filtros, consultor: v })}>
        <SelectTrigger><SelectValue placeholder="Consultor" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos consultores</SelectItem>
          {consultores.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filtros.palestrante} onValueChange={(v) => setFiltros({ ...filtros, palestrante: v })}>
        <SelectTrigger><SelectValue placeholder="Palestrante" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos palestrantes</SelectItem>
          {palestrantes.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filtros.cliente} onValueChange={(v) => setFiltros({ ...filtros, cliente: v })}>
        <SelectTrigger><SelectValue placeholder="Cliente" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos clientes</SelectItem>
          {clientes.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
