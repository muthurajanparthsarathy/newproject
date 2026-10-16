import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  className,
}: {
  className?: string;
  variant?: "default" | "light";
}) {
  return (
    <Link
      href="/"
      aria-label="Prova Media — Home"
      className={cn("inline-flex items-center", className)}
    >
      <Image
        src="/logo.png"
        alt="Prova Media"
        width={210}
        height={60}
        priority
        className="h-[60px] w-auto object-contain"
      />
    </Link>
  );
}
