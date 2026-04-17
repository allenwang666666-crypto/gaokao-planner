import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { APP_CODENAME, APP_VERSION } from "@/lib/version";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "首页" },
  { href: "/intake", label: "信息采集" },
  { href: "/results", label: "推荐结果" },
  { href: "/plan", label: "志愿表" }
];

export function SiteHeader({ className }: { className?: string }) {
  return (
    <header className={cn("sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="text-primary">志愿决策</span>
          <Badge variant="secondary" className="font-normal">
            {APP_CODENAME} · {APP_VERSION}
          </Badge>
        </Link>
        <Separator orientation="vertical" className="hidden h-6 sm:block" />
        <nav className="flex flex-1 flex-wrap items-center gap-1 text-sm text-muted-foreground sm:gap-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-2 py-1.5 transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
