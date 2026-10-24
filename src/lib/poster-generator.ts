/**
 * 海报生成器 —— Canvas 粒子霓虹烟火。
 * 在离屏 Canvas 上绘制烟火粒子 + tagline，输出 base64 data URL。
 * 纯代码零外链依赖。
 */

/** 单个烟火粒子 */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  gravity: number;
}

/** 烟火炸开配置 */
interface Burst {
  cx: number;
  cy: number;
  color: string;
  count: number;
  spread: number;
}

const CANVAS_W = 800;
const CANVAS_H = 1067; // 3:4 aspect

/** 霓虹烟火调色板 —— 橙/金/粉/白/紫 */
const PALETTE = [
  "#ff9a3c",
  "#ffc857",
  "#ff5c7a",
  "#ffd166",
  "#ffffff",
  "#ff6b9d",
  "#f8a5c2",
  "#ffb347",
  "#fuchsia",
  "#gold",
];

/** 预定义炸点位置（烟火在画布中上部分布） */
const BURST_POSITIONS: Burst[] = [
  { cx: 200, cy: 180, color: "#ff9a3c", count: 60, spread: 100 },
  { cx: 600, cy: 140, color: "#ff5c7a", count: 70, spread: 120 },
  { cx: 400, cy: 250, color: "#ffd166", count: 65, spread: 110 },
  { cx: 150, cy: 320, color: "#ff6b9d", count: 55, spread: 95 },
  { cx: 650, cy: 330, color: "#ffc857", count: 60, spread: 105 },
  { cx: 300, cy: 100, color: "#ffb347", count: 50, spread: 90 },
  { cx: 500, cy: 200, color: "#f8a5c2", count: 58, spread: 100 },
  { cx: 400, cy: 380, color: "#ff9a3c", count: 70, spread: 130 },
];

/**
 * 生成海报 —— 返回 base64 data URL + tagline
 */
export function generatePoster(
  tagline: string,
  dateStr: string
): { imageUrl: string } {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext("2d")!;

  // 1. 暗夜渐变背景
  const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  bgGrad.addColorStop(0, "#0a0a1a");
  bgGrad.addColorStop(0.4, "#0d0d2b");
  bgGrad.addColorStop(0.7, "#0f0a1e");
  bgGrad.addColorStop(1, "#050510");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // 2. 远山/城市天际线剪影（底部）
  drawSkyline(ctx, CANVAS_W, CANVAS_H);

  // 3. 粒子烟火炸开
  const allParticles: Particle[] = [];
  for (const burst of BURST_POSITIONS) {
    const particles = spawnBurst(burst);
    allParticles.push(...particles);
  }

  // 4. 物理模拟帧（多帧累计让粒子有轨迹感）
  simulateParticles(ctx, allParticles);

  // 5. 画面下半叠加暗色渐变（让文字可读）
  const overlay = ctx.createLinearGradient(0, CANVAS_H * 0.55, 0, CANVAS_H);
  overlay.addColorStop(0, "rgba(10,10,26,0)");
  overlay.addColorStop(0.3, "rgba(10,10,26,0.6)");
  overlay.addColorStop(1, "rgba(10,10,26,0.9)");
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // 6. 地面光晕——摊位灯火倒映
  drawGroundGlow(ctx, CANVAS_W, CANVAS_H);

  // 7. Tagline 排版 —— 大字手写风格
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // 主标题
  ctx.font = `bold 52px "KaiTi", "楷体", "STKaiti", "Noto Serif SC", serif`;
  ctx.fillStyle = "#ffd166";
  ctx.shadowColor = "rgba(255, 209, 102, 0.5)";
  ctx.shadowBlur = 20;
  wrapText(ctx, tagline, CANVAS_W / 2, CANVAS_H * 0.68, CANVAS_W - 120, 56);

  // 日期副标题
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.font = `24px "KaiTi", "楷体", "STKaiti", "Noto Serif SC", serif`;
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.fillText(dateStr, CANVAS_W / 2, CANVAS_H * 0.78);

  // 底部装饰线
  ctx.strokeStyle = "rgba(255,209,102,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(CANVAS_W / 2 - 80, CANVAS_H * 0.83);
  ctx.lineTo(CANVAS_W / 2 + 80, CANVAS_H * 0.83);
  ctx.stroke();

  // 底部小字
  ctx.font = `16px "KaiTi", "楷体", "STKaiti", "Noto Serif SC", serif`;
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillText("探寻霓虹中的烟火", CANVAS_W / 2, CANVAS_H * 0.86);

  return { imageUrl: canvas.toDataURL("image/png", 0.92) };
}

