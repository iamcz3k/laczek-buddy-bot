import { Link } from "@tanstack/react-router";
import { BookOpen, Bot, CircleHelp, Home, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const links = [
  { to: "/" as const, label: "Home", icon: Home },
  { to: "/commands" as const, label: "Commands", icon: BookOpen },
  { to: "/how-to-use" as const, label: "How to Use", icon: CircleHelp },
  { to: "/about" as const, label: "About", icon: Bot },
];

export function SiteMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Open website menu" title="Menu">
          <Menu />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 rounded-lg border-border bg-popover p-2">
        <DropdownMenuLabel className="text-xs text-muted-foreground">LACZEK MD</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {links.map(({ to, label, icon: Icon }) => (
          <DropdownMenuItem key={to} asChild className="cursor-pointer rounded-md p-0">
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              activeProps={{ className: "bg-accent text-accent-foreground" }}
              className="flex w-full items-center gap-3 px-3 py-2.5"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}