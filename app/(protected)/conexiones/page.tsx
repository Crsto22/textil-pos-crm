"use client"

import { useState } from "react"
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  LinkIcon,
} from "@heroicons/react/24/outline"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface ConnectionItem {
  id: string
  name: string
  platform: string
  icon: string
  token: string
  status: "connected" | "pending" | "disconnected"
  lastSync: string
  messagesReceived: number
}

const INITIAL_CONNECTIONS: ConnectionItem[] = [
  {
    id: "c1",
    name: "WhatsApp Principal",
    platform: "WhatsApp",
    icon: "💬",
    token: "EAASVsxA...kRBRh2Z",
    status: "pending",
    lastSync: "Nunca",
    messagesReceived: 0,
  },
]

const statusMap = {
  connected: { label: "Conectado", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400" },
  pending: { label: "Pendiente", className: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400" },
  disconnected: { label: "Desconectado", className: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400" },
}

const PLATFORM_OPTIONS = ["WhatsApp", "Facebook Messenger", "Instagram DM", "TikTok Shop", "Telegram"]

export default function ConexionesPage() {
  const [connections, setConnections] = useState<ConnectionItem[]>(INITIAL_CONNECTIONS)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "",
    platform: "WhatsApp",
    token: "",
    status: "pending" as ConnectionItem["status"],
  })

  const resetForm = () => {
    setForm({ name: "", platform: "WhatsApp", token: "", status: "pending" })
    setEditingId(null)
  }

  const openAdd = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const openEdit = (conn: ConnectionItem) => {
    setForm({ name: conn.name, platform: conn.platform, token: conn.token, status: conn.status })
    setEditingId(conn.id)
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!form.name.trim() || !form.token.trim()) {
      toast.error("Completa todos los campos requeridos")
      return
    }

    if (editingId) {
      setConnections((current) =>
        current.map((c) =>
          c.id === editingId
            ? { ...c, name: form.name, platform: form.platform, token: form.token, status: form.status }
            : c
        )
      )
      toast.success("Conexion actualizada")
    } else {
      const newConn: ConnectionItem = {
        id: `c-${Date.now()}`,
        name: form.name,
        platform: form.platform,
        icon: "🔗",
        token: form.token,
        status: form.status,
        lastSync: "Nunca",
        messagesReceived: 0,
      }
      setConnections((current) => [...current, newConn])
      toast.success("Conexion agregada")
    }

    setIsModalOpen(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    setConnections((current) => current.filter((c) => c.id !== id))
    toast.success("Conexion eliminada")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Conexiones</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona las integraciones con plataformas de mensajeria
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-foreground/90"
        >
          <PlusIcon className="h-4 w-4" />
          Agregar
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Plataforma
                </th>
                <th className="hidden px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">
                  Token / API Key
                </th>
                <th className="hidden px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">
                  Estado
                </th>
                <th className="hidden px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">
                  Sincronizacion
                </th>
                <th className="hidden px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">
                  Mensajes
                </th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {connections.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <LinkIcon className="mx-auto h-10 w-10 text-muted-foreground/30" />
                    <p className="mt-3 text-sm font-semibold text-muted-foreground">Sin conexiones</p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      Agrega tu primera conexion de mensajeria
                    </p>
                  </td>
                </tr>
              ) : (
                connections.map((conn) => (
                  <tr
                    key={conn.id}
                    className="group transition-colors hover:bg-muted/20"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-lg">
                          {conn.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {conn.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{conn.platform}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-5 py-3.5 md:table-cell">
                      <code className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                        {conn.token.slice(0, 14)}...
                      </code>
                    </td>
                    <td className="hidden px-5 py-3.5 sm:table-cell">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusMap[conn.status].className}`}>
                        {conn.status === "connected" && <CheckCircleIcon className="h-3 w-3" />}
                        {conn.status === "pending" && <ArrowPathIcon className="h-3 w-3" />}
                        {conn.status === "disconnected" && <ExclamationTriangleIcon className="h-3 w-3" />}
                        {statusMap[conn.status].label}
                      </span>
                    </td>
                    <td className="hidden px-5 py-3.5 text-xs text-muted-foreground lg:table-cell">
                      {conn.lastSync}
                    </td>
                    <td className="hidden px-5 py-3.5 text-xs tabular-nums text-foreground lg:table-cell">
                      {conn.messagesReceived.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(conn)}
                          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          title="Editar"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(conn.id)}
                          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                          title="Eliminar"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Agregar/Editar */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Conexion" : "Agregar Conexion"}</DialogTitle>
            <DialogDescription>
              Configura la integracion con una plataforma de mensajeria
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Nombre de la conexion
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ej: WhatsApp Principal"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-muted-foreground/20"
                autoFocus
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Plataforma
              </label>
              <select
                value={form.platform}
                onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-muted-foreground/20"
              >
                {PLATFORM_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Token / API Key
              </label>
              <input
                type="text"
                value={form.token}
                onChange={(e) => setForm((f) => ({ ...f, token: e.target.value }))}
                placeholder="Ingresa el token de acceso"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-muted-foreground/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Estado
              </label>
              <div className="flex gap-2">
                {(["connected", "pending", "disconnected"] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, status }))}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                      form.status === status
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:border-muted-foreground"
                    }`}
                  >
                    {statusMap[status].label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => { setIsModalOpen(false); resetForm() }}
              size="sm"
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} size="sm" className="bg-foreground text-background hover:bg-foreground/90">
              {editingId ? "Guardar Cambios" : "Agregar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
