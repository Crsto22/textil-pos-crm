"use client"

import { useState } from "react"
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  ShoppingBagIcon,
  UserIcon as UserIconSolid,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  BuildingLibraryIcon,
  ChevronRightIcon,
  BuildingStorefrontIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline"
import { toast } from "sonner"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface ProductVariant {
  id: string
  name: string
  color: string
  hex: string
  talla: string
  imageUrl: string
  stock: number
}

interface CartItem {
  variant: ProductVariant
  qty: number
}

const CIELO_VARIANTS: ProductVariant[] = [
  {
    id: "cielo-azul", name: "CIELO - Azul", color: "Azul", hex: "#3B82F6", talla: "M",
    imageUrl: "https://storage.kiments.com.pe/productos/producto-22/color-1/debf7b52-bfe5-4f86-8f45-342684ae7978.webp", stock: 10,
  },
  {
    id: "cielo-beige", name: "CIELO - Beige", color: "Beige", hex: "#D4B896", talla: "S",
    imageUrl: "https://storage.kiments.com.pe/productos/producto-22/color-5/d711b3af-6a4b-4632-bb66-ba3505b03150.webp", stock: 8,
  },
  {
    id: "cielo-camel", name: "CIELO - Camel", color: "Camel", hex: "#C19A6B", talla: "L",
    imageUrl: "https://storage.kiments.com.pe/productos/producto-22/color-33/b1e52f00-6215-4b80-a0f3-ce36b1c723f8.webp", stock: 12,
  },
  {
    id: "cielo-chocolate", name: "CIELO - Chocolate", color: "Chocolate", hex: "#7B3F00", talla: "M",
    imageUrl: "https://storage.kiments.com.pe/productos/producto-22/color-12/3eade009-80d0-4c0f-b7fe-6a22002a5a0b.webp", stock: 6,
  },
  {
    id: "cielo-gris", name: "CIELO - Gris Oscuro", color: "Gris Oscuro", hex: "#2F2F2F", talla: "XL",
    imageUrl: "https://storage.kiments.com.pe/productos/producto-22/color-12/3eade009-80d0-4c0f-b7fe-6a22002a5a0b.webp", stock: 5,
  },
]

type PaymentKey = "EFECTIVO" | "YAPE" | "PLIN" | "TRANSFERENCIA" | "TARJETA"

const PAYMENT_METHODS = [
  { key: "EFECTIVO" as PaymentKey, label: "Efectivo", description: "Pago en efectivo", color: "#22c55e", ringColor: "ring-green-500", icon: <BanknotesIcon className="h-4 w-4" /> },
  { key: "YAPE" as PaymentKey, label: "Yape", description: "Pago con Yape", color: "#7c3aed", ringColor: "ring-purple-500", icon: <DevicePhoneMobileIcon className="h-4 w-4" /> },
  { key: "PLIN" as PaymentKey, label: "Plin", description: "Pago con Plin", color: "#3b82f6", ringColor: "ring-blue-500", icon: <DevicePhoneMobileIcon className="h-4 w-4" /> },
  { key: "TRANSFERENCIA" as PaymentKey, label: "Transferencia", description: "Transferencia bancaria", color: "#f97316", ringColor: "ring-orange-500", icon: <BuildingLibraryIcon className="h-4 w-4" /> },
  { key: "TARJETA" as PaymentKey, label: "Tarjeta", description: "Pago con tarjeta", color: "#ec4899", ringColor: "ring-pink-500", icon: <CreditCardIcon className="h-4 w-4" /> },
]

const COLOR_FILTERS = ["Todos", ...Array.from(new Set(CIELO_VARIANTS.map((v) => v.color)))]
const COMPROBANTES = ["BOLETA", "FACTURA", "NOTA DE VENTA"]
const CIELO_PRICE = 89

interface MockVenta {
  id: string
  fecha: string
  comprobante: string
  total: number
  items: { variantId: string; color: string; qty: number; hex: string; imageUrl: string }[]
}

