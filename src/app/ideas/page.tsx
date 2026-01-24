"use client";
import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";

export default function AboutPage() {
  const navRef = useRef<HTMLElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 640);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    function onOutside(e: MouseEvent | TouchEvent) {
      const target = e.target as Node | null;
      if (navRef.current && target && !navRef.current.contains(target)) {
        setMobileMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileMenuOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("touchstart", onOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileMenuOpen]);

  const images = [
    { id: "canvas", src: "/canvas1.jpg", title: "layout A", subtitle: "Size 6 x 2 Strip (1 Pose)" },
    { id: "canvas1", src: "/canvas2.jpg", title: "layout B", subtitle: "Size 6 x 2 Strip (3 Pose)" },
    { id: "canvas2", src: "/canvas.jpg", title: "layout C", subtitle: "Size 6 x 2 Strip (4 Pose)" },
    { id: "canvas3", src: "/canvas3.jpg", title: "layout D", subtitle: "Size 6 x 2 Strip (2 Pose)" },
    { id: "canvas4", src: "/canvas4.jpg", title: "layout E", subtitle: "Size 6 x 4 Strip (6 Pose)" },
  ];

  const scrollBy = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.querySelector(".card")?.clientWidth || 280;
    const gap = 24; // same as CSS gap
    const amount = (cardWidth + gap) * 1.8; // scroll ~2 cards
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <main
      className="pageRoot"
      style={{ minHeight: "100vh", margin: 0, position: "relative" }}
    >
      <Link href="/">
        <h1
          style={{
            fontFamily: "'MeowScript', sans-serif",
            position: "absolute",
            top: 15,
            left: 18,
            margin: 0,
            fontSize: isMobile ? "2.5rem" : "4rem",
            color: "#000000",
            cursor: "pointer",
            zIndex: 120,
          }}
        >
          Lilacsolace .
        </h1>
      </Link>

      <nav ref={navRef} className="topNav" aria-label="Main Navigation">
        <ul className="desktopNav">
          <li>
            <Link href="/about" className="navItem" type="button">
              about
            </Link>
          </li>
          <li>
            <Link href="/privacy" className="navItem" type="button">
              privacy
            </Link>
          </li>
          <li>
            <Link href="/ideas" className="navItem" type="button">
              layouts
            </Link>
          </li>
        </ul>

        <button
          className={`hamburger ${mobileMenuOpen ? "open" : ""}`}
          aria-label="Menu"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((s) => !s)}
        >
          <svg className="hamburgerIcon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <rect className="line l1" x="3" y="5" width="18" height="2" rx="1" />
            <rect className="line l2" x="3" y="11" width="18" height="2" rx="1" />
            <rect className="line l3" x="3" y="17" width="18" height="2" rx="1" />
          </svg>
        </button>

        {mobileMenuOpen && (
          <div className="mobileMenu" role="menu" aria-label="Mobile Navigation">
            <Link
              href="/about"
              className="mobileItem"
              onClick={() => {
                setMobileMenuOpen(false);
              }}
            >
              about
            </Link>
            <Link
              href="/privacy"
              className="mobileItem"
              onClick={() => {
                setMobileMenuOpen(false);
              }}
            >
              privacy
            </Link>
            <Link
              href="/ideas"
              className="mobileItem"
              onClick={() => {
                setMobileMenuOpen(false);
              }}
            >
              layouts
            </Link>
          </div>
        )}
      </nav>

      {/* centered page heading */}
      <h2 className="centerHeading">Choose Layout</h2>
      <p className="subHeading">
        we have a pretty collection of layouts to choose from🐧
      </p>

      {/* ---------------- Gallery / Carousel ---------------- */}
      <section
        aria-label="Layouts gallery"
        className="gallerySection"
      >
        <div className="galleryWrap">
          <button
            aria-label="Previous"
            className="arrow left"
            onClick={() => scrollBy("left")}
          >
            ‹
          </button>

          <div className="scroller" ref={scrollerRef} role="list">
  {images.map((img) => (
    <Link href={`/${img.id}`} key={img.id} className="cardLink">
      <div className="card" role="listitem">
        <div className="polaroid">
          <img src={img.src} alt={img.title} />
        </div>
        <div className="caption">
          <div className="title">{img.title}</div>
          <div className="subtitle">{img.subtitle}</div>
        </div>
      </div>
    </Link>
  ))}
