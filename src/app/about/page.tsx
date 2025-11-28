'use client';
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation';

export default function AboutPage() {
  const navRef = useRef<HTMLElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const pathname = usePathname();
	const [isMobile, setIsMobile] = useState<boolean>(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    setLoading(false);
  }, [pathname]);

	useEffect(() => {
			if (!mobileMenuOpen) return;
			function onOutside(e: MouseEvent | TouchEvent) {
				const target = e.target as Node | null;
				if (navRef.current && target && !navRef.current.contains(target)) {
					setMobileMenuOpen(false);
				}
			}
			function onKey(e: KeyboardEvent) {
				if (e.key === 'Escape') setMobileMenuOpen(false);
			}
			document.addEventListener('mousedown', onOutside);
			document.addEventListener('touchstart', onOutside);
			document.addEventListener('keydown', onKey);
			return () => {
				document.removeEventListener('mousedown', onOutside);
				document.removeEventListener('touchstart', onOutside);
				document.removeEventListener('keydown', onKey);
			};
		}, [mobileMenuOpen]);
	

  return (
    <main className="pageRoot" style={{ minHeight: '100vh', backgroundColor: '#c8a2c8', margin: 0, position: 'relative' }}>
			<Link href="/" onClick={() => setLoading(true)}>
				<h1 style={{
					fontFamily: "'MeowScript', sans-serif",
					position: 'absolute',
					top: 15,
					left: 18,
					margin: 0,
					fontSize: '4rem',
					color: '#ffffff',
					cursor: '/cursor.png, auto'
				}}>
					Lilacsolace .
				</h1>
			</Link>
 
			<nav ref={navRef} className="topNav" aria-label="Main Navigation">
				<ul className="desktopNav">
					<li><Link href="/about" className="navItem" onClick={() => setLoading(true)}>about</Link></li>
					<li><Link href="/privacy" className="navItem" onClick={() => setLoading(true)}>privacy</Link></li>
					<li><Link href="/ideas" className="navItem" onClick={() => setLoading(true)}>layouts</Link></li>
				</ul>

				<button
									className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}
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
										<Link href="/about" className="mobileItem" onClick={() => { setMobileMenuOpen(false); setLoading(true); }}>about</Link>
										<Link href="/privacy" className="mobileItem" onClick={() => { setMobileMenuOpen(false); setLoading(true); }}>privacy</Link>
										<Link href="/ideas" className="mobileItem" onClick={() => { setMobileMenuOpen(false); setLoading(true); }}>layouts</Link>
									</div>
								)}
			</nav>

			

      {/* loader overlay */}
      {loading && (
        <div className="pageLoader" role="status" aria-live="polite">
          <div className="loaderPill" aria-hidden="true">
            <span className="dot d1" />
            <span className="dot d2" />
            <span className="dot d3" />
          </div>
        </div>
      )}
 
      {/* footer */}
	  <footer className="siteFooter" role="contentinfo">
		<div className="footerPill">
		  <p>made w ❤️ by <a href="https://arddev.vercel.app" target="_blank" rel="noopener noreferrer" className="text-bold">ard.dev</a></p>
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
					/* use the .cur cursor placed in public/; browsers will fall back if unsupported */
					cursor: url('/cursor.cur'), auto;
				}
				/* ensure interactive elements use pointer fallback with the custom cursor */
				.pageRoot a,
				.pageRoot button,
				.pageRoot :global(.navItem),
				.pageRoot .enterBooth,
				.pageRoot .enterBoothMobile,
				.pageRoot .hamburger {
					cursor: url('/cursor.cur'), pointer;
				}

				@keyframes gradientMove {
					0% { background-position: 0% 50%; }
					50% { background-position: 100% 50%; }
					100% { background-position: 0% 50%; }
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

			 .hamburger {
					display: none;
					width: 42px;
					height: 36px;
					padding: 6px;
					border: none;
					background: rgba(255,255,255,0.04);
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
				.hamburger.open .l1 { transform: translateY(6px) rotate(45deg); }
				.hamburger.open .l2 { opacity: 0; }
				.hamburger.open .l3 { transform: translateY(-6px) rotate(-45deg); }

				.mobileMenu {
					position: absolute;
					right: 12px;
					top: 76px;
					background: rgba(255,255,255,0.03);
					border-radius: 12px;
					padding: 10px;
					display: flex;
					flex-direction: column;
					gap: 8px;
					box-shadow: 0 8px 24px rgba(0,0,0,0.35);
					z-index: 95;
				}
				:global(.mobileItem) {
					background: transparent;
					color: #fff;
					padding: 8px 12px;
					border-radius: 8px;
					text-align: left;
					font-family: 'SpaceMono-Bold', 'Space Mono', monospace;
					font-weight: 700;
					cursor: pointer;
				}
				:global(.mobileItem):hover { background: rgba(255,255,255,0.04); }

        
        .pageLoader {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.28);
          backdrop-filter: blur(4px);
          z-index: 9999;
        }
        .loaderPill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 18px;
          border-radius: 999px;
          background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 8px 30px rgba(0,0,0,0.35);
        }
        .dot {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ffffff;
          opacity: 0.95;
          transform: translateY(0);
          animation: bounce 500ms infinite ease-in-out;
        }
        .dot.d2 { animation-delay: 220ms; }
        .dot.d3 { animation-delay: 340ms; }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.85; }
          40% { transform: translateY(-8px); opacity: 1; }
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