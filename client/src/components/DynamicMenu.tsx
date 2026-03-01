import { useState } from "react";
import { Link } from "wouter";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";

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

interface DynamicMenuProps {
  items: MenuItem[];
  onItemClick?: () => void;
  className?: string;
  isHierarchical?: boolean;
}

export function DynamicMenu({
  items,
  onItemClick,
  className = "",
  isHierarchical = true,
}: DynamicMenuProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getMenuLink = (item: MenuItem) => {
    if (item.linkType === "internal" && item.page) {
      return `/paginas/${item.page.slug}`;
    }
    return item.externalUrl || "#";
  };

  const renderMenuItems = (parentId: number | null = null, level = 0) => {
    const filteredItems = items
      .filter((item) => (isHierarchical ? item.parentId === parentId : item.parentId === null))
      .filter((item) => item.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    if (filteredItems.length === 0) return null;

    const isSubmenu = level > 0;

    return (
      <ul className={isSubmenu ? "space-y-0 ml-2 mt-1 border-l border-white/20 pl-2" : "space-y-1"}>
        {filteredItems.map((item) => {
          const hasChildren = items.some(
            (child) => child.parentId === item.id && child.isActive
          );
          const isExpanded = expandedItems.has(item.id);
          const href = getMenuLink(item);

          return (
            <li key={item.id} className="group">
              <div className="flex items-center gap-1">
                {hasChildren && (
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                    aria-label={isExpanded ? "Recolher submenu" : "Expandir submenu"}
                    aria-expanded={isExpanded}
                  >
                    {isSubmenu ? (
                      <ChevronRight
                        size={14}
                        className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      />
                    ) : (
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>
                )}
                {!hasChildren && <div className={isSubmenu ? "w-5" : "w-7"} />}

                {item.linkType === "internal" ? (
                  <Link
                    href={href}
                    onClick={onItemClick}
                    className={`flex-1 px-3 py-2 rounded-md transition-all duration-200 block ${
                      isSubmenu
                        ? "text-sm hover:bg-white/15 hover:translate-x-0.5"
                        : "hover:bg-white/10 group-hover:bg-white/5"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      {item.label}
                      {hasChildren && !isSubmenu && <span className="text-xs opacity-60">▼</span>}
                    </span>
                  </Link>
                ) : (
                  <a
                    href={href}
                    target={item.openInNewTab ? "_blank" : "_self"}
                    rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                    onClick={onItemClick}
                    className={`flex-1 px-3 py-2 rounded-md transition-all duration-200 block ${
                      isSubmenu
                        ? "text-sm hover:bg-white/15 hover:translate-x-0.5"
                        : "hover:bg-white/10 group-hover:bg-white/5"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      {item.label}
                      {item.openInNewTab && <ExternalLink size={12} className="opacity-60" />}
                      {hasChildren && !isSubmenu && <span className="text-xs opacity-60">▼</span>}
                    </span>
                  </a>
                )}
              </div>

              {hasChildren && isExpanded && renderMenuItems(item.id, level + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <nav className={className} role="navigation" aria-label="Menu principal dinâmico">
      {renderMenuItems()}
    </nav>
  );
}
