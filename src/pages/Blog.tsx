import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { blogPosts, blogCategories } from '../content/blog';
import BreadcrumbList from '../components/BreadcrumbList';

export default function Blog() {
  const [location] = useLocation();
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All'
    ? blogPosts
    : blogPosts.filter((p) => p.category === filter);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rokarpos.com/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://rokarpos.com/blog' },
    ],
  };

  return (
    <section className="blog-page" aria-labelledby="blog-heading">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <BreadcrumbList items={[{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }]} />

      <div className="container">
        <header className="blog-header">
          <h1 id="blog-heading">Rokar POS Blog</h1>
          <p className="muted">
            Practical guides for Pakistani shopkeepers on POS, inventory, udhaar, hardware, and business growth.
          </p>
        </header>

        <div className="blog-filter" role="group" aria-label="Filter articles by category">
          {blogCategories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
              aria-pressed={filter === cat}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="blog-grid" role="list">
          {filtered.map((post) => (
            <article key={post.slug} className="blog-card" role="listitem">
              <div className="blog-meta">
                <span className="blog-category">{post.category}</span>
                <time dateTime={post.publishedAt} className="blog-date">
                  {new Date(post.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </time>
              </div>
              <h2>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="blog-excerpt">{post.excerpt}</p>
              <div className="blog-footer">
                <span className="blog-read-time">{post.readTime} read</span>
                <Link href={`/blog/${post.slug}`} className="btn btn-ghost btn-sm">
                  Read Article
                </Link>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="muted text-center" style={{ marginTop: 40 }}>
            No articles in this category yet.
          </p>
        )}
      </div>
    </section>
  );
}
