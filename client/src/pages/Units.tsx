import { trpc } from "@/lib/trpc";
import { MapPin, Phone, Mail, Calendar, ExternalLink } from "lucide-react";
import { useState } from "react";

const unitTypes = [
  { value: "", label: "Todas" },
  { value: "internacao", label: "Internação" },
  { value: "internacao_provisoria", label: "Internação Provisória" },
  { value: "semiliberdade", label: "Semiliberdade" },
  { value: "meio_aberto", label: "Meio Aberto" },
];

export default function Units() {
  const [filter, setFilter] = useState("");
  const { data: units, isLoading } = trpc.units.list.useQuery();

  return (
    <main id="main-content" className="py-8">
      <div className="container">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--degase-blue-dark)" }}>Unidades do DEGASE</h1>
        <p className="text-gray-600 mb-6">Conheça as unidades socioeducativas do Estado do Rio de Janeiro.</p>

        <div className="flex flex-wrap gap-2 mb-8">
          {unitTypes.map(type => (
            <button
              key={type.value}
              onClick={() => setFilter(type.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === type.value
                  ? "text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              style={filter === type.value ? { backgroundColor: "var(--degase-blue-dark)" } : {}}
            >
              {type.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse p-4 bg-gray-100 rounded-lg h-40" />
            ))}
          </div>
        ) : units && units.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {units.map((unit: any) => (
              <div key={unit.id} className="p-5 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-sm mb-2" style={{ color: "var(--degase-blue-dark)" }}>{unit.name}</h3>
                <span className="inline-block px-2 py-0.5 text-xs rounded-full text-white mb-3" style={{ backgroundColor: "var(--degase-blue-light)" }}>
                  {unitTypes.find(t => t.value === unit.type)?.label || unit.type}
                </span>
                {unit.address && (
                  <p className="text-xs text-gray-600 flex items-start gap-1 mb-1">
                    <MapPin size={12} className="mt-0.5 shrink-0" /> {unit.address}
                  </p>
                )}
                {unit.phone && (
                  <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                    <Phone size={12} className="shrink-0" /> {unit.phone}
                  </p>
                )}
                {unit.email && (
                  <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                    <Mail size={12} className="shrink-0" /> {unit.email}
                  </p>
                )}
                {unit.visitDays && (
                  <p className="text-xs text-gray-600 flex items-start gap-1 mb-1">
                    <Calendar size={12} className="mt-0.5 shrink-0" /> {unit.visitDays}
                  </p>
                )}
                {unit.mapsUrl && (
                  <a href={unit.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1 mt-2 hover:underline" style={{ color: "var(--degase-blue-light)" }}>
                    <ExternalLink size={12} /> Como chegar
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <MapPin className="mx-auto mb-4 text-gray-300" size={64} />
            <p className="text-gray-500">Nenhuma unidade cadastrada ainda.</p>
            <p className="text-sm text-gray-400 mt-1">As unidades serão exibidas aqui após serem cadastradas no painel administrativo.</p>
          </div>
        )}
      </div>
    </main>
  );
}
