import { useEffect, useRef, useState } from "react";
import { init, detect } from "../utils/utils";
import { Camera, RefreshCcw, ScanFace } from "lucide-react";
import { useSong } from "../../home/hooks/useSong";
import "../style/scan.scss";

const moodEmoji = {
  happy: "😄",
  sad: "😢",
  angry: "😡",
  surprise: "😲",
  neutral: "😐",
  calm: "😌",
};

function normalizeMood(mood) {
  const map = {
    surprised: "surprise",
    fear: "neutral",
    disgust: "angry",
  };
  return map[mood] || mood;
}

export default function FaceExpression({ onClick = () => {} }) {
  const videoRef = useRef(null);
  const landmarkerRef = useRef(null);
  const streamRef = useRef(null);
  const initLockRef = useRef(false);
  const { handleGetSong } = useSong();

  const [expression, setExpression] = useState("neutral");
  const [isScanning, setIsScanning] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let mounted = true;

    const setupCamera = async () => {
      if (initLockRef.current) return;
      initLockRef.current = true;

      try {
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (!videoRef.current) return;

        await init({ landmarkerRef, videoRef, streamRef });

        if (mounted && videoRef.current) {
          setCameraReady(true);
          videoRef.current.play().catch((e) => console.log("Autoplay prevented:", e));
        }
      } catch (err) {
        console.error("Camera initialization failed:", err);
      } finally {
        if (mounted) initLockRef.current = false;
      }
    };

    setupCamera();

    return () => {
      mounted = false;
      initLockRef.current = false;

      if (landmarkerRef.current) {
        try {
          landmarkerRef.current.close();
        } catch (e) {
          console.log("Landmarker close error", e);
        }
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  // ---------------- Handle Scan ----------------
  const handleDetectExpression = async () => {
    if (!cameraReady || isScanning || !videoRef.current) return;

    setIsScanning(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((p) => (p >= 95 ? p : p + 5));
    }, 80);

    try {
      const result = await detect({ landmarkerRef, videoRef, setExpression });
      const normalizedMood = normalizeMood(result);

      setExpression(normalizedMood);
      handleGetSong(normalizedMood);
    } catch (err) {
      console.error("Face detection failed:", err);
    } finally {
      clearInterval(progressInterval);
      setProgress(100);

      setTimeout(() => {
        setProgress(0);
        setIsScanning(false);
      }, 500);
    }
  };

  return (
    <div className="scanner-container">
      <div className="scanner-card">
        {/* ---------- Header ---------- */}
        <div className="scanner-header">
          <div className="header-left">
            <ScanFace size={18} className="pulse-icon" />
            <span className="title">
              {cameraReady ? "NEURAL SCANNER" : "INITIALIZING"}
            </span>
          </div>
          <div className="status-container">
            <span className="status-text">{cameraReady ? "READY" : "BOOTING"}</span>
            <div className={`status-beacon ${cameraReady ? "online" : "offline"}`}></div>
          </div>
        </div>

        {/* ---------- Camera Feed ---------- */}
        <div className={`camera-wrapper ${isScanning ? "scanning" : ""}`}>
          <div className="viewport-overlay"></div>
          <video 
            ref={videoRef} 
            className="camera-feed" 
            autoPlay 
            muted 
            playsInline 
            onLoadedMetadata={() => videoRef.current?.play()} 
          />
          <div className="scan-line"></div>

          <div className="bracket tl"></div>
          <div className="bracket tr"></div>
          <div className="bracket bl"></div>
          <div className="bracket br"></div>

          {isScanning && (
            <div className="scan-processing-overlay">
              <RefreshCcw className="spin" size={32} color="white" />
              <p>ANALYZING VECTORS</p>
            </div>
          )}
        </div>

        {/* ---------- Mood Analysis ---------- */}
        <div className="analysis-section">
          <div className="mood-display">
            <span className="mood-icon">{moodEmoji[expression] || "😐 neutral"}</span>
            <h2 className="mood-text">{expression}</h2>
          </div>
          <div className="data-points">
            <div className="data-bar" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* ---------- Scan Button ---------- */}
        <button
          className="capture-btn"
          onClick={handleDetectExpression}
          disabled={!cameraReady || isScanning}
        >
          {isScanning ? (
            <RefreshCcw className="spin" size={20} />
          ) : (
            <>
              <Camera size={20} />
              <span>{cameraReady ? "SCAN EMOTION" : "INITIALIZING"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}