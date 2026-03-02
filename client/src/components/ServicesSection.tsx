import { trpc } from "@/lib/trpc";
import { ExternalLink } from "lucide-react";

export default function ServicesSection() {
  const { data: services, isLoading } = trpc.services.list.useQuery();
  const recordClickMutation = trpc.services.recordClick.useMutation();

  const handleServiceClick = (serviceId: number) => {
    recordClickMutation.mutate({ serviceId });
  };

  if (isLoading) {
    return (
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Serviços</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!services || services.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Serviços</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((service) => (
            <a
              key={service.id}
              href={service.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
              onClick={() => handleServiceClick(service.id)}
            >
              <div
                className="h-32 rounded-lg p-4 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer"
                style={{ backgroundColor: service.color }}
              >
                <img
                  src={service.icon}
                  alt={service.name}
                  className="h-12 w-12 object-contain"
                />
                <div className="text-center">
                  <h3 className="text-white font-semibold text-sm group-hover:font-bold transition-all">
                    {service.name}
                  </h3>
                  <ExternalLink size={14} className="text-white/70 mx-auto mt-1 group-hover:text-white transition-all" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
