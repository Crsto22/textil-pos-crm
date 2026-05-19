import Image from "next/image";
import { UserIcon as UserIconSolid } from "@heroicons/react/24/solid";

export function ChatAvatar() {
  return (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
      <UserIconSolid className="h-5 w-5" />
      <Image
        src="/svg/whatsapp.svg"
        alt="WhatsApp"
        width={20}
        height={20}
        className="absolute -bottom-1 -right-1 h-5 w-5 object-contain"
      />
    </div>
  );
}