/** 生成一波烟火粒子 */
function spawnBurst(burst: Burst): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < burst.count; i++) {
    const angle = (Math.PI * 2 * i) / burst.count + (Math.random() - 0.5) * 0.5;
    const speed = burst.spread * (0.3 + Math.random() * 0.7);
    particles.push({
      x: burst.cx,
      y: burst.cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 0.8 + Math.random() * 2.5,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      alpha: 1,
      decay: 0.005 + Math.random() * 0.02,
      gravity: 0.008 + Math.random() * 0.015,
    });
  }
  return particles;
}

/** 多帧物理模拟绘制粒子 */
function simulateParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  const frames = 40;
  const dt = 1.2;

  for (let f = 0; f < frames; f++) {
    for (const p of particles) {
      // 移动
      p.x += p.vx * dt * 0.1;
      p.y += p.vy * dt * 0.1;
      p.vy += p.gravity * dt;
      p.alpha -= p.decay * dt;
      if (p.alpha <= 0) continue;

      // 渲染
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      // 外发光
      ctx.fillStyle = p.color.replace(")", `,${p.alpha * 0.3})`).replace("rgb", "rgba");
      if (p.color.startsWith("#")) {
        const r = parseInt(p.color.slice(1, 3), 16);
        const g = parseInt(p.color.slice(3, 5), 16);
        const b = parseInt(p.color.slice(5, 7), 16);
        ctx.fillStyle = `rgba(${r},${g},${b},${p.alpha * 0.35})`;
      }
      ctx.fill();

      // 核心亮点
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 0.5, 0, Math.PI * 2);
      if (p.color.startsWith("#")) {
        const r = parseInt(p.color.slice(1, 3), 16);
        const g = parseInt(p.color.slice(3, 5), 16);
        const b = parseInt(p.color.slice(5, 7), 16);
        ctx.fillStyle = `rgba(${r},${g},${b},${p.alpha * 0.8})`;
      }
      ctx.fill();
    }
  }
}

/** 远山/城市天际线剪影 */
function drawSkyline(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
) {
  ctx.fillStyle = "#0d0d1f";
  ctx.beginPath();
  ctx.moveTo(0, h);
  // 模拟建筑轮廓
  const buildings = [
    { x: 0, height: 0.12 },
    { x: 60, height: 0.18 },
    { x: 140, height: 0.10 },
    { x: 200, height: 0.22 },
    { x: 280, height: 0.15 },
    { x: 340, height: 0.25 },
    { x: 420, height: 0.13 },
    { x: 480, height: 0.20 },
    { x: 560, height: 0.16 },
    { x: 640, height: 0.28 },
    { x: 720, height: 0.11 },
    { x: 800, height: 0.18 },
  ];
  for (const b of buildings) {
    ctx.lineTo(b.x, h * (1 - b.height));
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  // 几扇小窗灯光
  for (let i = 0; i < 30; i++) {
    const wx = Math.random() * w;
    const wy = h * (1 - 0.05 - Math.random() * 0.25);
    const size = 1 + Math.random() * 2;
    ctx.fillStyle = `rgba(255,${200 + Math.floor(Math.random() * 55)},${100 + Math.floor(Math.random() * 100)},${0.3 + Math.random() * 0.5})`;
    ctx.fillRect(wx, wy, size, size * 1.2);
  }
}

/** 地面光晕——摊位灯火在画面底部倒映 */
function drawGroundGlow(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
) {
  // 几个暖色光斑
  const glows = [
    { x: w * 0.2, y: h * 0.88, r: 60, color: "#ff9a3c" },
    { x: w * 0.5, y: h * 0.9, r: 80, color: "#ff5c7a" },
    { x: w * 0.8, y: h * 0.87, r: 55, color: "#ffd166" },
  ];
  for (const g of glows) {
    const grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r);
    const rgb = hexToRgb(g.color);
    grad.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},0.15)`);
    grad.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(g.x - g.r, g.y - g.r, g.r * 2, g.r * 2);
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

/** 简易文本自动换行 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  baseY: number,
  maxWidth: number,
  lineHeight: number
) {
  const chars = [...text];
  let line = "";
  let y = baseY;
  for (let i = 0; i < chars.length; i++) {
    const test = line + chars[i];
    if (ctx.measureText(test).width > maxWidth && line.length > 0) {
      ctx.fillText(line, cx, y);
      line = chars[i];
      y += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, cx, y);
}