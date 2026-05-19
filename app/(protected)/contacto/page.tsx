import { ModulePage } from "@/components/ModulePage";

export default function ContactoPage() {
  return (
    <ModulePage
      title="Contacto"
      description="Vista inicial para administrar clientes, prospectos y datos de relacion comercial."
      metrics={[
        { label: "Contactos", value: "1,280" },
        { label: "Nuevos", value: "32" },
        { label: "Segmentos", value: "8" },
      ]}
      items={[
        "Cliente agregado a lista mayorista",
        "Prospecto actualizado con telefono",
        "Etiqueta VIP aplicada a contacto frecuente",
      ]}
    />
  );
}
