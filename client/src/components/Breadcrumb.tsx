import { Link } from 'wouter';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav
      className={`py-3 px-4 bg-white border-b border-gray-200 ${className}`}
      aria-label="Breadcrumb"
    >
      <div className="container mx-auto">
        <ol className="flex items-center gap-2 text-sm flex-wrap">
          {/* Home link */}
          <li>
            <Link
              href="/"
              className="flex items-center gap-1 hover:underline transition-colors"
              style={{ color: 'var(--degase-blue-dark)' }}
            >
              <Home size={16} />
              <span className="hidden sm:inline">Início</span>
            </Link>
          </li>

          {/* Breadcrumb items */}
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <ChevronRight size={16} className="text-gray-400" />
              {item.href && !item.current ? (
                <Link
                  href={item.href}
                  className="hover:underline transition-colors"
                  style={{ color: 'var(--degase-blue-dark)' }}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="text-gray-600"
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
