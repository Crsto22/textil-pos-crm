import { ModulePage } from "@/components/ModulePage";

export default function ConexionPage() {
  return (
    <ModulePage
      title="Conexion"
      description="Panel para revisar canales, integraciones y estado de sincronizacion del CRM."
      metrics={[
        { label: "Canales", value: "5" },
        { label: "Activos", value: "4" },
        { label: "Uptime", value: "99%" },
      ]}
      items={[
        "WhatsApp conectado correctamente",
        "Correo sincronizado hace pocos minutos",
        "Webhook principal esperando eventos",
      ]}
    />
  );
}
