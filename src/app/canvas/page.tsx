"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import emailjs from "@emailjs/browser";

export default function CanvasPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pathname = usePathname();

  const [loading, setLoading] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [processedPhoto, setProcessedPhoto] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

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

  async function capturePhoto() {
    if (!streamActive) await startCamera();
    if (capturedPhoto) return;

    // Countdown
    setCountdown(3);
    for (let s = 3; s > 0; s--) {
      setCountdown(s);
      await new Promise((r) => setTimeout(r, 1000));
    }
    setCountdown(null);

    // Capture
    const data = await captureOnceFast();
    if (data) {
      setCapturedPhoto(data);
      processPhotoWithFrame(data);
      stopCamera(); // Stop camera after capture
    }
  }

  // Process photo with black frame, design, and text, then place in canvas1.jpg template
  async function processPhotoWithFrame(photoDataUrl: string) {
    try {
      // Load Bicubik font
      const bicubikFont = new FontFace("Bicubik", "url(/fonts/Bicubik.otf)");
      await bicubikFont.load();
      document.fonts.add(bicubikFont);

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = photoDataUrl;
      });

      const frameWidth = 20; // Black frame width
      const textHeight = 60; // Height for text area below
      const designPadding = 10; // Padding for design elements
      
      // Create temporary canvas for the decorated image
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;

      // Calculate dimensions
      const photoWidth = img.width;
      const photoHeight = img.height;
      const totalWidth = photoWidth + frameWidth * 2;
      const totalHeight = photoHeight + frameWidth * 2 + textHeight;

      tempCanvas.width = totalWidth;
      tempCanvas.height = totalHeight;

      // Fill entire canvas with black (frame)
      tempCtx.fillStyle = "#000000";
      tempCtx.fillRect(0, 0, totalWidth, totalHeight);

      // Draw photo in the center (with frame around it)
      tempCtx.drawImage(img, frameWidth, frameWidth, photoWidth, photoHeight);

      // Add design elements on the image (decorative corners)
      tempCtx.strokeStyle = "#ffffff";
      tempCtx.lineWidth = 3;
      
      // Top-left corner decoration
      const cornerSize = 30;
      tempCtx.beginPath();
      tempCtx.moveTo(frameWidth + designPadding, frameWidth + designPadding + cornerSize);
      tempCtx.lineTo(frameWidth + designPadding, frameWidth + designPadding);
      tempCtx.lineTo(frameWidth + designPadding + cornerSize, frameWidth + designPadding);
      tempCtx.stroke();

      // Top-right corner decoration
      tempCtx.beginPath();
      tempCtx.moveTo(frameWidth + photoWidth - designPadding - cornerSize, frameWidth + designPadding);
      tempCtx.lineTo(frameWidth + photoWidth - designPadding, frameWidth + designPadding);
      tempCtx.lineTo(frameWidth + photoWidth - designPadding, frameWidth + designPadding + cornerSize);
      tempCtx.stroke();

      // Bottom-left corner decoration
      tempCtx.beginPath();
      tempCtx.moveTo(frameWidth + designPadding, frameWidth + photoHeight - designPadding - cornerSize);
      tempCtx.lineTo(frameWidth + designPadding, frameWidth + photoHeight - designPadding);
      tempCtx.lineTo(frameWidth + designPadding + cornerSize, frameWidth + photoHeight - designPadding);
      tempCtx.stroke();

      // Bottom-right corner decoration
      tempCtx.beginPath();
      tempCtx.moveTo(frameWidth + photoWidth - designPadding - cornerSize, frameWidth + photoHeight - designPadding);
      tempCtx.lineTo(frameWidth + photoWidth - designPadding, frameWidth + photoHeight - designPadding);
      tempCtx.lineTo(frameWidth + photoWidth - designPadding, frameWidth + photoHeight - designPadding - cornerSize);
      tempCtx.stroke();

      // Add ribbon in top right corner with tilt
      const ribbonImg = new Image();
      ribbonImg.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        ribbonImg.onload = () => {
          try {
            // Ribbon size (scale it appropriately)
            const ribbonScale = 0.15; // Scale ribbon to 15% of photo width
            const ribbonWidth = photoWidth * ribbonScale;
            const ribbonHeight = (ribbonImg.height / ribbonImg.width) * ribbonWidth;

            // Position in top right corner
            const ribbonX = frameWidth + photoWidth - ribbonWidth - 20;
            const ribbonY = frameWidth + 20;

            // Rotation angle (tilt) in radians - about 15 degrees
            const rotationAngle = (15 * Math.PI) / 180;

            // Calculate rotation center (center of ribbon)
            const centerX = ribbonX + ribbonWidth / 2;
            const centerY = ribbonY + ribbonHeight / 2;

            // Save context
            tempCtx.save();

            // Translate to rotation center, rotate, then translate back
            tempCtx.translate(centerX, centerY);
            tempCtx.rotate(rotationAngle);
            tempCtx.translate(-centerX, -centerY);

            // Draw ribbon
            tempCtx.drawImage(ribbonImg, ribbonX, ribbonY, ribbonWidth, ribbonHeight);

            // Restore context
            tempCtx.restore();
            resolve();
          } catch (err) {
            console.warn("Failed to draw ribbon:", err);
            resolve(); // Continue even if ribbon fails
          }
        };
        ribbonImg.onerror = () => {
          console.warn("Failed to load ribbon image");
          resolve(); // Continue even if ribbon fails to load
        };
        ribbonImg.src = "/ribbon.png";
      });

      // Add text area below with black background
      const textY = frameWidth + photoHeight + frameWidth;
      tempCtx.fillStyle = "#000000";
      tempCtx.fillRect(0, textY, totalWidth, textHeight);

      // Load and draw logo2.png beside the text
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      await new Promise<void>((resolve) => {
        logoImg.onload = () => {
          try {
            // Logo size - made bigger
            const logoHeight = textHeight * 0.9; // 90% of text area height (increased from 70%)
            const logoWidth = (logoImg.width / logoImg.height) * logoHeight;

            // Calculate text width to position logo correctly
            tempCtx.font = "bold 32px 'Bicubik', sans-serif";
            const text = "SIGNIFIYA'26";
            const textMetrics = tempCtx.measureText(text);
            const textWidth = textMetrics.width;

            // Center everything: logo + spacing + text
            const spacing = 15; // Space between logo and text
            const totalContentWidth = logoWidth + spacing + textWidth;
            const startX = (totalWidth - totalContentWidth) / 2;

            // Draw logo
            const logoY = textY + (textHeight - logoHeight) / 2;
            tempCtx.drawImage(logoImg, startX, logoY, logoWidth, logoHeight);

            // Draw text beside logo using Bicubik font
            tempCtx.fillStyle = "#ffffff";
            tempCtx.font = "bold 32px 'Bicubik', sans-serif";
            tempCtx.textAlign = "left";
            tempCtx.textBaseline = "middle";
            tempCtx.fillText(text, startX + logoWidth + spacing, textY + textHeight / 2);
          } catch (err) {
            console.warn("Failed to draw logo:", err);
            // Fallback: just draw text centered
            tempCtx.fillStyle = "#ffffff";
            tempCtx.font = "bold 32px 'Bicubik', sans-serif";
            tempCtx.textAlign = "center";
            tempCtx.textBaseline = "middle";
            tempCtx.fillText("SIGNIFIYA'26", totalWidth / 2, textY + textHeight / 2);
          }
          resolve();
        };
        logoImg.onerror = () => {
          // Fallback: just draw text centered if logo fails to load
          tempCtx.fillStyle = "#ffffff";
          tempCtx.font = "bold 32px 'Bicubik', sans-serif";
          tempCtx.textAlign = "center";
          tempCtx.textBaseline = "middle";
          tempCtx.fillText("SIGNIFIYA'26", totalWidth / 2, textY + textHeight / 2);
          resolve();
        };
        logoImg.src = "/logo2.png";
      });

      // Now load canvas1.jpg template and place the decorated image inside it
      const templateImg = new Image();
      templateImg.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        templateImg.onload = () => {
          try {
            // Create final canvas with template dimensions
            const finalCanvas = document.createElement("canvas");
            const finalCtx = finalCanvas.getContext("2d");
            if (!finalCtx) {
              reject(new Error("Could not get canvas context"));
              return;
            }

            finalCanvas.width = templateImg.width;
            finalCanvas.height = templateImg.height;

            // Draw the template as background
            finalCtx.drawImage(templateImg, 0, 0);

            // Calculate the black area in the template where we'll place the image
            // Based on the description: central black rectangle
            // We'll detect it or use approximate coordinates
            // For now, using approximate positioning - you may need to adjust these values
            const templatePaddingX = templateImg.width * 0.15; // Approximate left margin
            const templatePaddingY = templateImg.height * 0.08; // Approximate top margin
            const templateImageWidth = templateImg.width - templatePaddingX * 2;
            const templateImageHeight = templateImg.height - templatePaddingY - (templateImg.height * 0.2); // Account for bottom margin

            // Calculate scaling to fit the decorated image inside the template's black area
            const scaleX = templateImageWidth / totalWidth;
            const scaleY = templateImageHeight / totalHeight;
            const scale = Math.min(scaleX, scaleY); // Use smaller scale to fit entirely

            const scaledWidth = totalWidth * scale;
            const scaledHeight = totalHeight * scale;

            // Center the scaled image in the template's image area
            const imageX = templatePaddingX + (templateImageWidth - scaledWidth) / 2;
            const imageY = templatePaddingY + (templateImageHeight - scaledHeight) / 2;

            // Draw the decorated image into the template
            finalCtx.drawImage(tempCanvas, imageX, imageY, scaledWidth, scaledHeight);

            // Convert to data URL
            const processedDataUrl = finalCanvas.toDataURL("image/jpeg", 0.95);
            setProcessedPhoto(processedDataUrl);
            resolve();
          } catch (err) {
            console.error("Error compositing with template:", err);
            // Fallback: use the decorated image without template
            const processedDataUrl = tempCanvas.toDataURL("image/jpeg", 0.95);
            setProcessedPhoto(processedDataUrl);
            resolve();
          }
        };
        templateImg.onerror = () => {
          console.warn("Failed to load canvas1.jpg template, using decorated image without template");
          // Fallback: use the decorated image without template
          const processedDataUrl = tempCanvas.toDataURL("image/jpeg", 0.95);
          setProcessedPhoto(processedDataUrl);
          resolve();
        };
        templateImg.src = "/canvas1.jpg";
      });
    } catch (error) {
      console.error("Error processing photo:", error);
      // Fallback to original photo if processing fails
      setProcessedPhoto(photoDataUrl);
    }
  }

  // Download photo
  function downloadPhoto() {
    const photoToDownload = processedPhoto || capturedPhoto;
    if (!photoToDownload) return;

    const link = document.createElement("a");
    link.download = `photo-${Date.now()}.jpg`;
    link.href = photoToDownload;
    link.click();
  }

  // Upload image to hosting service and get URL
  async function uploadImageToHosting(dataUrl: string): Promise<string> {
    try {
      const response = await fetch("/api/upload-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageData: dataUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.imageUrl) {
        throw new Error(data.error || "Failed to upload image");
      }

      return data.imageUrl;
    } catch (error) {
      console.error("Image upload error:", error);
      throw error;
    }
  }

  // Send photo to email using EmailJS
  async function sendToEmail() {
    const photoToSend = processedPhoto || capturedPhoto;
    if (!photoToSend) return;

    if (!email || !email.includes("@")) {
      setEmailError("Please enter a valid email address");
      return;
    }

    // Check if EmailJS is configured
    if (!process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 
        !process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 
        !process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY) {
      setEmailError("Email service is not configured. Please contact support.");
      return;
    }

    setSendingEmail(true);
    setEmailError(null);

    try {
      // Upload image to hosting service and get URL
      const imageUrl = await uploadImageToHosting(photoToSend);

      // EmailJS template parameters with image URL (much smaller than base64)
      // Note: Variable names must match your EmailJS template
      const templateParams = {
        to_email: email,
        to_name: email.split("@")[0], // Extract name from email
        from_name: "Lilacsolace Photo Booth",
        subject: "Your Photo from Lilacsolace Photo Booth",
        message: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #c8a2c8;">Your Photo is Ready! 📸</h2>
            <p>Thank you for using Lilacsolace Photo Booth!</p>
            <p>Your generated photo:</p>
            <div style="margin: 20px 0; text-align: center;">
              <img src="${imageUrl}" alt="Your Photo" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
            </div>
            <p style="margin-top: 20px;">
              <a href="${imageUrl}" style="display: inline-block; padding: 10px 20px; background: #c8a2c8; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Download Full Size Photo</a>
            </p>
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Made with ❤️ by <a href="https://arddev.vercel.app" style="color: #c8a2c8;">ard.dev</a>
            </p>
          </div>
        `,
        reply_to: email,
      };

      // Send email using EmailJS
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      );

      // Store email for marketing purposes
      try {
        await fetch("/api/store-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email }),
        });
      } catch (storeError) {
        // Don't fail the email send if storage fails
        console.error("Failed to store email:", storeError);
      }

      setEmailSent(true);
      setEmail("");
      setTimeout(() => {
        setShowEmailForm(false);
        setEmailSent(false);
      }, 3000);
    } catch (error: any) {
      console.error("Send email error:", error);
      setEmailError(error.text || error.message || "Failed to send email. Please try again.");
    } finally {
      setSendingEmail(false);
    }
  }

  function handleRetake() {
    setCapturedPhoto(null);
    setProcessedPhoto(null);
    if (!streamActive) startCamera();
  }

  // Upload fallback
  function onUploadFile(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setCapturedPhoto(dataUrl);
      processPhotoWithFrame(dataUrl);
    };
    reader.readAsDataURL(file);
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

      {/* Main area */}
      <section className="mainArea">
        {(processedPhoto || capturedPhoto) ? (
          <div className="photoContainer">
            <img src={(processedPhoto || capturedPhoto) as string} alt="Captured photo" className="capturedPhoto" />
          </div>
        ) : (
          <div className="videoFrame">
            <video ref={videoRef} className="videoEl" playsInline muted autoPlay />
          </div>
        )}
      </section>

      {/* Actions */}
      <div className="actionRow">
        {!streamActive && !capturedPhoto ? (
          <button className="startBtn" onClick={() => startCamera()}>
            Start Camera
          </button>
        ) : (processedPhoto || capturedPhoto) ? (
          <>
            <button className="downloadBtn" onClick={downloadPhoto}>
              Download
            </button>
            <button className="emailBtn" onClick={() => setShowEmailForm(true)}>
              Send to Email
            </button>
            <button className="retakeBtn" onClick={handleRetake}>
              Retake
            </button>
          </>
        ) : (
          <>
            <button className="startBtn primary" onClick={capturePhoto} disabled={!streamActive}>
              Capture Photo
            </button>
            <button className="startBtn" onClick={() => stopCamera()}>
              Stop
            </button>
            <label className="uploadBtn" title="Upload an image">
              <input type="file" accept="image/*" onChange={onUploadFile} />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 3v10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 12l7-7 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 21H3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Upload</span>
            </label>
          </>
        )}
      </div>

      {/* Countdown */}
      {countdown !== null && <div className="countdownPill">{countdown}</div>}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Email Form Modal */}
      {showEmailForm && (
        <div className="emailModalOverlay" onClick={() => setShowEmailForm(false)}>
          <div className="emailModal" onClick={(e) => e.stopPropagation()}>
            <button className="closeEmailModal" onClick={() => setShowEmailForm(false)}>
              ×
            </button>
            <h3>Send Photo to Email</h3>
            {emailSent ? (
              <div className="emailSuccess">
                <p>✓ Email sent successfully!</p>
                <p style={{ fontSize: "0.9rem", color: "#666", marginTop: "8px" }}>
                  Check your inbox for your photo.
                </p>
              </div>
            ) : (
              <>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(null);
                  }}
                  className="emailInput"
                  disabled={sendingEmail}
                />
                {emailError && <div className="emailError">{emailError}</div>}
                <div className="emailModalButtons">
                  <button
                    className="sendEmailBtn"
                    onClick={sendToEmail}
                    disabled={sendingEmail || !email}
                  >
                    {sendingEmail ? "Sending..." : "Send Email"}
                  </button>
                  <button
                    className="cancelEmailBtn"
                    onClick={() => {
                      setShowEmailForm(false);
                      setEmail("");
                      setEmailError(null);
                    }}
                    disabled={sendingEmail}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .pageRoot {
          min-height: 100vh;
          background: linear-gradient(120deg, #f7e9ef 0%, #fdeff3 40%, #ffeef6 100%);
        }

        .mainArea {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 800px;
          margin-top: 80px;
        }

        .photoContainer {
          display: flex;
          justify-content: center;
          padding: 20px;
          background: rgba(255,255,255,0.3);
          border-radius: 18px;
          backdrop-filter: blur(10px);
        }

        .capturedPhoto {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }

        .videoFrame {
          border-radius: 18px;
          overflow: hidden;
          border: 4px solid rgba(0,0,0,0.9);
          box-shadow: 0 18px 40px rgba(0,0,0,0.12);
          background: #000;
          position: relative;
        }

        .videoEl {
          width: 100%;
          max-width: 640px;
          height: auto;
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
          background: #fff;
          color: #e91e63;
          box-shadow: 0 6px 24px rgba(233,30,99,0.12);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .startBtn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(233,30,99,0.18);
        }

        .startBtn.primary {
          background: linear-gradient(90deg, #ff6fa3, #ff4f89);
          color: white;
          box-shadow: 0 10px 28px rgba(255,79,137,0.18);
        }

        .startBtn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .retakeBtn {
          padding: 12px 24px;
          border-radius: 999px;
          border: 2px solid rgba(233,30,99,0.16);
          background: transparent;
          color: #ff4f89;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .retakeBtn:hover {
          background: rgba(255,79,137,0.1);
        }

        .emailBtn {
          padding: 12px 28px;
          border-radius: 999px;
          border: none;
          background: linear-gradient(135deg, #c8a2c8 0%, #b5a0ff 100%);
          color: #ffffff;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 12px rgba(200, 162, 200, 0.3);
        }
        .emailBtn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(200, 162, 200, 0.4);
        }
        .emailBtn:active {
          transform: translateY(0);
        }
        .downloadBtn {
          padding: 12px 28px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          background: linear-gradient(90deg, #ff6fa3, #ff4f89);
          color: white;
          font-weight: 800;
          box-shadow: 0 10px 28px rgba(255,79,137,0.18);
          transition: transform 0.2s ease;
        }

        .downloadBtn:hover {
          transform: translateY(-2px);
        }

        .uploadBtn {
          display: inline-flex;
          gap: 8px;
          align-items: center;
          background: #fff;
          padding: 12px 20px;
          border-radius: 999px;
          border: 1px solid rgba(0,0,0,0.06);
          cursor: pointer;
          font-weight: 600;
          color: #111;
          box-shadow: 0 6px 24px rgba(233,30,99,0.12);
          transition: transform 0.2s ease;
        }

        .uploadBtn:hover {
          transform: translateY(-2px);
        }

        .uploadBtn input {
          display: none;
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
          .capturedPhoto {
            max-width: 100%;
          }
          .mainArea {
            margin-top: 60px;
          }
        }

        .emailModalOverlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .emailModal {
          background: #ffffff;
          border-radius: 20px;
          padding: 32px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          position: relative;
        }
        .closeEmailModal {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          font-size: 28px;
          color: #666;
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s ease;
        }
        .closeEmailModal:hover {
          background: #f0f0f0;
        }
        .emailModal h3 {
          margin: 0 0 20px 0;
          font-size: 1.5rem;
          color: #333;
          font-weight: 700;
        }
        .emailInput {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          margin-bottom: 12px;
          transition: border-color 0.2s ease;
          box-sizing: border-box;
        }
        .emailInput:focus {
          outline: none;
          border-color: #c8a2c8;
        }
        .emailInput:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }
        .emailError {
          color: #e74c3c;
          font-size: 0.9rem;
          margin-bottom: 12px;
          padding: 8px;
          background: #fee;
          border-radius: 6px;
        }
        .emailSuccess {
          text-align: center;
          padding: 20px;
          color: #27ae60;
        }
        .emailSuccess p {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
        }
        .emailModalButtons {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }
        .sendEmailBtn {
          flex: 1;
          padding: 12px 24px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, #c8a2c8 0%, #b5a0ff 100%);
          color: #ffffff;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }
        .sendEmailBtn:hover:not(:disabled) {
          transform: translateY(-2px);
        }
        .sendEmailBtn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .cancelEmailBtn {
          flex: 1;
          padding: 12px 24px;
          border-radius: 8px;
          border: 2px solid #e0e0e0;
          background: #ffffff;
          color: #666;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .cancelEmailBtn:hover:not(:disabled) {
          background: #f5f5f5;
        }
        .cancelEmailBtn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </main>
  );
}