</div>


          <button
            aria-label="Next"
            className="arrow right"
            onClick={() => scrollBy("right")}
          >
            ›
          </button>
        </div>
      </section>

      {/* footer */}
      <footer className="siteFooter" role="contentinfo">
        <div className="footerPill">
          <p>
            made w ❤️ by{" "}
            <a
              href="https://ard.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-bold"
            >
              ard.dev
            </a>
          </p>
          <span className="footerSep">•</span>
          <span className="footerCopy">© {new Date().getFullYear()} Lilacsolace</span>
        </div>
      </footer>

      <style jsx>{`
        .pageRoot {
          min-height: 100vh;
          background: linear-gradient(120deg, #c8a2c8 0%, #eec8f0 40%, #b5a0ff 100%);
          background-size: 300% 300%;
          animation: gradientMove 10s ease infinite;
        }
        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .centerHeading {
          position: absolute;
          left: 50%;
          top: 20%;
          transform: translate(-50%, -50%);
          margin: 0;
          color: black;
          font-family: "SpaceMono-Bold", "Space Mono", monospace;
          font-size: 2.2rem;
          letter-spacing: 0.6px;
          text-align: center;
          z-index: 50;
          pointer-events: none;
        }
        .subHeading {
          position: absolute;
          left: 50%;
          top: calc(18% + 2.8rem);
          transform: translateX(-50%);
          color: rgba(0, 0, 0, 0.85);
          font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          text-align: center;
          z-index: 50;
          pointer-events: none;
        }
        @media (max-width: 640px) {
          .centerHeading {
            font-size: 1.6rem;
            padding: 0 12px;
            top: 15%;
          }
          .subHeading {
            top: calc(15% + 2.4rem);
            font-size: 0.85rem;
            padding: 0 12px;
          }
          .topNav {
            display: none; /* Hide entire navigation on mobile */
          }
        }

        .topNav {
          position: absolute;
          top: 16px;
          right: 18px;
          z-index: 60;
          font-family: "Inter", sans-serif;
        }
        .topNav ul {
          margin: 0;
          padding: 0;
        }
        .topNav .desktopNav {
          display: flex;
          gap: 40px;
          margin-right: 40;
          align-items: center;
          margin-top: 20;
        }
        .topNav li {
          list-style: none;
        }
        :global(.navItem) {
          background: transparent;
          color: #ffffff;
          padding: 6px 10px;
          border-radius: 999px;
          font-family: "SpaceMono-Bold", "Space Mono", monospace;
          font-weight: 600;
          cursor: pointer;
          backdrop-filter: blur(4px);
          transition: transform 120ms ease, background 120ms ease, color 120ms ease;
        }
        :global(.navItem):hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.06);
        }

        .hamburger {
          display: none;
          width: 42px;
          height: 36px;
          padding: 6px;
          border: none;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 8px;
          backdrop-filter: blur(4px);
          cursor: pointer;
          align-items: center;
          justify-content: center;
          z-index: 100;
          margin-top: 26px;
        }
        .hamburgerIcon {
          width: 22px;
          height: 22px;
          display: block;
        }
        .hamburgerIcon .line {
          fill: #fff;
          transition: transform 160ms ease, opacity 160ms ease;
          transform-origin: center;
        }
        .hamburger.open .l1 {
          transform: translateY(6px) rotate(45deg);
        }
        .hamburger.open .l2 {
          opacity: 0;
        }
        .hamburger.open .l3 {
          transform: translateY(-6px) rotate(-45deg);
        }

        .mobileMenu {
          position: absolute;
          right: 12px;
          top: 76px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
          z-index: 95;
        }
        :global(.mobileItem) {
          background: transparent;
          color: #fff;
          padding: 8px 12px;
          border-radius: 8px;
          text-align: left;
          font-family: "SpaceMono-Bold", "Space Mono", monospace;
          font-weight: 700;
          cursor: pointer;
        }
        :global(.mobileItem):hover {
          background: rgba(255, 255, 255, 0.04);
        }

        /* Gallery styles */
        .gallerySection {
          padding-top: 30vh;
          padding-bottom: 80px;
        }
        @media (max-width: 768px) {
          .gallerySection {
            padding-top: 25vh;
            padding-bottom: 60px;
          }
        }
        @media (max-width: 640px) {
          .gallerySection {
            padding-top: 34vh;
            padding-bottom: 40px;
          }
        }

        .galleryWrap {
          display: flex;
          align-items: center;
          gap: 18px;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 60;
        }
        @media (max-width: 768px) {
          .galleryWrap {
            gap: 12px;
          }
        }

        .arrow {
          width: 64px;
          height: 64px;
          border-radius: 999px;
          border: 3px solid rgba(0, 0, 0, 0.12);
          background: rgba(255, 255, 255, 0.9);
          display: grid;
          place-items: center;
          font-size: 32px;
          color: rgba(0, 0, 0, 0.65);
          cursor: pointer;
          transition: transform 160ms ease, box-shadow 160ms ease;
          flex: 0 0 64px;
          z-index: 10;
        }
        .arrow:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
        }
        .arrow:active {
          transform: translateY(-2px);
        }
        .arrow.left {
          margin-left: 24px;
        }
        .arrow.right {
          margin-right: 24px;
        }
        @media (max-width: 768px) {
          .arrow {
            width: 48px;
            height: 48px;
            font-size: 24px;
            flex: 0 0 48px;
          }
          .arrow.left {
            margin-left: 12px;
          }
          .arrow.right {
            margin-right: 12px;
          }
        }
        @media (max-width: 640px) {
          .arrow {
            width: 44px;
            height: 44px;
            font-size: 20px;
            flex: 0 0 44px;
            border: 2px solid rgba(0, 0, 0, 0.12);
          }
          .arrow.left {
            margin-left: 8px;
          }
          .arrow.right {
            margin-right: 8px;
          }
        }

        .scroller {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          scroll-behavior: smooth;
          padding: 6px 12px;
          -webkit-overflow-scrolling: touch;
          width: calc(100% - 160px); /* leave space for arrows */
          scrollbar-width: thin;
          scrollbar-color: rgba(0,0,0,0.08) transparent;
        }
        .scroller::-webkit-scrollbar {
          height: 10px;
        }
        .scroller::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.08);
          border-radius: 999px;
        }
        @media (max-width: 768px) {
          .scroller {
            gap: 16px;
            width: calc(100% - 120px); /* adjusted for smaller arrows */
          }
        }
        @media (max-width: 640px) {
          .scroller {
            gap: 12px;
            width: calc(100% - 112px); /* adjusted for mobile arrows */
            padding: 6px 4px;
          }
        }

        .card {
          width: 240px;
          flex: 0 0 240px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        

        .polaroid {
          width: 100%;
          background: white;
          border: 3px solid #111;
          padding: 12px 12px 20px 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
          border-radius: 6px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          /* animate lift on hover */
          transition: transform 220ms ease, box-shadow 220ms ease;
          will-change: transform, box-shadow;
        }
        .polaroid img {
          width: 100%;
          height: 320px;
          object-fit: cover;
          display: block;
          border-radius: 2px;
          transition: transform 300ms cubic-bezier(.2,.9,.3,1), filter 300ms ease;
          transform-origin: center center;
        }

        .cardLink {
          display: block;
          color: inherit;
          text-decoration: none;
          cursor: pointer;
          transition: transform 150ms ease;
        }

        .cardLink:hover .polaroid img,
        .cardLink:focus .polaroid img,
        .card:hover .polaroid img {
          transform: scale(1.06) rotate(-0.6deg);
          filter: brightness(1.04) saturate(1.06);
        }
        .cardLink:hover .polaroid,
        .cardLink:focus .polaroid,
        .card:hover .polaroid {
          transform: translateY(-6px);
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.16);
        }

        /* reduce intensity on small screens */
        @media (max-width: 640px) {
          .cardLink:hover .polaroid img,
          .cardLink:focus .polaroid img,
          .card:hover .polaroid img {
            transform: scale(1.03) rotate(0deg);
          }
          .cardLink:hover .polaroid,
          .cardLink:focus .polaroid,
          .card:hover .polaroid {
            transform: translateY(-3px);
            box-shadow: 0 12px 28px rgba(0,0,0,0.12);
          }
        }

        .caption {
          text-align: center;
          margin-top: 10px;
        }
        .title {
          font-weight: 700;
          font-family: "SpaceMono-Bold", monospace;
          color: rgba(0,0,0,0.9);
          text-transform: lowercase;
        }
        .subtitle {
          margin-top: 6px;
          font-size: 0.82rem;
          color: rgba(0,0,0,0.55);
        }

        @media (max-width: 920px) {
          .card { width: 200px; flex: 0 0 200px; }
          .polaroid img { height: 280px; }
        }
        @media (max-width: 768px) {
          .card { width: 180px; flex: 0 0 180px; }
          .polaroid img { height: 240px; }
        }
        @media (max-width: 640px) {
          .galleryWrap { padding: 0 8px; }
          .card { width: 160px; flex: 0 0 160px; }
          .polaroid img { height: 220px; }
          /* Arrows are now visible on mobile */
        }
        @media (max-width: 480px) {
          .card { width: 140px; flex: 0 0 140px; }
          .polaroid img { height: 200px; }
          .caption { margin-top: 8px; }
          .title { font-size: 0.9rem; }
          .subtitle { font-size: 0.75rem; }
        }
          .cardLink {
  text-decoration: none;
  color: inherit;
  transition: transform 150ms ease;
}

.cardLink:hover {
  transform: translateY(-6px);
}

        .siteFooter {
          position: fixed;
          left: 50%;
          bottom: 18px;
          transform: translateX(-50%);
          z-index:115;
          pointer-events: none;
          display: flex;
          justify-content: center;
          width: 100%;
        }
       .footerPill {
        pointer-events: auto;
        display:inline-flex;
        flex-direction: row;
        justify-content: center;
        align-items:center;
        gap:10px;
        padding:8px 14px;
        color: #000; /* black text in footer */
      }
      .footerPill p { margin: 0; }
      .footerNav a {
        color: #000; /* black links */
        text-decoration: none;
        font-family: 'SpaceMono-Bold','Space Mono', monospace;
        font-weight: 700;
        padding: 6px 8px;
      }
      .footerNav a:hover { transform: translateY(-2px); background: rgba(0,0,0,0.03); }
      .footerSep { color: rgba(0,0,0,0.6); margin:0 6px; }
      .footerCopy { color: #000; font-weight:600; opacity: 0.95; }
      @media (max-width: 640px) {
        .siteFooter { bottom: 24px; }
        .footerPill {
          flex-direction: column;
          gap: 6px;
          padding: 6px 12px;
          font-size: 0.85rem;
        }
        .footerSep { display: none; }
      }
      `}</style>
    </main>
  );
}
