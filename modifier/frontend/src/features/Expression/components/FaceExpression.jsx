import { useEffect, useRef, useState } from "react";
import { init, detect } from "../utils/utils";
import { Camera, RefreshCcw, ScanFace } from "lucide-react";
import "../style/scan.scss";

const moodEmoji = {
  happy: "😄",
  sad: "😢",
  angry: "😡",
  surprised: "😲",
  neutral: "😐",
};

export default function FaceExpression({ onClick = () => {} }) {
  const videoRef = useRef(null);
  const landmarkerRef = useRef(null);
  const streamRef = useRef(null);

  const [expression, setExpression] = useState("neutral");
  const [isScanning, setIsScanning] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [progress, setProgress] = useState(0);

useEffect(() => {
  let mounted = true;

  const setupCamera = async () => {
    if (!mounted) return;

    await init({ landmarkerRef, videoRef, streamRef });

    if (mounted) {
      setCameraReady(true);
    }
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

    const result = await detect({
      landmarkerRef,
      videoRef,
      setExpression,
    });

    clearInterval(progressInterval);
    setProgress(100);

    document.body.className = `mood-${result}`;
    onClick(result);

    setTimeout(() => {
      setIsScanning(false);
      setProgress(0);
    }, 700);
  };

  return (
    <div className="scanner-container">
      <div className="scanner-card">
        {/* HEADER */}
        <div className="scanner-header">
          <div className="header-left">
            <ScanFace size={18} className="pulse-icon" />
            <span className="title">
              {cameraReady ? "NEURAL SCANNER" : "INITIALIZING"}
            </span>
          </div>

          <div className={`status ${cameraReady ? "online" : "offline"}`}>
            {cameraReady ? "READY" : "BOOTING"}
          </div>
        </div>

        {/* CAMERA VIEW */}
        <div className={`camera-wrapper ${isScanning ? "scanning" : ""}`}>
          <video
            ref={videoRef}
            className="camera-feed"
            autoPlay
            muted
            playsInline
            preload="none"
          />

          <div className="scan-overlay"></div>
          <div className="scan-line"></div>

          {isScanning && (
            <div className="scan-processing">
              <div className="loader-ring"></div>
              <p>Analyzing facial vectors...</p>
            </div>
          )}
        </div>

        {/* RESULT */}
        <div className="analysis-section">
          <div className="mood-display">
            <span className="mood-icon">{moodEmoji[expression] || "😐"}</span>

            <h2 className="mood-text">{expression}</h2>
          </div>

          <div className="progress-bar">
            <div className="progress" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* BUTTON */}
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
              <span>Scan Emotion</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
