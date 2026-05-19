import { ModulePage } from "@/components/ModulePage";

export default function ConfiguracionPage() {
  return (
    <ModulePage
      title="Configuracion"
      description="Ajustes principales para usuarios, preferencias, canales y reglas del CRM."
      metrics={[
        { label: "Usuarios", value: "12" },
        { label: "Roles", value: "4" },
        { label: "Reglas", value: "18" },
      ]}
      items={[
        "Preferencias de notificacion actualizadas",
        "Nuevo rol comercial preparado",
        "Horario de atencion guardado",
      ]}
    />
  );
}
