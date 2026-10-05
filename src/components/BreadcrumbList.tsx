import { Link } from 'wouter';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbListProps {
  items: BreadcrumbItem[];
}

/**
 * BreadcrumbList ??? renders visible breadcrumbs AND injects BreadcrumbList JSON-LD.
 *
 * The JSON-LD is inserted via a <script type="application/ld+json"> in the page
 * that uses this component (Blog.tsx, BlogPost.tsx, etc.). This component
 * only renders the visible breadcrumbs; the page is responsible for the schema.
 */
export default function BreadcrumbList({ items }: BreadcrumbListProps) {
  if (items.length <= 1) return null;

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: 24 }}>
      <ol style={{ display: 'flex', flexWrap: 'wrap', gap: 8, listStyle: 'none', padding: 0, margin: 0, fontSize: '0.875rem', color: 'var(--muted)' }}>
        {items.map((item, idx) => (
          <li key={item.href} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {idx > 0 && <span aria-hidden="true" style={{ color: 'var(--border)' }}>???</span>}
            {idx === items.length - 1 ? (
              <span aria-current="page" style={{ color: 'var(--fg)', fontWeight: 500 }}>
                {item.label}
              </span>
            ) : (
              <Link href={item.href} style={{ color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--fg)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted)'; }}
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
