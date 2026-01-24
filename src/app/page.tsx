'use client';
import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Shuffle from '@/components/Shuffle';
import { Instagram, Github, Globe } from 'lucide-react';

export default function Page() {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const [isMobile, setIsMobile] = useState<boolean>(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const navRef = useRef<HTMLElement | null>(null);
	const pathname = usePathname();

	useEffect(() => {
		function handleResize() {
			setIsMobile(window.innerWidth <= 640);
		}
		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
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

	useEffect(() => {
		async function startCamera() {
			try {
				streamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
				if (videoRef.current) videoRef.current.srcObject = streamRef.current;
			} catch (err) {
				console.error('Unable to access camera', err);
			}
		}

		if (!isMobile) {
			startCamera();
		} else {
			if (streamRef.current) {
				streamRef.current.getTracks().forEach((t) => t.stop());
				streamRef.current = null;
				if (videoRef.current) videoRef.current.srcObject = null;
			}
		}

		return () => {
			if (streamRef.current) {
				streamRef.current.getTracks().forEach((t) => t.stop());
				streamRef.current = null;
			}
		};
	}, [isMobile]);

	useEffect(() => {
		setLoading(false);
	}, [pathname]);

	return (
		<>
			<div className="fixedBackground" />
			<div className="heroSection">
				<main className="pageRoot" style={{ minHeight: '100vh', margin: 0, position: 'relative' }}>
			<Link href="/" onClick={() => setLoading(true)}>
				<h1 style={{
					fontFamily: "'MeowScript', sans-serif",
					position: 'absolute',
					top: 15,
					left: 18,
					margin: 0,
					fontSize: '4rem',
					color: '#000000',
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
			
			<Image
				src="/sidepanel.png"
				alt="Side Panel"
				width={120}
				height={70}
				className='pointer-events-none'
				style={{ position: 'absolute', top: 210 }}
			/>
			<Image
				src="/storyideas.png"
				alt="Story Ideas"
				width={200}
				height={120}
				className='pointer-events-none'
				style={{ position: 'absolute', top: 320, left: 18 }}
			/>

			<div className="cameraContainer" aria-hidden={isMobile}>
				<Shuffle
					text="Photo Booth✨"
					shuffleDirection="right"
					duration={0.35}
					animationMode="evenodd"
					shuffleTimes={2}
					ease="power3.out"
					stagger={0.03}
					threshold={0.1}
					triggerOnce={true}
					triggerOnHover={true}
					respectReducedMotion={true}
					style={{ fontFamily: "SpaceMono-Bold, 'Space Mono', monospace" }}
					className='text-3xl'
				/>
				<video
					ref={videoRef}
					className="cameraPreview"
					autoPlay
					playsInline
					muted
				/>
				<Link href="/ideas" onClick={() => setLoading(true)}>
				<button className="enterBooth" type="button" aria-label="Enter the Booth">
					<svg className="enterDesktopIcon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
						<path d="M12 7a5 5 0 100 10 5 5 0 000-10zm8-1h-2.2l-1.4-1.8A1 1 0 0015.7 4H8.3a1 1 0 00-.7.2L6.2 6H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V7a1 1 0 00-1-1zM12 9.5A2.5 2.5 0 1112 14.5 2.5 2.5 0 0112 9.5z" className='bg-black'/>
					</svg>
					<span className="enterDesktopLabel text-black">Enter the Booth</span>
				</button>
				</Link>
			</div>
			<Link href="/about">

			<button  className="enterBoothMobile" onClick={() => setLoading(true)} aria-label="Enter the Booth">
				<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="enterIcon">
					<path d="M12 7a5 5 0 100 10 5 5 0 000-10zm8-1h-2.2l-1.4-1.8A1 1 0 0015.7 4H8.3a1 1 0 00-.7.2L6.2 6H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V7a1 1 0 00-1-1zM12 9.5A2.5 2.5 0 1112 14.5 2.5 2.5 0 0112 9.5z" />
				</svg>
				<span className="enterLabel">Enter the Booth</span>
			</button>
</Link>
			<div className="mobileRightText" role="note">
				The only Virtual Booth that feels like a real one. Step inside to create unforgettable memories!
			</div>
			
			
			
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
		<div className="footerPill text-black">
		  <p>made w ❤️ by <a href="https://arddev.vercel.app" target="_blank" rel="noopener noreferrer" className="text-bold">ard.dev</a></p>
		  <span className="footerSep">•</span>
		  <span className="footerCopy">© {new Date().getFullYear()} Lilacsolace</span>
		</div>
	  </footer>

			</main>
			</div>

			{/* Scrollable Meet the Developer Section */}
			<section className="developerSection" aria-label="Meet the Developer">
				<div className="developerContent">
					<h2 className="developerHeading">Meet the Developer</h2>
					<div className="profileCard">
						<div className="profileImageWrapper">
							<Image
								src="/avtar1.jpg"
								alt="Developer Profile"
								width={120}
								height={120}
								className="profileImage"
							/>
						</div>
						<div className="developerInfo">
							<p className="developerName">ard.dev</p>
							<p className="developerText">
								made with ❤️ by{" "}
								<a
									href="https://arddev.vercel.app"
									target="_blank"
									rel="noopener noreferrer"
									className="developerLink"
								>
									ard.dev
								</a>
							</p>
						</div>
						<div className="socialLinks">
							<a
								href="https://instagram.com/ashishh_rd_"
								target="_blank"
								rel="noopener noreferrer"
								className="socialLink"
								aria-label="Instagram"
							>
								<Instagram size={20} />
							</a>
							<a
								href="https://github.com/0day-Ashish"
								target="_blank"
								rel="noopener noreferrer"
								className="socialLink"
								aria-label="GitHub"
							>
								<Github size={20} />
							</a>
							<a
								href="https://arddev.vercel.app"
								target="_blank"
								rel="noopener noreferrer"
								className="socialLink"
								aria-label="Personal Website"
							>
								<Globe size={20} />
							</a>
						</div>
						<p className="developerCopyright">
							© {new Date().getFullYear()} Lilacsolace
						</p>
					</div>
				</div>
			</section>

			<style jsx>{`
				.fixedBackground {
					position: fixed;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					background: linear-gradient(120deg, #c8a2c8 0%, #eec8f0 40%, #b5a0ff 100%);
					background-size: 300% 300%;
					animation: gradientMove 10s ease infinite;
					z-index: -1;
				}
				.heroSection {
					position: relative;
					min-height: 100vh;
					display: flex;
					flex-direction: column;
					justify-content: space-between;
					z-index: 1;
				}
				.pageRoot {
					min-height: calc(100vh - 80px);
					position: relative;
					flex: 1;
					display: flex;
					flex-direction: column;
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

				.cameraContainer {
					position: absolute;
					left: 50%;
					top: 50%;
					transform: translate(-50%, -50%);
					width: 40vw;
					max-width: 360px;
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 10px;
				}

				.cameraPreview {
					width: 100%;
					height: calc(40vw * 0.5625);
					max-height: 225px;
					border-radius: 10px;
					object-fit: cover;
					background: #000;
					box-shadow: 0 8px 24px rgba(0,0,0,0.25);
				}

				.enterBooth {
					display: inline-flex;
					align-items: center;
					gap: 10px;
					padding: 10px 18px;
					font-size: 1rem;
					font-weight: 700;
					color: #fff;
					background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
					border: 1px solid rgba(255,255,255,0.12);
					border-radius: 999px;
					box-shadow: 0 12px 30px rgba(0,0,0,0.28);
					backdrop-filter: blur(8px) saturate(120%);
					cursor: pointer;
					transition: transform 140ms ease, box-shadow 140ms ease, opacity 120ms ease;
					margin-top: 40px;
				}
				.enterDesktopIcon { width: 18px; height: 18px; fill: #fff; opacity: 0.95; flex: 0 0 auto; }
				.enterDesktopLabel { display: inline-block; line-height: 1; white-space: nowrap; }
				.enterBooth:hover {
					transform: translateY(-3px);
					box-shadow: 0 18px 40px rgba(0,0,0,0.36);
				}
				.enterBooth:active {
					transform: translateY(0);
					opacity: 0.96;
				}

				.enterBoothMobile { display: none; }

				@media (max-width: 640px) {
					.cameraContainer { display: none; }
					.enterBooth { display: none; }
					.enterBoothMobile {
						display: flex;
						position: fixed;
						left: 50%;
						bottom: 72px;
						transform: translateX(-50%);
						padding: 16px 18px;
						gap: 10px;
						align-items: center;
						font-size: 0.95rem;
						font-weight: 700;
						color: #fff;
						background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03));
						border: 1px solid rgba(255,255,255,0.12);
						border-radius: 999px;
						box-shadow: 0 12px 30px rgba(0,0,0,0.35);
						backdrop-filter: blur(10px) saturate(120%);
						cursor: pointer;
						z-index: 120;
						transition: transform 140ms ease, box-shadow 140ms ease, opacity 120ms ease;
					}
					.enterBoothMobile:hover {
						transform: translateX(-50%) translateY(-4px);
						box-shadow: 0 18px 40px rgba(0,0,0,0.38);
					}
					.enterBoothMobile:active {
						transform: translateX(-50%) translateY(-1px);
						opacity: 0.95;
					}
					.enterBoothMobile .enterIcon { width: 18px; height: 18px; fill: #fff; opacity: 0.95; }
					.enterBoothMobile .enterLabel { display: inline-block; line-height: 1; }
				}
 
				@media (min-width: 1024px) {
					.cameraContainer { width: 28vw; max-width: 520px; }
					.cameraPreview { height: calc(28vw * 0.5625); max-height: 300px; }
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
					font-weight: 700;
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

				.mobileRightText { display: none; }
				@media (max-width: 640px) {
					.mobileRightText {
						display: block;
						position: fixed;
						right: 12px;
						top: 50%;
						transform: translateY(-50%);
						max-width: 60vw;
						color: #fff;
						padding: 10px 12px;
						border-radius: 10px;
						font-weight: 600;
						font-size: 0.95rem;
						text-align: right;
						z-index: 125;
						line-height: 1.2;
					}
				}

				@media (max-width: 640px) {
					.topNav .desktopNav { display: none; }
					.hamburger { display: inline-flex; }
				}
				@media (max-width: 420px) {
				}

				.aboutBadge { display: none; pointer-events: none; }
				@media (min-width: 1024px) {
					.aboutBadge {
						display: block;
						position: fixed;
						right: 24px;
						bottom: 18px;
						width: 120px;
						height: auto;
						z-index: 110;
						filter: drop-shadow(0 10px 20px rgba(0,0,0,0.25));
					}
				}

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

				.siteFooter {
					position: relative;
					left: 0;
					bottom: 0;
					transform: none;
					z-index: 115;
					pointer-events: none; /* outer container not interactive, inner pill is */
					display: flex;
					justify-content: center;
					width: 100%;
					margin-top: auto;
					padding: 20px 0;
				}
				.footerPill {
					pointer-events: auto;
					display: inline-flex;
					flex-direction: row;
					justify-content: center; /* center content horizontally */
					align-items: center;
					gap: 10px;
					padding: 8px 14px;
					color: #000; /* keep footer text black */
					font-size: 0.95rem;
				}
				.footerPill p { margin: 0; } /* remove default paragraph margin */
				.footerNav a {
					color: #000; /* black footer links */
					text-decoration: none;
					font-family: 'SpaceMono-Bold', 'Space Mono', monospace;
					font-weight: 700;
					letter-spacing: 0.4px;
					padding: 6px 8px;
					transition: transform 120ms ease;
				}
				.footerNav a:hover { transform: translateY(-2px); background: rgba(0,0,0,0.03); }
				.footerSep { color: rgba(0,0,0,0.6); margin: 0 6px; }
				.footerCopy { color: #000; opacity: 0.9; font-weight: 600; }
				@media (max-width: 640px) {
					.siteFooter { margin-top: 20px; padding: 20px 0; } /* keep above mobile pill button */
					.footerPill { font-size: 0.92rem; padding: 10px 12px; gap: 8px; }
				}

				.developerSection {
					position: relative;
					width: 100%;
					min-height: 100vh;
					display: flex;
					justify-content: center;
					align-items: center;
					padding: 60px 20px;
					margin-top: -10vh;
					z-index: 1;
				}
				.developerContent {
					text-align: center;
					background: rgba(255, 255, 255, 0.1);
					backdrop-filter: blur(10px);
					border-radius: 20px;
					padding: 24px;
					border: 1px solid rgba(255, 255, 255, 0.2);
					box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
					max-width: 320px;
					width: 100%;
				}
				.developerHeading {
					font-family: 'SpaceMono-Bold', 'Space Mono', monospace;
					font-size: 1.1rem;
					font-weight: 700;
					color: #ffffff;
					margin: 0 0 16px 0;
					text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
				}
				.profileCard {
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 12px;
				}
				.profileImageWrapper {
					width: 120px;
					height: 120px;
					border-radius: 50%;
					overflow: hidden;
					border: 3px solid rgba(255, 255, 255, 0.3);
					box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
					background: rgba(255, 255, 255, 0.1);
					display: flex;
					align-items: center;
					justify-content: center;
				}
				.profileImage {
					width: 100%;
					height: 100%;
					object-fit: cover;
					border-radius: 50%;
				}
				.developerInfo {
					display: flex;
					flex-direction: column;
					gap: 4px;
					align-items: center;
				}
				.developerName {
					margin: 0;
					font-size: 1rem;
					font-weight: 700;
					color: #ffffff;
					font-family: 'SpaceMono-Bold', 'Space Mono', monospace;
					text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
				}
				.developerText {
					margin: 0;
					font-size: 0.85rem;
					color: rgba(255, 255, 255, 0.9);
					font-weight: 500;
				}
				.developerLink {
					color: #ffffff;
					text-decoration: none;
					font-weight: 700;
					font-family: 'SpaceMono-Bold', 'Space Mono', monospace;
					transition: opacity 0.2s ease;
					text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
				}
				.developerLink:hover {
					opacity: 0.8;
					text-decoration: underline;
				}
				.socialLinks {
					display: flex;
					gap: 12px;
					justify-content: center;
					align-items: center;
					margin-top: 8px;
				}
				.socialLink {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 40px;
					height: 40px;
					border-radius: 50%;
					background: rgba(255, 255, 255, 0.15);
					border: 1px solid rgba(255, 255, 255, 0.2);
					color: #ffffff;
					text-decoration: none;
					transition: all 0.2s ease;
					backdrop-filter: blur(5px);
				}
				.socialLink:hover {
					background: rgba(255, 255, 255, 0.25);
					transform: translateY(-2px);
					box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
				}
				.socialLink:active {
					transform: translateY(0);
				}
				.developerCopyright {
					margin: 12px 0 0 0;
					font-size: 0.8rem;
					color: rgba(255, 255, 255, 0.8);
					font-weight: 500;
				}
				@media (max-width: 640px) {
					.developerSection {
						padding: 40px 16px;
					}
					.developerContent {
						padding: 20px;
						max-width: 280px;
					}
					.developerHeading {
						font-size: 1rem;
						margin-bottom: 12px;
					}
					.profileImageWrapper {
						width: 100px;
						height: 100px;
					}
					.developerName {
						font-size: 0.95rem;
					}
					.developerText {
						font-size: 0.8rem;
					}
					.socialLink {
						width: 36px;
						height: 36px;
					}
					.socialLink :global(svg) {
						width: 18px;
						height: 18px;
					}
					.developerCopyright {
						font-size: 0.75rem;
						margin-top: 10px;
					}
				}
			`}</style>
		</>
	);
}