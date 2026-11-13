/**
 * Canvas player for image sequences extracted from the Flow/Veo clips
 * (public/frames/<name>/f001.webp …). Frames load progressively; until a
 * frame is ready the nearest earlier loaded frame is drawn instead.
 */

export type Rect = { x: number; y: number; w: number; h: number };

export type SequenceOptions = {
  /** folder under /public, e.g. "/frames/bacon" */
  base: string;
  count: number;
  /** colour painted behind the frame */
  bg: string;
  /** where to draw the (trimmed) frame inside a cw × ch canvas */
  place: (cw: number, ch: number, iw: number, ih: number) => Rect;
  /** extra painting after the frame, e.g. feathered edges */
  after?: (ctx: CanvasRenderingContext2D, rect: Rect, cw: number, ch: number) => void;
};

/** px trimmed off every edge: the encoded clips carry a darker row along their borders */
const TRIM = 4;

export const frameUrl = (base: string, i: number) => `${base}/f${String(i + 1).padStart(3, "0")}.webp`;

export type Focus = {
  /** subject point in the clip, as fractions of its width/height */
  x: number;
  y: number;
  /** zoom over plain cover */
  zoom?: number;
  /** where the subject point should land in the canvas (fractions, default center) */
  tx?: number;
  ty?: number;
  /**
   * let the subject reach (tx, ty) even if that uncovers part of the canvas;
   * the uncovered area shows the background and the edges get feathered
   */
  free?: boolean;
};

/**
 * Cover the canvas (zoomed), moving the subject point toward (tx, ty) as far
 * as possible while the frame still covers the whole canvas (unless `free`).
 */
export function coverOn({ x: fx, y: fy, zoom = 1, tx = 0.5, ty = 0.5, free = false }: Focus) {
  return (cw: number, ch: number, iw: number, ih: number): Rect => {
    const s = Math.max(cw / iw, ch / ih) * zoom;
    const w = iw * s;
    const h = ih * s;
    const clamp = (v: number, min: number) => (free ? v : Math.min(0, Math.max(min, v)));
    return { x: clamp(cw * tx - fx * w, cw - w), y: clamp(ch * ty - fy * h, ch - h), w, h };
  };
}

/** Fade every frame edge that sits inside the canvas into the background colour. */
export function featherEdges(bg: string, size = 160) {
  const clear = `${bg}00`;
  return (ctx: CanvasRenderingContext2D, r: Rect, cw: number, ch: number) => {
    const edges: [number, number, number, number, number, number, number, number][] = [];
    // [x0,y0,x1,y1] gradient line, then the rect to fill
    if (r.x > 0) edges.push([r.x, 0, r.x + size, 0, r.x, 0, size, ch]);
    if (r.x + r.w < cw) edges.push([r.x + r.w, 0, r.x + r.w - size, 0, r.x + r.w - size, 0, size, ch]);
    if (r.y > 0) edges.push([0, r.y, 0, r.y + size, 0, r.y, cw, size]);
    if (r.y + r.h < ch) edges.push([0, r.y + r.h, 0, r.y + r.h - size, 0, r.y + r.h - size, cw, size]);
    for (const [x0, y0, x1, y1, fx, fy, fw, fh] of edges) {
      const g = ctx.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, bg);
      g.addColorStop(1, clear);
      ctx.fillStyle = g;
      ctx.fillRect(fx, fy, fw, fh);
    }
  };
}

export function createFrameSequence(canvas: HTMLCanvasElement, opts: SequenceOptions) {
  const ctx = canvas.getContext("2d");
  const frames: HTMLImageElement[] = new Array(opts.count);
  const loaded = new Array<boolean>(opts.count).fill(false);
  let want = 0;
  let shown = -1;
  let cancelled = false;

  const draw = () => {
    if (!ctx) return;
    let i = Math.max(0, Math.min(opts.count - 1, Math.round(want)));
    while (i > 0 && !loaded[i]) i--;
    if (!loaded[i]) return;
    shown = i;
    const img = frames[i];

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (!cw || !ch) return;
    if (canvas.width !== Math.round(cw * dpr) || canvas.height !== Math.round(ch * dpr)) {
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = opts.bg;
    ctx.fillRect(0, 0, cw, ch);

    const iw = img.naturalWidth - TRIM * 2;
    const ih = img.naturalHeight - TRIM * 2;
    const r = opts.place(cw, ch, iw, ih);
    ctx.drawImage(img, TRIM, TRIM, iw, ih, r.x, r.y, r.w, r.h);
    opts.after?.(ctx, r, cw, ch);
  };

  const load = (i: number) =>
    new Promise<void>((resolve) => {
      if (cancelled || frames[i]) return resolve();
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        loaded[i] = true;
        if (Math.round(want) >= i && shown < i) draw();
        resolve();
      };
      img.onerror = () => resolve();
      img.src = frameUrl(opts.base, i);
      frames[i] = img;
    });

  /** first + last frame, then a coarse pass, then everything; resolves when all are in */
  const preload = async () => {
    await load(0);
    await load(opts.count - 1);
    for (const stride of [8, 2, 1]) {
      for (let i = 0; i < opts.count; i += stride) {
        if (cancelled) return;
        await load(i);
      }
    }
  };

  const onResize = () => draw();
  window.addEventListener("resize", onResize);

  return {
    /** show frame `f` (fractional frames are rounded) */
    set(f: number) {
      want = f;
      draw();
    },
    load,
    preload,
    destroy() {
      cancelled = true;
      window.removeEventListener("resize", onResize);
    },
  };
}
