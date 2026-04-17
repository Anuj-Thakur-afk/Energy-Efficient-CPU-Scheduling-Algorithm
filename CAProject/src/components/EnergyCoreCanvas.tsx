'use client';

import React, { useEffect, useRef, useState } from 'react';

interface EnergyCoreCanvasProps {
  energyData: number[]; // Energy per core
}

const EnergyCoreCanvas: React.FC<EnergyCoreCanvasProps> = ({ energyData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ show: boolean; x: number; y: number; title: string; val: string }>({
    show: false,
    x: 0,
    y: 0,
    title: '',
    val: '',
  });

  const hitZonesRef = useRef<any[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const drawChart = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const dpr = window.devicePixelRatio || 1;
      const W = parent.clientWidth;
      const H = 220;

      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.scale(dpr, dpr);

      const PAD_L = 52, PAD_R = 20, PAD_T = 14, PAD_B = 36;
      const chartW = W - PAD_L - PAD_R;
      const chartH = H - PAD_T - PAD_B;

      const maxVal = Math.max(...energyData) * 1.15 || 10;
      const numCores = energyData.length;
      const gap = chartW / numCores;
      const barW = Math.min(60, gap * 0.55);

      ctx.clearRect(0, 0, W, H);

      // Grid lines
      const gridCount = 4;
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      for (let i = 0; i <= gridCount; i++) {
        const y = PAD_T + chartH - (i / gridCount) * chartH;
        ctx.beginPath();
        ctx.moveTo(PAD_L, y);
        ctx.lineTo(PAD_L + chartW, y);
        ctx.stroke();

        const val = ((maxVal * i) / gridCount).toFixed(0);
        ctx.fillStyle = '#64748b';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(val, PAD_L - 8, y + 3.5);
      }
      ctx.setLineDash([]);

      // Y axis label
      ctx.save();
      ctx.translate(12, PAD_T + chartH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Energy (J)', 0, 0);
      ctx.restore();

      const newHitZones: any[] = [];

      energyData.forEach((val, i) => {
        const barH = (val / maxVal) * chartH;
        const x = PAD_L + gap * i + (gap - barW) / 2;
        const y = PAD_T + chartH - barH;

        const grad = ctx.createLinearGradient(x, y, x, PAD_T + chartH);
        grad.addColorStop(0, '#60a5fa');
        grad.addColorStop(0.6, '#3b82f6');
        grad.addColorStop(1, '#2563eb');

        // Draw bar
        ctx.beginPath();
        // ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]); // Note: roundRect might need polyfill or check
        // Manual rounded rect for top only
        const r = 4;
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + barW - r, y);
        ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
        ctx.lineTo(x + barW, PAD_T + chartH);
        ctx.lineTo(x, PAD_T + chartH);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // Glow top
        ctx.beginPath();
        ctx.rect(x, y, barW, Math.min(barH, 4));
        ctx.fillStyle = 'rgba(147,197,253,0.5)';
        ctx.fill();

        // X label
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Core ' + i, x + barW / 2, PAD_T + chartH + 18);

        newHitZones.push({ x, y, w: barW, h: barH, val, core: i });
      });

      hitZonesRef.current = newHitZones;
    };

    drawChart();
    window.addEventListener('resize', drawChart);
    return () => window.removeEventListener('resize', drawChart);
  }, [energyData]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let hit = null;
    for (const z of hitZonesRef.current) {
        // Broaden hit area to bottom of chart
      if (mx >= z.x && mx <= z.x + z.w && my >= z.y && my <= 220) {
        hit = z;
        break;
      }
    }

    if (hit) {
      let tx = hit.x + hit.w + 8;
      let ty = hit.y;
      if (tx + 160 > rect.width) tx = hit.x - 165;
      
      setTooltip({
        show: true,
        x: tx,
        y: Math.max(0, ty),
        title: `Core ${hit.core}`,
        val: `Energy (J) : ${hit.val.toFixed(2)}`,
      });
    } else {
      setTooltip(prev => ({ ...prev, show: false }));
    }
  };

  return (
    <div className="mt-6 bg-[#14192b] rounded-xl p-5 relative">
      <div className="text-[13px] font-semibold text-[#e2e8f0] mb-4 tracking-[-0.2px]">
        Energy Consumption per Core
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip(prev => ({ ...prev, show: false }))}
          className="w-full block"
        />
        {tooltip.show && (
          <div
            className="absolute bg-[#1e2a45] border border-[#2d3f60] rounded-lg p-[10px_14px] pointer-events-none z-10 min-w-[140px] shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <div className="text-xs font-bold text-[#e2e8f0] mb-1.5">{tooltip.title}</div>
            <div className="flex items-center gap-1.5 text-xs text-[#60a5fa] font-semibold">
              <div className="w-2.5 h-2.5 rounded-[2px] bg-[#3b82f6] shrink-0"></div>
              {tooltip.val}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnergyCoreCanvas;