const MOCK_VENTAS: MockVenta[] = [
  {
    id: "V-1042", fecha: "05/08/2026", comprobante: "BOLETA", total: 267,
    items: [
      { variantId: "cielo-azul", color: "Azul", qty: 2, hex: "#3B82F6", imageUrl: CIELO_VARIANTS[0].imageUrl },
      { variantId: "cielo-camel", color: "Camel", qty: 1, hex: "#C19A6B", imageUrl: CIELO_VARIANTS[2].imageUrl },
    ],
  },
  {
    id: "V-0987", fecha: "28/07/2026", comprobante: "BOLETA", total: 178,
    items: [
      { variantId: "cielo-beige", color: "Beige", qty: 1, hex: "#D4B896", imageUrl: CIELO_VARIANTS[1].imageUrl },
      { variantId: "cielo-azul", color: "Azul", qty: 1, hex: "#3B82F6", imageUrl: CIELO_VARIANTS[0].imageUrl },
    ],
  },
  {
    id: "V-0823", fecha: "15/07/2026", comprobante: "FACTURA", total: 445,
    items: [
      { variantId: "cielo-camel", color: "Camel", qty: 2, hex: "#C19A6B", imageUrl: CIELO_VARIANTS[2].imageUrl },
      { variantId: "cielo-chocolate", color: "Chocolate", qty: 2, hex: "#7B3F00", imageUrl: CIELO_VARIANTS[3].imageUrl },
      { variantId: "cielo-gris", color: "Gris Oscuro", qty: 1, hex: "#2F2F2F", imageUrl: CIELO_VARIANTS[4].imageUrl },
    ],
  },
  {
    id: "V-0741", fecha: "02/07/2026", comprobante: "BOLETA", total: 89,
    items: [
      { variantId: "cielo-azul", color: "Azul", qty: 1, hex: "#3B82F6", imageUrl: CIELO_VARIANTS[0].imageUrl },
    ],
  },
]

const monthlyData = [
  { mes: "Jul", monto: 623, porcentaje: 100 },
  { mes: "Ago", monto: 267, porcentaje: 43 },
  { mes: "Jun", monto: 89, porcentaje: 14 },
]

const productosMasComprados = CIELO_VARIANTS.map((v) => {
  let totalQty = 0
  MOCK_VENTAS.forEach((venta) => {
    venta.items.forEach((item) => {
      if (item.variantId === v.id) totalQty += item.qty
    })
  })
  return { ...v, totalQty, totalMonto: totalQty * CIELO_PRICE }
}).filter((p) => p.totalQty > 0).sort((a, b) => b.totalQty - a.totalQty)

interface ChatSidebarProps {
  clientPhone: string
  onClose: () => void
  onSendToChat?: (message: string) => void
}

