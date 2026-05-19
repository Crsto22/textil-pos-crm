import { ModulePage } from "@/components/ModulePage";

export default function ReportesPage() {
  return (
    <ModulePage
      title="Reportes"
      description="Resumen de indicadores para medir conversaciones, conversiones y rendimiento comercial."
      metrics={[
        { label: "Conversion", value: "18%" },
        { label: "Atendidos", value: "342" },
        { label: "Ingresos", value: "S/ 24k" },
      ]}
      items={[
        "Reporte semanal generado",
        "Campana con mejor conversion detectada",
        "Exportacion comercial disponible",
      ]}
    />
  );
}
