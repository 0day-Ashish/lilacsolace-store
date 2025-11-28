'use client';
import Image from "next/image";
import React, { useRef } from "react";
import Link from "next/link";

export default function AboutPage() {

  const navRef = useRef<HTMLElement | null>(null);
  return (
    <main style={{ minHeight: '100vh', margin: 0, position: 'relative' }}>
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
          <li><button className="navItem"  type="button">about</button></li>
          <li><button className="navItem" type="button">booth</button></li>
          <li><button className="navItem" type="button">ideas</button></li>
        </ul>
      </nav>
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
          `}</style>
   
    </main>
  );
} 