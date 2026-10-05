import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { blogPosts } from '../content/blog';
import BreadcrumbList from '../components/BreadcrumbList';

export default function BlogPost() {
  const [, navigate] = useLocation();
  const params = useParams();
  const slug = params?.slug;

  const post = blogPosts.find((p) => p.slug === slug);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!post) {
      navigate('/blog');
      return;
    }
    window.scrollTo(0, 0);
    setLoaded(true);
  }, [post, navigate]);

  if (!post || !loaded) return null;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Organization',
      name: 'Rokar POS',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Rokar POS',
      logo: {
        '@type': 'ImageObject',
        url: 'https://rokarpos.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': typeof window !== 'undefined' ? window.location.href : '',
    },
    image: 'https://rokarpos.com/og-cover.png',
    keywords: post.tags.join(', '),
    articleSection: post.category,
  };

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rokarpos.com/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://rokarpos.com/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://rokarpos.com/blog/${post.slug}` },
    ],
  };

  return (
    <article className="blog-post-page" aria-labelledby="post-title">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <BreadcrumbList items={[
        { label: 'Home', href: '/' },
        { label: 'Blog', href: '/blog' },
        { label: post.title, href: `/blog/${post.slug}` },
      ]} />

      <div className="container">
        <header className="blog-post-header">
          <span className="blog-category">{post.category}</span>
          <h1 id="post-title">{post.title}</h1>
          <div className="blog-post-meta">
            <time dateTime={post.publishedAt}>
              Published {new Date(post.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </time>
            {post.updatedAt !== post.publishedAt && (
              <>
                <span aria-hidden="true">??</span>
                <time dateTime={post.updatedAt}>
                  Updated {new Date(post.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </time>
              </>
            )}
            <span aria-hidden="true">??</span>
            <span>{post.readTime} read</span>
            <span aria-hidden="true">??</span>
            <span className="blog-author">By {post.author}</span>
          </div>
        </header>

        <div
          className="blog-post-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <footer className="blog-post-footer">
          <hr />
          <div className="blog-tags">
            {post.tags.map((tag) => (
              <span key={tag} className="blog-tag">#{tag}</span>
            ))}
          </div>
          <nav aria-label="Blog navigation">
            <Link href="/blog" className="btn btn-ghost">
              ??? Back to All Articles
            </Link>
          </nav>
        </footer>
      </div>
    </article>
  );
}
