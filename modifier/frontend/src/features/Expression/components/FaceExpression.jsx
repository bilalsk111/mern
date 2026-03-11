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
  calm: "😌"
};

function normalizeMood(mood) {
  const map = {
    surprised: "surprise",
    fear: "neutral",
    disgust: "angry"
  };
  return map[mood] || mood;
}

export default function FaceExpression({ onClick = () => {} }) {
  const videoRef = useRef(null);
  const landmarkerRef = useRef(null);
  const streamRef = useRef(null);
  const { handleGetSong } = useSong();
  const [expression, setExpression] = useState("neutral");
  const [isScanning, setIsScanning] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let mounted = true;
    const setupCamera = async () => {
      if (!mounted) return;
      await init({ landmarkerRef, videoRef, streamRef });
      if (mounted) setCameraReady(true);
    };
    setupCamera();
    return () => {
      mounted = false;
      if (landmarkerRef.current) landmarkerRef.current.close();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleDetectExpression = async () => {
    if (!cameraReady || isScanning) return;
    setIsScanning(true);
    setProgress(0);
    const progressInterval = setInterval(() => {
      setProgress((p) => (p >= 95 ? p : p + 5));
    }, 80);

    const result = await detect({ landmarkerRef, videoRef, setExpression });
    const normalizedMood = normalizeMood(result);

    clearInterval(progressInterval);
    setProgress(100);
    setExpression(normalizedMood);
    handleGetSong(normalizedMood);

    setTimeout(() => {
      setIsScanning(false);
      setProgress(0);
    }, 700);
  };

  return (
    <div className="scanner-container">
      <div className="scanner-card">
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

        <div className={`camera-wrapper ${isScanning ? "scanning" : ""}`}>
          <div className="viewport-overlay"></div>
          <video ref={videoRef} className="camera-feed" autoPlay muted playsInline />
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

        <div className="analysis-section">
          <div className="mood-display">
            <span className="mood-icon">{moodEmoji[expression] || "😐 neutral"}</span>
            <h2 className="mood-text">{expression}</h2>
          </div>
          <div className="data-points">
            <div className="data-bar" style={{ width: `${progress}%` }} />
          </div>
        </div>

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
              <span>SCAN EMOTION</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}