import Image from "next/image";
import { UserIcon as UserIconSolid } from "@heroicons/react/24/solid";

export function ChatAvatar() {
  return (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
      <UserIconSolid className="h-5 w-5 text-muted-foreground" />
      <Image
        src="/svg/whatsapp.svg"
        alt="WhatsApp"
        width={18}
        height={18}
        className="absolute -bottom-0.5 -right-0.5 h-[18px] w-[18px] object-contain"
      />
    </div>
  );
}
