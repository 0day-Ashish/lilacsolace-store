"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Canvas2Page() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pathname = usePathname();

  const [loading, setLoading] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [captures, setCaptures] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [polaroidStripUrl, setPolaroidStripUrl] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => setLoading(false), [pathname]);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  async function startCamera() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert("Camera API not supported");
        return;
      }
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        if (videoRef.current.paused) await videoRef.current.play().catch(() => {});
        setStreamActive(true);
      }
    } catch (err: any) {
      console.error("startCamera error", err);
      alert(
        err?.name === "NotAllowedError"
          ? "Permission denied — allow camera in browser/OS settings."
          : "Unable to access camera. Make sure another app is not using it."
      );
    }
  }

  function stopCamera() {
    const s = videoRef.current?.srcObject as MediaStream | null;
    if (s) {
      s.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  }

  const TARGET_CAPTURE_WIDTH = 640;
  async function captureOnceFast(): Promise<string | null> {
    const vid = videoRef.current;
    if (!vid) return null;

    const waitForVideoFrame = (timeout = 600) =>
      new Promise<void>((resolve) => {
        if ((vid as HTMLVideoElement).readyState >= 3 && (vid as any).videoWidth > 0) return resolve();
        const onLoaded = () => {
          if ((vid as any).videoWidth > 0) {
            vid.removeEventListener("loadeddata", onLoaded);
            resolve();
          }
        };
        vid.addEventListener("loadeddata", onLoaded);
        setTimeout(() => {
          vid.removeEventListener("loadeddata", onLoaded);
          resolve();
        }, timeout);
      });

    try {
      if (vid.paused) {
        await vid.play().catch(() => {});
      }
    } catch {}
    await waitForVideoFrame(600);

    const canvas =
      canvasRef.current ??
      (() => {
        const c = document.createElement("canvas");
        canvasRef.current = c;
        return c;
      })();

    let vw = vid.videoWidth || 1280;
    let vh = vid.videoHeight || 720;
    if (!vw || !vh) {
      const track = (vid.srcObject as MediaStream | null)?.getVideoTracks()?.[0];
      const settings = track?.getSettings();
      if (settings && settings.width) {
        vw = settings.width as number;
        vh = (settings.height as number) || Math.round((vw * 9) / 16);
      }
    }

    const targetW = Math.max(1, Math.min(TARGET_CAPTURE_WIDTH, vw));
    const targetH = Math.max(1, Math.round((vh / vw) * targetW));

    canvas.width = targetW;
    canvas.height = targetH;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    try {
      ctx.drawImage(vid, 0, 0, targetW, targetH);
    } catch (err) {
      await new Promise((r) => setTimeout(r, 80));
      try {
        ctx.drawImage(vid, 0, 0, targetW, targetH);
      } catch (e) {
        console.warn("drawImage failed", e);
        return null;
      }
    }

    return await new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(null);
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ""));
          reader.readAsDataURL(blob);
        },
        "image/jpeg",
        0.85
      );
    });
  }

  // Automatically capture 4 images with 3-second intervals
  async function captureFourPhotos() {
    if (!streamActive) await startCamera();
    if (isCapturing || captures.length >= 4) return;

    setIsCapturing(true);
    setCaptures([]); // Clear previous captures

    // Capture 4 photos automatically
    for (let i = 0; i < 4; i++) {
      // Countdown before each capture
      setCountdown(3);
      for (let s = 3; s > 0; s--) {
        setCountdown(s);
        await new Promise((r) => setTimeout(r, 1000));
      }
      setCountdown(null);

      // Small delay before capture
      await new Promise((r) => setTimeout(r, 200));

      // Capture photo
      const data = await captureOnceFast();
      if (data) {
        setCaptures((prev) => {
          const next = [...prev, data].slice(0, 4);
          // Generate polaroid strip when all 4 photos are captured
          if (next.length === 4) {
            generatePolaroidStrip(next);
          }
          return next;
        });
      }

      // Wait 3 seconds before next capture (except after the last one)
      if (i < 3) {
        await new Promise((r) => setTimeout(r, 3000));
      }
    }

    setIsCapturing(false);
    stopCamera(); // Stop camera after all captures
  }

  // Generate vertical polaroid strip from 4 photos
  async function generatePolaroidStrip(photos: string[]) {
    if (photos.length !== 4) return;

    try {
      // Load Bicubik font
      const bicubikFont = new FontFace("Bicubik", "url(/fonts/Bicubik.otf)");
      await bicubikFont.load();
      document.fonts.add(bicubikFont);

      const stripCanvas = document.createElement("canvas");
      const ctx = stripCanvas.getContext("2d");
      if (!ctx) return;

      // Polaroid strip dimensions (vertical layout)
      const borderWidth = 20; // Thin border on top, left, right
      const dividerWidth = 2; // Thin divider between photos
      const textHeight = 60; // Height for text area below
      const photoWidth = 400; // Width of each photo
      const photoHeight = 300; // Height of each photo (wider than tall)

      // Calculate total dimensions (vertical stack)
      const totalWidth = photoWidth + borderWidth * 2;
      const totalHeight = (photoHeight * 4) + (dividerWidth * 3) + borderWidth + textHeight;

      stripCanvas.width = totalWidth;
      stripCanvas.height = totalHeight;

      // Fill with black background (black frame)
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, totalWidth, totalHeight);

      // Load ribbon image once
      const ribbonImg = new Image();
      ribbonImg.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        ribbonImg.onload = () => resolve();
        ribbonImg.onerror = () => {
          console.warn("Failed to load ribbon image");
          resolve(); // Continue even if ribbon fails
        };
        ribbonImg.src = "/ribbon.png";
      });

      // Draw each photo sequentially (vertically stacked)
      for (let i = 0; i < 4; i++) {
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            try {
              // Calculate position for this photo (vertical stacking)
              const x = borderWidth;
              const y = borderWidth + (photoHeight * i) + (dividerWidth * i);

              // Calculate aspect ratio to fit photo within bounds while maintaining aspect ratio
              const imgAspect = img.width / img.height;
              const targetAspect = photoWidth / photoHeight;
              let drawWidth = photoWidth;
              let drawHeight = photoHeight;
              let drawX = x;
              let drawY = y;

              if (imgAspect > targetAspect) {
                // Image is wider - fit to height
                drawHeight = photoHeight;
                drawWidth = photoHeight * imgAspect;
                drawX = x + (photoWidth - drawWidth) / 2;
              } else {
                // Image is taller - fit to width
                drawWidth = photoWidth;
                drawHeight = photoWidth / imgAspect;
                drawY = y + (photoHeight - drawHeight) / 2;
              }

              // Draw photo
              ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

              // Add ribbon to each photo at different positions
              // Photo 1 (i=0): right, Photo 2 (i=1): left, Photo 3 (i=2): right, Photo 4 (i=3): left
              if (ribbonImg.complete && ribbonImg.naturalWidth > 0) {
                try {
                  // Ribbon size
                  const ribbonScale = 0.15; // Scale ribbon to 15% of photo width
                  const ribbonWidth = photoWidth * ribbonScale;
                  const ribbonHeight = (ribbonImg.height / ribbonImg.width) * ribbonWidth;

                  // Determine position based on photo index (alternating pattern)
                  let ribbonX: number;
                  const ribbonY = y + 20; // Top padding

                  if (i % 2 === 1) {
                    // Photo 2 and 4: left corner
                    ribbonX = x + 20;
                  } else {
                    // Photo 1 and 3: right corner
                    ribbonX = x + photoWidth - ribbonWidth - 20;
                  }

                  // Rotation angle (tilt) in radians - about 15 degrees
                  const rotationAngle = (15 * Math.PI) / 180;

                  // Calculate rotation center (center of ribbon)
                  const centerX = ribbonX + ribbonWidth / 2;
                  const centerY = ribbonY + ribbonHeight / 2;

                  // Save context
                  ctx.save();

                  // Translate to rotation center, rotate, then translate back
                  ctx.translate(centerX, centerY);
                  ctx.rotate(rotationAngle);
                  ctx.translate(-centerX, -centerY);

                  // Draw ribbon
                  ctx.drawImage(ribbonImg, ribbonX, ribbonY, ribbonWidth, ribbonHeight);

                  // Restore context
                  ctx.restore();
                } catch (err) {
                  console.warn(`Failed to draw ribbon on photo ${i + 1}:`, err);
                }
              }

              // Draw divider below (except for the last photo)
              if (i < 3) {
                ctx.fillStyle = "#000000";
                ctx.fillRect(0, y + photoHeight, totalWidth, dividerWidth);
              }
              resolve();
            } catch (err) {
              reject(err);
            }
          };
          img.onerror = () => reject(new Error(`Failed to load image ${i + 1}`));
          img.src = photos[i];
        });
      }

      // Add text area below with black background
      const textY = borderWidth + (photoHeight * 4) + (dividerWidth * 3);
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, textY, totalWidth, textHeight);

      // Load and draw logo2.png beside the text
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      await new Promise<void>((resolve) => {
        logoImg.onload = () => {
          try {
            // Logo size
            const logoHeight = textHeight * 0.9; // 90% of text area height
            const logoWidth = (logoImg.width / logoImg.height) * logoHeight;

            // Calculate text width to position logo correctly
            ctx.font = "bold 32px 'Bicubik', sans-serif";
            const text = "SIGNIFIYA'26";
            const textMetrics = ctx.measureText(text);
            const textWidth = textMetrics.width;

            // Center everything: logo + spacing + text
            const spacing = 15; // Space between logo and text
            const totalContentWidth = logoWidth + spacing + textWidth;
            const startX = (totalWidth - totalContentWidth) / 2;

            // Draw logo
            const logoY = textY + (textHeight - logoHeight) / 2;
            ctx.drawImage(logoImg, startX, logoY, logoWidth, logoHeight);

            // Draw text beside logo using Bicubik font
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 32px 'Bicubik', sans-serif";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(text, startX + logoWidth + spacing, textY + textHeight / 2);
          } catch (err) {
            console.warn("Failed to draw logo:", err);
            // Fallback: just draw text centered
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 32px 'Bicubik', sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("SIGNIFIYA'26", totalWidth / 2, textY + textHeight / 2);
          }
          resolve();
        };
        logoImg.onerror = () => {
          // Fallback: just draw text centered if logo fails to load
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 32px 'Bicubik', sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("SIGNIFIYA'26", totalWidth / 2, textY + textHeight / 2);
          resolve();
        };
        logoImg.src = "/logo2.png";
      });

      // Convert to data URL
      const dataUrl = stripCanvas.toDataURL("image/jpeg", 0.95);
      setPolaroidStripUrl(dataUrl);
      console.log("Polaroid strip generated successfully");
    } catch (error) {
      console.error("Error generating polaroid strip:", error);
    }
  }

  // Download polaroid strip
  function downloadPolaroidStrip() {
    if (!polaroidStripUrl) return;

    const link = document.createElement("a");
    link.download = `polaroid-strip-${Date.now()}.jpg`;
    link.href = polaroidStripUrl;
    link.click();
  }

  function handleRetake() {
    setCaptures([]);
    setPolaroidStripUrl(null);
    setIsCapturing(false);
    setCountdown(null);
    if (!streamActive) startCamera();
  }

  return (
    <main
      className="pageRoot"
      style={{
        minHeight: "100vh",
        margin: 0,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <Link href="/" onClick={() => setLoading(true)}>
        <h1
          style={{
            fontFamily: "'MeowScript', sans-serif",
            position: "absolute",
            top: 15,
            left: 18,
            margin: 0,
            fontSize: "3.2rem",
            color: "#000000",
            cursor: "pointer",
            zIndex: 200,
          }}
        >
          Lilacsolace .
        </h1>
      </Link>

      {/* Counter */}
      <div className="counter">{captures.length}/4</div>

      {/* Main area */}
      <section className="mainArea">
        {polaroidStripUrl && captures.length === 4 ? (
          <div className="polaroidStripContainer">
            <img src={polaroidStripUrl} alt="Polaroid strip" className="polaroidStrip" />
          </div>
        ) : (
          <div className="videoFrame">
            <video ref={videoRef} className="videoEl" playsInline muted autoPlay />
          </div>
        )}

        {/* Thumbnails */}
        {captures.length > 0 && (
          <div className="thumbnails">
            {captures.map((c, idx) => (
              <div key={idx} className="thumbWrap">
                <img src={c} alt={`capture-${idx + 1}`} className="thumbImg" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Actions */}
      <div className="actionRow">
        {!streamActive ? (
          <button className="startBtn" onClick={() => startCamera()}>
            Start Camera
          </button>
        ) : (
          <>
            <button
              className="startBtn primary"
              onClick={captureFourPhotos}
              disabled={isCapturing || captures.length >= 4}
            >
              {isCapturing ? "Capturing..." : captures.length >= 4 ? "Captured" : "Capture 4 Photos"}
            </button>
            <button className="startBtn" onClick={() => stopCamera()} disabled={isCapturing}>
              Stop
            </button>
          </>
        )}

        <button className="retakeBtn" onClick={handleRetake} disabled={isCapturing}>
          Retake
        </button>

        {polaroidStripUrl && captures.length === 4 ? (
          <button className="downloadBtn" onClick={downloadPolaroidStrip}>
            Download
          </button>
        ) : null}
      </div>

      {/* Countdown */}
      {countdown !== null && <div className="countdownPill">{countdown}</div>}
      <canvas ref={canvasRef} style={{ display: "none" }} />

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

        .counter {
          font-weight: 700;
          font-size: 1.5rem;
          color: #ffffff;
          margin-bottom: 20px;
          text-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .mainArea {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          width: 100%;
          max-width: 1200px;
        }

        .polaroidStripContainer {
          display: flex;
          justify-content: center;
          padding: 20px;
          background: rgba(255,255,255,0.2);
          border-radius: 18px;
          backdrop-filter: blur(10px);
        }

        .polaroidStrip {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .videoFrame {
          border-radius: 18px;
          overflow: hidden;
          border: 4px solid rgba(255,255,255,0.9);
          box-shadow: 0 18px 40px rgba(0,0,0,0.2);
          background: #000;
          position: relative;
        }

        .videoEl {
          width: 100%;
          max-width: 640px;
          height: auto;
          display: block;
        }

        .thumbnails {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .thumbWrap {
          width: 150px;
          height: 150px;
          border-radius: 12px;
          overflow: hidden;
          border: 3px solid rgba(255,255,255,0.8);
          background: white;
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }

        .thumbImg {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .actionRow {
          margin-top: 30px;
          display: flex;
          gap: 12px;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
        }

        .startBtn {
          padding: 12px 28px;
          border-radius: 999px;
          font-weight: 800;
          border: none;
          cursor: pointer;
          background: rgba(255,255,255,0.9);
          color: #b5a0ff;
          box-shadow: 0 6px 24px rgba(181,160,255,0.3);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .startBtn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(181,160,255,0.4);
        }

        .startBtn.primary {
          background: linear-gradient(90deg, #b5a0ff, #eec8f0);
          color: white;
          box-shadow: 0 10px 28px rgba(181,160,255,0.4);
        }

        .startBtn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .retakeBtn {
          padding: 12px 24px;
          border-radius: 999px;
          border: 2px solid rgba(255,255,255,0.8);
          background: transparent;
          color: #ffffff;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .retakeBtn:hover {
          background: rgba(255,255,255,0.2);
        }

        .downloadBtn {
          padding: 12px 28px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          background: linear-gradient(90deg, #b5a0ff, #eec8f0);
          color: white;
          font-weight: 800;
          box-shadow: 0 10px 28px rgba(181,160,255,0.4);
          transition: transform 0.2s ease;
        }

        .downloadBtn:hover {
          transform: translateY(-2px);
        }

        .countdownPill {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0,0,0,0.8);
          color: #fff;
          padding: 20px 30px;
          border-radius: 20px;
          font-size: 4rem;
          font-weight: 800;
          z-index: 999;
          pointer-events: none;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }

        @media (max-width: 768px) {
          .videoEl {
            max-width: 100%;
          }
          .polaroidStrip {
            max-width: 100%;
          }
          .thumbWrap {
            width: 120px;
            height: 120px;
          }
          .counter {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </main>
  );
}
