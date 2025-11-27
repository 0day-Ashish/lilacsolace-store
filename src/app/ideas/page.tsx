'use client';
import Image from "next/image";
import React, { useRef } from "react";

export default function AboutPage() {

  const navRef = useRef<HTMLElement | null>(null);
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#c8a2c8', margin: 0, position: 'relative' }}>
      <h1 style={{
        fontFamily: "'MeowScript', sans-serif",
        position: 'absolute',
        top: 15,
        left: 18,
        margin: 0,
        fontSize: '4rem',
        color: '#ffffff'
      }}>
        Lilacsolace .
      </h1>

      <nav ref={navRef} className="topNav" aria-label="Main Navigation">
        <ul className="desktopNav">
          <li><button className="navItem"  type="button">about</button></li>
          <li><button className="navItem" type="button">booth</button></li>
          <li><button className="navItem" type="button">ideas</button></li>
        </ul>
      </nav>
      <style jsx>{`

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