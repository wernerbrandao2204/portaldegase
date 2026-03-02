import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { ChevronDown, ExternalLink } from "lucide-react";

interface MenuItem {
  id: number;
  label: string;
  linkType: "internal" | "external";
  internalPageId?: number | null;
  externalUrl?: string | null;
  parentId?: number | null;
  sortOrder: number;
  isActive: boolean;
  openInNewTab: boolean;
  page?: {
    id: number;
    slug: string;
    title: string;
  };
}

interface DropdownMenuProps {
  items: MenuItem[];
  className?: string;
}

export function DropdownMenu({ items, className = "" }: DropdownMenuProps) {
  const [openDropdowns, setOpenDropdowns] = useState<Set<number>>(new Set());
  const timeoutRef = useRef<NodeJS.Timeout>();

  const getMenuLink = (item: MenuItem) => {
    if (item.linkType === "internal" && item.page) {
      return `/paginas/${item.page.slug}`;
    }
    return item.externalUrl || "#";
  };

  const toggleDropdown = (id: number) => {
    const newOpen = new Set(openDropdowns);
    if (newOpen.has(id)) {
      newOpen.delete(id);
    } else {
      newOpen.add(id);
    }
    setOpenDropdowns(newOpen);
  };

  const handleMouseEnter = (id: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const newOpen = new Set(openDropdowns);
    newOpen.add(id);
    setOpenDropdowns(newOpen);
  };

  const handleMouseLeave = (id: number) => {
    timeoutRef.current = setTimeout(() => {
      const newOpen = new Set(openDropdowns);
      newOpen.delete(id);
      setOpenDropdowns(newOpen);
    }, 150);
  };

  const renderMenuItems = (parentId: number | null = null): JSX.Element | null => {
    const filtered = items
      .filter(item => item.parentId === parentId && item.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    if (filtered.length === 0) return null;

    return (
      <ul className="space-y-0">
        {filtered.map(item => {
          const hasChildren = items.some(child => child.parentId === item.id && child.isActive);
          const isOpen = openDropdowns.has(item.id);
          const href = getMenuLink(item);

          if (hasChildren) {
            return (
              <li
                key={item.id}
                className="relative group"
                onMouseEnter={() => handleMouseEnter(item.id)}
                onMouseLeave={() => handleMouseLeave(item.id)}
              >
                <button
                  onClick={() => toggleDropdown(item.id)}
                  className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-md transition-colors flex items-center justify-between group-hover:bg-white/15"
                >
                  <span>{item.label}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isOpen && (
                  <div className="absolute left-0 mt-0 w-48 bg-white text-gray-900 rounded-md shadow-lg border border-gray-200 z-50">
                    {renderSubmenu(item.id)}
                  </div>
                )}
              </li>
            );
          }

          return (
            <li key={item.id}>
              {item.linkType === "internal" ? (
                <Link
                  href={href}
                  className="block px-4 py-2 hover:bg-white/10 rounded-md transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  href={href}
                  target={item.openInNewTab ? "_blank" : "_self"}
                  rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                  className="block px-4 py-2 hover:bg-white/10 rounded-md transition-colors flex items-center gap-1"
                >
                  {item.label}
                  {item.openInNewTab && <ExternalLink size={12} />}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  const renderSubmenu = (parentId: number): JSX.Element | null => {
    const filtered = items
      .filter(item => item.parentId === parentId && item.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    if (filtered.length === 0) return null;

    return (
      <ul className="space-y-0 py-2">
        {filtered.map(item => {
          const href = getMenuLink(item);

          return (
            <li key={item.id}>
              {item.linkType === "internal" ? (
                <Link
                  href={href}
                  className="block px-4 py-2 hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-colors text-sm"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  href={href}
                  target={item.openInNewTab ? "_blank" : "_self"}
                  rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                  className="block px-4 py-2 hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-colors text-sm flex items-center gap-1"
                >
                  {item.label}
                  {item.openInNewTab && <ExternalLink size={12} />}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <nav className={className} role="navigation" aria-label="Menu principal com categorias">
      {renderMenuItems()}
    </nav>
  );
}