export function ChatSidebar({ clientPhone, onClose, onSendToChat }: ChatSidebarProps) {
  const [activeTab, setActiveTab] = useState<"venta" | "ventas">("venta")
  const [cart, setCart] = useState<CartItem[]>([])
  const [isPaymentStep, setIsPaymentStep] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<PaymentKey | null>(null)
  const [operationCode, setOperationCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCatalog, setShowCatalog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeColorFilter, setActiveColorFilter] = useState("Todos")
  const [comprobante, setComprobante] = useState("BOLETA")
  const [showComprobantePicker, setShowComprobantePicker] = useState(false)

  const filteredVariants = CIELO_VARIANTS.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.color.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesColor = activeColorFilter === "Todos" || v.color === activeColorFilter
    return matchesSearch && matchesColor
  })

  const openCatalog = () => { setSearchQuery(""); setActiveColorFilter("Todos"); setShowCatalog(true) }

  const addToCart = (variant: ProductVariant) => {
    setCart((current) => {
      const existing = current.find((item) => item.variant.id === variant.id)
      if (existing) {
        if (existing.qty >= variant.stock) return current
        return current.map((item) => item.variant.id === variant.id ? { ...item, qty: item.qty + 1 } : item)
      }
      return [...current, { variant, qty: 1 }]
    })
    toast.success(`CIELO ${variant.color} agregado`)
    setShowCatalog(false)
  }

  const removeFromCart = (variantId: string) => {
    setCart((current) => current.filter((item) => item.variant.id !== variantId))
  }

  const updateQty = (variantId: string, delta: number) => {
    setCart((current) =>
      current.map((item) => {
        if (item.variant.id !== variantId) return item
        return { ...item, qty: Math.max(0, Math.min(item.variant.stock, item.qty + delta)) }
      }).filter((item) => item.qty > 0)
    )
  }

  const subtotal = cart.reduce((sum, item) => sum + CIELO_PRICE * item.qty, 0)
  const igv = subtotal * 0.18
  const total = subtotal
  const canContinueToPayment = cart.length > 0
  const canConfirm = canContinueToPayment && selectedPayment !== null
  const requiresOperationCode = selectedPayment && ["YAPE", "PLIN", "TRANSFERENCIA"].includes(selectedPayment)

  const handleContinueToPayment = () => { setSelectedPayment(null); setOperationCode(""); setIsPaymentStep(true) }
  const handleReturnToCart = () => setIsPaymentStep(false)

  const handleConfirmSale = () => {
    if (!canConfirm || isSubmitting) return
    setIsSubmitting(true)
    toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
      loading: "Registrando venta...",
      success: () => {
        setCart([]); setSelectedPayment(null); setOperationCode(""); setIsPaymentStep(false); setIsSubmitting(false)
        return { message: `Venta registrada - ${comprobante}`, action: { label: "Ver venta", onClick: () => toast.info("Venta #1005 - Mock") } }
      },
      error: "Error al registrar",
    })
  }

  const handleSendPdf = (ventaId: string) => {
    if (onSendToChat) {
      onSendToChat(`📄 PDF ${ventaId} - Comprobante enviado al cliente`)
    }
    toast.success(`PDF ${ventaId} enviado al WhatsApp del cliente`, {
      action: { label: "Ver PDF", onClick: () => toast.info(`PDF ${ventaId} - Mock`) },
    })
  }

  const totalVentas = MOCK_VENTAS.length
  const totalMonto = MOCK_VENTAS.reduce((s, v) => s + v.total, 0)
  const isExistingClient = clientPhone === "932889985"

  return (
    <div className="flex h-full flex-col border-l border-border bg-background">
      
      {/* Header con Tabs */}
      <div className="flex shrink-0 items-center gap-1 border-b border-border bg-muted/30 px-1.5 py-1">
        <div className="flex flex-1 gap-0.5 rounded-lg bg-muted/50 p-0.5">
          <button
            onClick={() => setActiveTab("venta")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-semibold transition-all ${
              activeTab === "venta" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShoppingBagIcon className="h-3.5 w-3.5" />
            Venta Rapida
          </button>
          <button
            onClick={() => setActiveTab("ventas")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-semibold transition-all ${
              activeTab === "ventas" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ChartBarIcon className="h-3.5 w-3.5" />
            Ventas
          </button>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground"
          aria-label="Cerrar panel"
        >
          <XMarkIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Client Info - siempre visible */}
      <div className="shrink-0 flex flex-col gap-1.5 border-b border-border px-3 py-2.5">
        <button className="flex items-center gap-2 rounded-xl border border-border bg-background px-2.5 py-2 text-left transition hover:bg-muted/50 shadow-sm">
          <UserIconSolid className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
          <div className="min-w-0 flex-1">
            <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Cliente</p>
            <p className="truncate text-[10px] font-medium text-foreground">{clientPhone}</p>
          </div>
          <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${
            isExistingClient
              ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400"
              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
          }`}>
            {isExistingClient ? `${totalVentas} compras` : "Nuevo"}
          </span>
        </button>
      </div>

      {/* ==================== TAB: VENTA RAPIDA ==================== */}
      {activeTab === "venta" ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">

          {showCatalog ? (
            /* CATALOG DRAWER */
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
                <button onClick={() => setShowCatalog(false)} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">
                  <ArrowLeftIcon className="h-3 w-3" /> Volver
                </button>
                <span className="text-xs font-semibold text-foreground">CIELO</span>
                <span className="ml-auto text-[11px] text-muted-foreground">S/{CIELO_PRICE.toFixed(2)}</span>
              </div>
              <div className="shrink-0 px-3 pt-2">
                <div className="relative">
                  <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por color..." className="w-full rounded-lg border border-border bg-muted/50 py-1.5 pl-8 pr-3 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-muted-foreground/20" />
                </div>
              </div>
              <div className="flex shrink-0 gap-1.5 overflow-x-auto px-3 py-2">
                {COLOR_FILTERS.map((color) => {
                  const variant = CIELO_VARIANTS.find((v) => v.color === color)
                  return (
                    <button key={color} onClick={() => setActiveColorFilter(color)}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-all ${
                        activeColorFilter === color ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-muted-foreground" }`}>
                      {color !== "Todos" && variant && <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: variant.hex }} />}
                      {color}
                    </button>
                  )
                })}
              </div>
              <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-3">
                {filteredVariants.length === 0 ? (
                  <p className="py-8 text-center text-xs text-muted-foreground">Sin variantes</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {filteredVariants.map((variant) => (
                      <button key={variant.id} onClick={() => addToCart(variant)}
                        className="flex flex-col overflow-hidden rounded-xl border border-border bg-background text-left transition-all hover:shadow-md hover:border-muted-foreground/30 active:scale-[0.98]">
                        <div className="relative aspect-square w-full bg-muted/30">
                          <Image src={variant.imageUrl} alt={variant.color} fill className="object-cover" sizes="140px" />
                          {variant.stock <= 5 && (
                            <span className="absolute top-1.5 left-1.5 rounded-md bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">Quedan {variant.stock}</span>
                          )}
                        </div>
                        <div className="p-2">
                          <div className="flex items-center gap-1.5">
                            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: variant.hex }} />
                            <p className="text-[11px] font-semibold text-foreground">{variant.color}</p>
                          </div>
                          <p className="mt-0.5 text-[10px] text-muted-foreground leading-tight">
                            <span className="inline-flex items-center rounded bg-muted px-1 py-px text-[9px] font-medium">{variant.hex}</span>
                            {" "}· Talla {variant.talla} · Stock {variant.stock}
                          </p>
                          <p className="mt-1 text-xs font-bold text-foreground">S/{CIELO_PRICE.toFixed(2)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* SELECTORES + CARRITO + PAGO */
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="shrink-0 flex flex-col gap-1.5 border-b border-border px-3 py-2.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <button type="button" className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-2.5 py-2 text-left transition hover:bg-muted/50 shadow-sm">
                    <BuildingStorefrontIcon className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Sucursal</p>
                      <p className="truncate text-[10px] font-medium text-foreground">Principal</p>
                    </div>
                    <ChevronRightIcon className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                  </button>
                  <div className="relative">
                    <button type="button" onClick={() => setShowComprobantePicker(!showComprobantePicker)}
                      className="flex w-full items-center gap-1.5 rounded-xl border border-border bg-background px-2.5 py-2 text-left transition hover:bg-muted/50 shadow-sm">
                      <ClipboardDocumentListIcon className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Comprobante</p>
                        <p className="truncate text-[10px] font-medium text-foreground">{comprobante.charAt(0) + comprobante.slice(1).toLowerCase()}</p>
                      </div>
                      <ChevronRightIcon className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                    </button>
                    {showComprobantePicker && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl border border-border bg-popover p-1 shadow-lg">
                        {COMPROBANTES.map((c) => (
                          <button key={c} onClick={() => { setComprobante(c); setShowComprobantePicker(false) }}
                            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-colors ${comprobante === c ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"}`}>
                            {c.charAt(0) + c.slice(1).toLowerCase()}
                            {comprobante === c && <CheckCircleIcon className="h-3 w-3" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative min-h-0 flex-1 overflow-hidden">
                <div className={`flex h-full w-[200%] will-change-transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isPaymentStep ? "-translate-x-1/2" : "translate-x-0"}`}>
                  {/* LEFT: Cart */}
                  <div className="flex h-full w-1/2 shrink-0 flex-col gap-2 px-3 py-2.5">
                    {cart.length > 0 ? (
                      <>
                        <div className="flex shrink-0 items-center justify-between">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pedido Actual ({cart.reduce((s, i) => s + i.qty, 0)})</p>
                          <button onClick={() => setCart([])} className="text-[10px] text-red-400 hover:text-red-500">Vaciar</button>
                        </div>
                        <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto rounded-lg border border-border">
                          {cart.map((item, idx) => (
                            <div key={`${item.variant.id}-${idx}`} className="flex items-center gap-2 border-b border-border px-2.5 py-2 last:border-b-0">
                              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-muted/30">
                                <Image src={item.variant.imageUrl} alt={item.variant.color} fill className="object-cover" sizes="36px" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[11px] font-medium text-foreground">CIELO · {item.variant.color}</p>
                                <p className="text-[9px] text-muted-foreground">Talla {item.variant.talla} · S/{CIELO_PRICE.toFixed(2)} c/u</p>
                              </div>
                              <div className="flex items-center gap-0.5">
                                <button onClick={() => updateQty(item.variant.id, -1)} className="flex h-5 w-5 items-center justify-center rounded text-[11px] text-muted-foreground hover:bg-muted">-</button>
                                <span className="w-5 text-center text-[11px] font-semibold tabular-nums text-foreground">{item.qty}</span>
                                <button onClick={() => updateQty(item.variant.id, 1)} className="flex h-5 w-5 items-center justify-center rounded text-[11px] text-muted-foreground hover:bg-muted">+</button>
                              </div>
                              <button onClick={() => removeFromCart(item.variant.id)} className="flex h-5 w-5 items-center justify-center rounded text-red-400 hover:bg-red-50"><TrashIcon className="h-3 w-3" /></button>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
                        <ShoppingBagIcon className="h-10 w-10 opacity-20" />
                        <p className="text-xs">Pedido vacio</p>
                        <p className="text-[10px]">Agrega productos desde el catalogo</p>
                      </div>
                    )}
                    <button type="button" onClick={openCatalog}
                      className="shrink-0 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-blue-300 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20">
                      <PlusIcon className="h-3.5 w-3.5" /> Agregar Producto
                    </button>
                  </div>

                  {/* RIGHT: Payment */}
                  <div className="flex h-full w-1/2 shrink-0 flex-col gap-2 px-3 py-2.5">
                    <div className="flex shrink-0 items-center justify-between">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Metodo de Pago</p>
                      <button onClick={handleReturnToCart} className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                        <ArrowLeftIcon className="h-3 w-3" /> Volver
                      </button>
                    </div>
                    <div className="sidebar-scroll min-h-0 flex-1 space-y-1.5 overflow-y-auto">
                      {PAYMENT_METHODS.map((method) => (
                        <button key={method.key} onClick={() => setSelectedPayment(method.key)}
                          className={`flex w-full items-center gap-2 rounded-xl border-2 p-2.5 text-left transition-all ${selectedPayment === method.key ? `${method.ringColor} shadow-sm` : "border-border hover:border-muted-foreground/30"}`}
                          style={selectedPayment === method.key ? { borderColor: method.color } : undefined}>
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white" style={{ backgroundColor: method.color }}>{method.icon}</div>
                          <div className="min-w-0 flex-1"><p className="text-[11px] font-semibold text-foreground">{method.label}</p><p className="text-[9px] text-muted-foreground">{method.description}</p></div>
                          <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${selectedPayment === method.key ? "border-transparent" : "border-muted-foreground/30"}`}
                            style={selectedPayment === method.key ? { backgroundColor: method.color } : undefined}>
                            {selectedPayment === method.key && <CheckCircleIcon className="h-3.5 w-3.5 text-white" />}
                          </div>
                        </button>
                      ))}
                    </div>
                    {requiresOperationCode && (
                      <div className="shrink-0">
                        <label className="mb-0.5 block text-[10px] font-medium text-foreground">Codigo de Operacion</label>
                        <input type="text" value={operationCode} onChange={(e) => setOperationCode(e.target.value)}
                          placeholder="Ingresa el codigo..." className="w-full rounded-lg border border-border bg-muted/50 px-2.5 py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-muted-foreground/20" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Venta Rapida */}
          <div className="shrink-0 overflow-hidden rounded-t-2xl border-t border-border bg-background shadow-[0_-4px_20px_rgba(0,0,0,0.07)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)] px-3 pb-3 pt-2.5">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground"><span>Subtotal</span><span className="tabular-nums">S/{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-[10px] text-muted-foreground"><span>IGV (18%)</span><span className="tabular-nums">S/{igv.toFixed(2)}</span></div>
              <div className="flex items-end justify-between border-t border-border pt-1.5">
                <div><p className="text-[9px] font-semibold text-muted-foreground">Total a Pagar</p><p className="mt-0.5 text-lg font-extrabold leading-none tracking-tight text-foreground tabular-nums">S/{total.toFixed(2)}</p></div>
                {isPaymentStep ? (
                  <Button onClick={handleConfirmSale} disabled={!canConfirm || isSubmitting}
                    className="h-auto rounded-[22px] px-5 py-2 text-xs font-bold transition-all duration-200 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50">
                    {isSubmitting ? <><ArrowPathIcon className="h-3.5 w-3.5 animate-spin" /> Registrando...</> : "Confirmar"}
                  </Button>
                ) : (
                  <Button onClick={handleContinueToPayment} disabled={!canContinueToPayment}
                    className="h-auto rounded-[22px] px-5 py-2 text-xs font-bold transition-all duration-200 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50">
                    Continuar al Pago
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ==================== TAB: VENTAS ==================== */
        <div className="sidebar-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-3">

          {!isExistingClient ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <ChartBarIcon className="h-12 w-12 text-muted-foreground/30" />
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Sin compras registradas</p>
                <p className="mt-1 text-[11px] text-muted-foreground/70">Realiza tu primera venta desde la pestaña Venta Rapida</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-border bg-background p-3 shadow-sm">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Total Ventas</p>
              <p className="mt-1 text-xl font-extrabold text-foreground">{totalVentas}</p>
              <p className="text-[9px] text-muted-foreground">comprobantes emitidos</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-3 shadow-sm">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Total Monto</p>
              <p className="mt-1 text-xl font-extrabold text-foreground">S/{totalMonto.toFixed(0)}</p>
              <p className="text-[9px] text-muted-foreground">acumulado</p>
            </div>
          </div>

          {/* Grafico mensual */}
          <div className="rounded-xl border border-border bg-background p-3 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Compras por Mes</p>
            <div className="space-y-2">
              {monthlyData.map((m) => (
                <div key={m.mes} className="flex items-center gap-2">
                  <span className="w-7 text-[10px] font-semibold text-foreground">{m.mes}</span>
                  <div className="flex-1 h-4 rounded-full bg-muted/50 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${m.porcentaje}%` }} />
                  </div>
                  <span className="w-12 text-right text-[10px] font-semibold tabular-nums text-foreground">S/{m.monto}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Productos mas comprados */}
          <div className="rounded-xl border border-border bg-background shadow-sm">
            <p className="border-b border-border px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Productos mas comprados</p>
            <div className="max-h-48 overflow-y-auto">
              {productosMasComprados.map((p) => (
                <div key={p.id} className="flex items-center gap-2 border-b border-border px-3 py-2 last:border-b-0">
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-muted/30">
                    <Image src={p.imageUrl} alt={p.color} fill className="object-cover" sizes="36px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: p.hex }} />
                      <p className="truncate text-[11px] font-medium text-foreground">CIELO {p.color}</p>
                    </div>
                    <p className="text-[9px] text-muted-foreground">Talla {p.talla} · {p.totalQty} unid.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-semibold tabular-nums text-foreground">S/{p.totalMonto.toFixed(2)}</p>
                    <p className="text-[9px] text-muted-foreground">x{p.totalQty}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lista de compras con PDF */}
          <div className="rounded-xl border border-border bg-background shadow-sm">
            <p className="border-b border-border px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Historial de Compras</p>
            <div className="max-h-52 overflow-y-auto">
              {MOCK_VENTAS.map((venta) => (
                <div key={venta.id} className="flex items-center gap-2 border-b border-border px-3 py-2.5 last:border-b-0 hover:bg-muted/20 transition-colors">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <DocumentTextIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[11px] font-semibold text-foreground">{venta.id}</p>
                      <span className="shrink-0 rounded bg-muted px-1.5 py-px text-[8px] font-medium text-muted-foreground">{venta.comprobante}</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground">{venta.fecha} · {venta.items.length} productos</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-semibold tabular-nums text-foreground">S/{venta.total.toFixed(2)}</p>
                    <button
                      onClick={() => handleSendPdf(venta.id)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 transition-colors hover:bg-red-200 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                      title="Enviar PDF al WhatsApp"
                    >
                      <PaperAirplaneIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>
          )}
        </div>
      )}

    </div>
  )
}
