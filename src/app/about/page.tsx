'use client';
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation';

export default function AboutPage() {
  const navRef = useRef<HTMLElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(false);
  }, [pathname]);

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#c8a2c8', margin: 0, position: 'relative' }}>
			<Link href="/" onClick={() => setLoading(true)}>
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
					<li><Link href="/about" className="navItem" onClick={() => setLoading(true)}>about</Link></li>
					<li><Link href="/booth" className="navItem" onClick={() => setLoading(true)}>booth</Link></li>
					<li><Link href="/ideas" className="navItem" onClick={() => setLoading(true)}>ideas</Link></li>
				</ul>
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
 				.navItem {
 					background: transparent;
 					color: #ffffff;
 					padding: 6px 10px;
 					border-radius: 999px;
 					font-weight: 600;
 					cursor: pointer;
 					backdrop-filter: blur(4px);
 					transition: transform 120ms ease, background 120ms ease, color 120ms ease;
 				}
 				.navItem:hover {
 					transform: translateY(-2px);
 					background: rgba(255,255,255,0.06);
 				}
+        
+        .pageLoader {
+          position: fixed;
+          inset: 0;
+          display: flex;
+          align-items: center;
+          justify-content: center;
+          background: rgba(0,0,0,0.28);
+          backdrop-filter: blur(4px);
+          z-index: 9999;
+        }
+        .loaderPill {
+          display: inline-flex;
+          align-items: center;
+          gap: 10px;
+          padding: 10px 18px;
+          border-radius: 999px;
+          background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
+          border: 1px solid rgba(255,255,255,0.1);
+          box-shadow: 0 8px 30px rgba(0,0,0,0.35);
+        }
+        .dot {
+          display: inline-block;
+          width: 10px;
+          height: 10px;
+          border-radius: 50%;
+          background: #ffffff;
+          opacity: 0.95;
+          transform: translateY(0);
+          animation: bounce 500ms infinite ease-in-out;
+        }
+        .dot.d2 { animation-delay: 220ms; }
+        .dot.d3 { animation-delay: 340ms; }
+        @keyframes bounce {
+          0%, 80%, 100% { transform: translateY(0); opacity: 0.85; }
+          40% { transform: translateY(-8px); opacity: 1; }
+        }
           `}</style>
    
    </main>
  );
}