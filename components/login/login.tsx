"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Autoplay from "embla-carousel-autoplay";
import { ViewColumnsIcon } from "@heroicons/react/24/solid";
import { toast } from "sonner";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStoredSession, saveSession } from "@/lib/auth/session";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const companyName = "Kiments CRM";
  const systemVersion = "v1.0.0";
  const carouselImages = [
    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=80",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80",
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80",
  ];

  useEffect(() => {
    if (getStoredSession()) {
      router.replace("/chat");
    }
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      saveSession(email.trim());
      toast.success("Sesion iniciada correctamente");
      router.push("/chat");
    } catch {
      toast.error("Error al iniciar sesion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md">
              <ViewColumnsIcon className="size-4" />
            </div>
            <h1 className="font-medium">{companyName}</h1>
          </div>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="mb-1 flex items-center justify-center rounded-2xl">
                  <ViewColumnsIcon className="size-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold">Inicia sesion en tu cuenta</h1>
                <p className="text-balance text-sm text-muted-foreground">
                  Ingresa tu email para acceder a {companyName}
                </p>
              </div>

              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@ejemplo.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Contrasena</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Iniciando sesion...
                    </span>
                  ) : (
                    "Iniciar Sesion"
                  )}
                </Button>
              </div>

              <div className="text-center text-xs text-muted-foreground">
                Version {systemVersion}
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden lg:block">
        <Carousel
          opts={{
            loop: true,
            align: "start",
          }}
          plugins={[
            Autoplay({
              delay: 3000,
              stopOnInteraction: false,
            }),
          ]}
          className="h-full w-full"
        >
          <CarouselContent className="h-screen">
            {carouselImages.map((image, index) => (
              <CarouselItem key={image} className="relative h-full">
                <Image
                  src={image}
                  alt={`Login background ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  unoptimized
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
}
