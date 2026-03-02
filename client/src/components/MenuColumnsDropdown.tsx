import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ChevronDown } from "lucide-react";

interface MenuItem {
  id: number;
  label: string;
  linkType: string;
  internalPageId?: string;
  externalUrl?: string;
  openInNewTab?: boolean;
  parentId?: number;
}

interface MenuCategory {
  id: number;
  label: string;
  items: MenuItem[];
}

export default function MenuColumnsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const menuQuery = trpc.menu.list.useQuery();

  // Organiza os itens em categorias principais (parentId = null)
  const organizeMenuByColumns = (items: any[]): MenuCategory[] => {
    const mainCategories = items.filter(item => !item.parentId);
    
    return mainCategories.map(category => ({
      id: category.id,
      label: category.label,
      items: items.filter(item => item.parentId === category.id),
    }));
  };

  const categories = menuQuery.data ? organizeMenuByColumns(menuQuery.data) : [];

  if (categories.length === 0) return null;

  return (
    <div className="relative group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
      >
        Menu
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-0 w-screen max-w-6xl bg-white border border-gray-200 shadow-lg rounded-b-lg z-50">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 p-8">
            {categories.map(category => (
              <div key={category.id} className="space-y-3">
                <h3 className="font-bold text-gray-900 text-sm border-b-2 border-blue-600 pb-2">
                  {category.label}
                </h3>
                <ul className="space-y-2">
                  {category.items.map(item => (
                    <li key={item.id}>
                      {item.linkType === "internal" && item.internalPageId ? (
                        <Link
                          href={`/page/${item.internalPageId}`}
                          className="text-gray-600 hover:text-blue-600 text-sm transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ) : item.linkType === "external" && item.externalUrl ? (
                        <a
                          href={item.externalUrl}
                          target={item.openInNewTab ? "_blank" : "_self"}
                          rel={item.openInNewTab ? "noopener noreferrer" : ""}
                          className="text-gray-600 hover:text-blue-600 text-sm transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          {item.label}
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
