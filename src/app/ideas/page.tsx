'use client';
import Image from "next/image";
import React, { useRef } from "react";
import Link from "next/link";

export default function AboutPage() {

  const navRef = useRef<HTMLElement | null>(null);
  return (
    <main  className="pageRoot" style={{ minHeight: '100vh', margin: 0, position: 'relative',  }}>
      <Link href="/">
				<h1 style={{
					fontFamily: "'MeowScript', sans-serif",
					position: 'absolute',
					top: 15,
					left: 18,
					margin: 0,
					fontSize: '4rem',
					color: '#ffffff',
					cursor: 'pointer'
				}}>
					Lilacsolace .
				</h1>
			</Link>

      <nav ref={navRef} className="topNav" aria-label="Main Navigation">
        <ul className="desktopNav">
          <li><Link href="/about" className="navItem"  type="button">about</Link></li>
          <li><Link href="/privacy" className="navItem" type="button">privacy</Link></li>
          <li><Link href="/ideas" className="navItem" type="button">layouts</Link></li>
        </ul>
      </nav>

      {/* centered page heading */}
      <h2 className="centerHeading">Choose Layout</h2>
      <p className="subHeading">we have a pretty collection of layouts to choose from🐧</p>

      {/* footer */}
      <footer className="siteFooter" role="contentinfo">
		<div className="footerPill">
		  <p>made w ❤️ by <a href="https://ard.dev" target="_blank" rel="noopener noreferrer" className="text-bold">ard.dev</a></p>
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
					0% { background-position: 0% 50%; }
					50% { background-position: 100% 50%; }
					100% { background-position: 0% 50%; }
				}
      /* centered heading */
      .centerHeading {
        position: absolute;
        left: 50%;
        top: 20%;
        transform: translate(-50%, -50%);
        margin: 0;
        color: black;
        font-family: 'SpaceMono-Bold', 'Space Mono', monospace;
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
        
        color: rgba(0,0,0,0.85);
        font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
        font-size: 0.7rem;
        font-weight: 600;
        text-align: center;
        z-index: 50;
        pointer-events: none;
      }
      @media (max-width: 640px) {
        .centerHeading { font-size: 1.6rem; padding: 0 12px; }
        .subHeading { top: calc(20% + 2.4rem); font-size: 0.95rem; padding: 0 12px; }
      }
 
      .topNav {
          position: absolute;
          top: 16px;
          right: 18px;
          z-index: 60;
          font-family: 'Inter', sans-serif;
        }
        .topNav ul { margin: 0; padding: 0; }
        .topNav .desktopNav {
          display: flex;
          gap: 40px;
          margin-right: 40;
          align-items: center;
          margin-top: 20;
        }
        .topNav li { list-style: none; }
        :global(.navItem) {
          background: transparent;
          color: #ffffff;
          padding: 6px 10px;
          border-radius: 999px;
          font-family: 'SpaceMono-Bold', 'Space Mono', monospace;
          font-weight: 600;
          cursor: pointer;
          backdrop-filter: blur(4px);
          transition: transform 120ms ease, background 120ms ease, color 120ms ease;
        }
        :global(.navItem):hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.06);
        }
        .siteFooter { position: fixed; left: 50%; bottom: 18px; transform: translateX(-50%); z-index:115; pointer-events: none; }
       .footerPill {
        pointer-events: auto;
        display:inline-flex;
        align-items:center;
        gap:10px;
        padding:8px 14px;
        color: #000; /* black text in footer */
      }
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
       @media (max-width:640px) { .siteFooter { bottom:84px; } }
           `}</style>
   
    </main>
  );
}