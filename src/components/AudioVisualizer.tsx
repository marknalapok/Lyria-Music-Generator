import React, { useRef, useEffect } from "react";

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  tempo: number;
  colorPreset?: "cyan" | "purple" | "emerald";
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  analyser,
  isPlaying,
  tempo,
  colorPreset = "cyan"
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high density displays
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Audio frequency buffer setup
    let bufferLength = analyser ? analyser.frequencyBinCount : 64;
    let dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!canvas || !ctx) return;
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, width, height);

      // Neon Gradients matching preset
      let grad = ctx.createLinearGradient(0, height, 0, 0);
      if (colorPreset === "cyan") {
        grad.addColorStop(0, "rgba(6, 182, 212, 0.1)");
        grad.addColorStop(0.5, "rgba(6, 182, 212, 0.6)");
        grad.addColorStop(1, "rgb(6, 182, 212)");
      } else if (colorPreset === "purple") {
        grad.addColorStop(0, "rgba(168, 85, 247, 0.1)");
        grad.addColorStop(0.5, "rgba(236, 72, 153, 0.6)");
        grad.addColorStop(1, "rgb(236, 72, 153)");
      } else {
        grad.addColorStop(0, "rgba(16, 185, 129, 0.1)");
        grad.addColorStop(0.5, "rgba(52, 211, 153, 0.6)");
        grad.addColorStop(1, "rgb(52, 211, 153)");
      }

      if (isPlaying && analyser) {
        // REAL AUDIO VISUALIZATION
        analyser.getByteFrequencyData(dataArray);

        const barWidth = (width / bufferLength) * 1.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = (dataArray[i] / 255) * height * 0.9;

          ctx.fillStyle = grad;
          // Rounded bars for slick design
          ctx.beginPath();
          ctx.roundRect(x, height - barHeight, barWidth - 2, barHeight, [4, 4, 0, 0]);
          ctx.fill();

          x += barWidth;
        }

        // Draw a glowing middle overlay wave
        ctx.beginPath();
        ctx.strokeStyle = colorPreset === "cyan" ? "rgba(34, 211, 238, 0.5)" : "rgba(244, 63, 94, 0.5)";
        ctx.lineWidth = 2;
        let segmentWidth = width / bufferLength;
        for (let i = 0; i < bufferLength; i++) {
          let magnitude = (dataArray[i] / 255) * 30;
          let y = height / 2 + Math.sin(i * 0.15 + Date.now() * 0.005) * magnitude;
          if (i === 0) {
            ctx.moveTo(0, y);
          } else {
            ctx.lineTo(i * segmentWidth, y);
          }
        }
        ctx.stroke();

      } else if (isPlaying) {
        // PROCEDURAL SYNTH EMULATED MOVEMENT
        const barCount = 48;
        const barWidth = width / barCount;
        const time = Date.now() * 0.004 * (tempo / 120);

        for (let i = 0; i < barCount; i++) {
          // Dynamic wave equations based on sine & cosine
          const waveVal1 = Math.sin(i * 0.25 - time) * 0.4 + 0.5;
          const waveVal2 = Math.cos(i * 0.1 + time * 1.5) * 0.3 + 0.3;
          let factor = (waveVal1 + waveVal2) / 2;

          // Add random jitter to emulate frequencies
          factor += (Math.random() - 0.5) * 0.15;
          factor = Math.max(0.05, Math.min(0.95, factor));

          const barHeight = factor * height * 0.85;

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(i * barWidth, height - barHeight, barWidth - 2, barHeight, [3, 3, 0, 0]);
          ctx.fill();
        }

        // Draw an elegant decorative sweeping sound wave across center
        ctx.beginPath();
        ctx.strokeStyle = colorPreset === "cyan" ? "rgba(6, 182, 212, 0.4)" : "rgba(168, 85, 247, 0.4)";
        ctx.lineWidth = 1.5;
        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * 0.03 + time * 2) * 15 * Math.sin(time + x * 0.005);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

      } else {
        // IDLE VISUALIZATION
        const barCount = 40;
        const barWidth = width / barCount;
        for (let i = 0; i < barCount; i++) {
          // Subtle resting noise
          const restingHeight = 12 + Math.sin(i * 0.4) * 5;
          ctx.fillStyle = "rgba(75, 85, 99, 0.2)"; // Muted slate gray
          ctx.beginPath();
          ctx.roundRect(i * barWidth, height - restingHeight, barWidth - 3, restingHeight, [2, 2, 0, 0]);
          ctx.fill();
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isPlaying, tempo, colorPreset]);

  return (
    <div className="relative w-full h-32 md:h-40 bg-slate-900/65 rounded-xl border border-slate-800/80 p-2 overflow-hidden shadow-inner backdrop-blur-md">
      {/* Background static grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
