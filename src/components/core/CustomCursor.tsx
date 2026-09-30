import { useEffect, useRef, useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';

type ThemeMode = 'blue' | 'cyan' | 'green';

interface ThemeColorDef {
  stroke: string;
  glow: string;
  filter: string;
  gradDark: string;
  gradMid: string;
  gradBright: string;
  gradHighlight: string;
}

const THEMES: Record<ThemeMode, ThemeColorDef> = {
  // Day Mode (7:30 AM – 4:00 PM) -> Electric High-Tech Blue
  blue: {
    stroke: '#00A6FF',
    glow: '0 0 10px rgba(0, 119, 255, 0.8), 0 0 20px rgba(0, 119, 255, 0.4)',
    filter:
      'drop-shadow(0 0 1.5px #00B4FF) drop-shadow(0 0 4.5px #0066FF) drop-shadow(0 0 10px rgba(0, 119, 255, 0.75))',
    gradDark: '#002C6E',
    gradMid: '#005CE6',
    gradBright: '#38BDF8',
    gradHighlight: '#00D4FF',
  },
  // Bikal / Vor Mode (Dawn: 5:00 AM – 7:30 AM | Dusk: 4:00 PM – 7:30 PM) -> Luminous Cyber Cyan
  cyan: {
    stroke: '#00FCFF',
    glow: '0 0 10px rgba(0, 252, 255, 0.8), 0 0 20px rgba(0, 252, 255, 0.4)',
    filter:
      'drop-shadow(0 0 1.5px #00FCFF) drop-shadow(0 0 4.5px #30F2FA) drop-shadow(0 0 10px rgba(0, 252, 255, 0.75))',
    gradDark: '#124B4E',
    gradMid: '#24A8AC',
    gradBright: '#30F2FA',
    gradHighlight: '#00FCFF',
  },
  // Night Mode (7:30 PM – 5:00 AM) -> Radiant Matrix Green
  green: {
    stroke: '#00FF66',
    glow: '0 0 10px rgba(0, 255, 102, 0.8), 0 0 20px rgba(0, 255, 102, 0.4)',
    filter:
      'drop-shadow(0 0 1.5px #00FF66) drop-shadow(0 0 4.5px #10B981) drop-shadow(0 0 10px rgba(0, 255, 102, 0.75))',
    gradDark: '#033F28',
    gradMid: '#0D9465',
    gradBright: '#34D399',
    gradHighlight: '#00FF66',
  },
};

// Natural baseline geometric angles of the 4 hand-drawn vectors in cursor.svg
// Angle 0: Points North / Straight Up (0°)
// Angle 1: Points North-West / Classic Top-Left (-33.8°)
// Angle 2: Points North-East / Top-Right (+28.0°)
// Angle 3: Points South / Dynamic Downward (+150.0°)
const BASE_ANGLES = [0, -33.8, 28.0, 150.0];

// Scale factor so 1100-1300 SVG units = ~32px crisp display cursor
const SVG_SCALE = 0.028;

// Normalized tip translation offsets to guarantee every angle tip is locked at (0, 0)
const TIP_TRANSFORMS = [
  `scale(${SVG_SCALE}) translate(-1103.712, -310.371)`,
  `scale(${SVG_SCALE}) translate(-738.097, -2238.309)`,
  `scale(${SVG_SCALE}) translate(-3225.623, -357.912)`,
  `scale(${SVG_SCALE}) translate(-2577.776, -2255.423)`,
];

function shortestAngleDiff(fromDeg: number, toDeg: number): number {
  let diff = (toDeg - fromDeg) % 360;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff;
}

export default function CustomCursor() {
  const cursorContainerRef = useRef<HTMLDivElement>(null);
  const cursorPivoterRef = useRef<HTMLDivElement>(null);

  // Group SVG references for instantaneous DOM display toggling (zero frame latency)
  const gRefs = useRef<(SVGGElement | null)[]>([null, null, null, null]);

  // Position state (hardware tracking with zero lag)
  const pos = useRef({ x: -200, y: -200 });
  const prevPos = useRef({ x: -200, y: -200 });
  const smoothVx = useRef(0);
  const smoothVy = useRef(0);

  // Rotational spring physics
  const rotZ = useRef(0);
  const rotX = useRef(0);
  const rotY = useRef(0);
  const lastSwitchTime = useRef(0);

  // Active angle index: 0 (North), 1 (North-West), 2 (North-East), 3 (South)
  const [activeAngle, setActiveAngle] = useState(1);
  const activeAngleRef = useRef(1);

  // Interaction states
  const isHoveredRef = useRef(false);
  const isMouseDownRef = useRef(false);
  const isVisibleRef = useRef(false);

  // Time-of-day subscription from global store
  const timeOfDay = useStore((s) => s.timeOfDay);

  const theme: ThemeMode = useMemo(() => {
    if (timeOfDay >= 7.5 && timeOfDay < 16.0) {
      return 'blue';
    } else if (
      (timeOfDay >= 5.0 && timeOfDay < 7.5) ||
      (timeOfDay >= 16.0 && timeOfDay < 19.5)
    ) {
      return 'cyan';
    } else {
      return 'green';
    }
  }, [timeOfDay]);

  const activeThemeConfig = THEMES[theme];

  // Seamless angle switcher: preserves rotational continuity so the arrow rotates fluidly
  const switchAngle = (newAngle: number) => {
    const oldAngle = activeAngleRef.current;
    if (newAngle === oldAngle) return;

    const now = performance.now();
    // 180ms lockout to eliminate any possibility of rapid fluttering or jitter
    if (now - lastSwitchTime.current < 180) return;

    // Calculate angular delta between old and new base angles
    // By offsetting rotZ by this delta, the visual orientation is 100% continuous across the switch!
    const delta = shortestAngleDiff(BASE_ANGLES[newAngle], BASE_ANGLES[oldAngle]);
    rotZ.current += delta;

    // Instant DOM display switch (zero frame lag, no ghosting)
    if (gRefs.current[oldAngle]) gRefs.current[oldAngle]!.style.display = 'none';
    if (gRefs.current[newAngle]) gRefs.current[newAngle]!.style.display = 'inline';

    activeAngleRef.current = newAngle;
    lastSwitchTime.current = now;
    setActiveAngle(newAngle);
  };

  useEffect(() => {
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    const onMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      pos.current.x = clientX;
      pos.current.y = clientY;

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        prevPos.current.x = clientX;
        prevPos.current.y = clientY;
      }

      const rawVx = clientX - prevPos.current.x;
      const rawVy = clientY - prevPos.current.y;
      prevPos.current.x = clientX;
      prevPos.current.y = clientY;

      // Exponential moving average filter removes hand tremor & micro-jitter
      smoothVx.current = smoothVx.current * 0.7 + rawVx * 0.3;
      smoothVy.current = smoothVy.current * 0.7 + rawVy * 0.3;

      const speed = Math.hypot(smoothVx.current, smoothVy.current);

      // Intelligent angle selection:
      // When moving with intentional speed (> 2.4px/frame), heading determines angle
      if (speed > 2.4) {
        const headingDeg = (Math.atan2(smoothVy.current, smoothVx.current) * 180) / Math.PI;

        let nextAngle = activeAngleRef.current;

        // Moving UP: Sector [-125°, -55°] -> Angle 0 (North)
        if (headingDeg >= -125 && headingDeg <= -55) {
          nextAngle = 0;
        }
        // Moving RIGHT / UP-RIGHT: Sector [-55°, 40°] -> Angle 2 (North-East)
        else if (headingDeg > -55 && headingDeg < 40) {
          nextAngle = 2;
        }
        // Moving DOWN: Sector [40°, 135°] -> Angle 3 (South)
        else if (headingDeg >= 40 && headingDeg <= 135) {
          nextAngle = 3;
        }
        // Moving LEFT / UP-LEFT: Sector [135°, 180°] or [-180°, -125°] -> Angle 1 (North-West)
        else {
          nextAngle = 1;
        }

        switchAngle(nextAngle);
      } else {
        // When stationary or moving very slowly:
        // Position-based zone awareness with wide hysteresis margins
        const winW = window.innerWidth || 1920;
        const winH = window.innerHeight || 1080;
        const normX = clientX / winW;
        const normY = clientY / winH;

        // Deep zones only, with hysteresis to prevent edge chatter
        if (normY > 0.82) {
          switchAngle(3); // Deep bottom
        } else if (normX > 0.72) {
          switchAngle(2); // Deep right
        } else if (normX < 0.28) {
          switchAngle(1); // Deep left
        } else if (normY < 0.22 && normX >= 0.35 && normX <= 0.65) {
          switchAngle(0); // Deep top center
        }
      }

      // Parallax 3D Perspective Tilt
      const winW = window.innerWidth || 1920;
      const winH = window.innerHeight || 1080;
      const normCenterX = (clientX / winW - 0.5) * 2;
      const normCenterY = (clientY / winH - 0.5) * 2;
      rotX.current = normCenterY * 8;
      rotY.current = -normCenterX * 8;

      // Direct zero-latency hardware translation (tip locked to mouse coordinates)
      if (cursorContainerRef.current) {
        cursorContainerRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
        cursorContainerRef.current.style.opacity = '1';
      }
    };

    const onMouseDown = () => {
      isMouseDownRef.current = true;
    };
    const onMouseUp = () => {
      isMouseDownRef.current = false;
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const isClickable = !!target.closest(
        'button, a, input, textarea, select, [role="button"], .cursor-pointer, .clickable, [tabindex]:not([tabindex="-1"])'
      );
      isHoveredRef.current = isClickable;
    };

    const onMouseLeave = () => {
      isVisibleRef.current = false;
      if (cursorContainerRef.current) cursorContainerRef.current.style.opacity = '0';
    };
    const onMouseEnter = () => {
      isVisibleRef.current = true;
      if (cursorContainerRef.current) cursorContainerRef.current.style.opacity = '1';
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    window.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    let rafId: number;

    const animate = () => {
      // 1. Smooth spring relaxation for rotZ towards 0 (settles perfectly into the active angle)
      rotZ.current += (0 - rotZ.current) * 0.16;

      // 2. Subtle aerodynamic banking into horizontal turns
      const bankAngle = Math.max(-8, Math.min(8, smoothVx.current * 0.28));
      const totalZRotation = rotZ.current + bankAngle;

      const activeHover = isHoveredRef.current || useStore.getState().cursorHover;
      const isMouseDown = isMouseDownRef.current;
      const hoverScale = isMouseDown ? 0.90 : activeHover ? 1.15 : 1.0;

      if (cursorPivoterRef.current) {
        cursorPivoterRef.current.style.transform = `
          rotateZ(${totalZRotation.toFixed(2)}deg)
          rotateX(${rotX.current.toFixed(1)}deg)
          rotateY(${rotY.current.toFixed(1)}deg)
          scale(${hoverScale.toFixed(3)})
        `;
      }

      // Smooth decay of velocity when mouse stops
      smoothVx.current *= 0.88;
      smoothVy.current *= 0.88;

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const isTouchDevice =
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  if (isTouchDevice) return null;

  return (
    <>
      {/* ─── Hardware-Snapped Custom Cursor (Tip precisely anchored at (0,0)) ─── */}
      <div
        ref={cursorContainerRef}
        className="fixed top-0 left-0 pointer-events-none z-[99999] will-change-transform"
        style={{
          transform: 'translate3d(-200px, -200px, 0)',
        }}
      >
        {/* Dynamic Rotation & Scale Pivot Anchor exactly at the pointer tip (0, 0) */}
        <div
          ref={cursorPivoterRef}
          className="relative pointer-events-none will-change-transform"
          style={{
            transformOrigin: '0px 0px',
            filter: activeThemeConfig.filter,
            transition: 'filter 0.35s ease',
          }}
        >
          {/* Zero-offset root SVG: each angle group is mathematically normalized to (0, 0) */}
          <svg
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '1px',
              height: '1px',
              overflow: 'visible',
              shapeRendering: 'geometricPrecision',
            }}
          >
            <defs>
              {/* Dynamic Theme Gradients */}
              <linearGradient
                id={`grad_dark_${theme}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={activeThemeConfig.gradDark} />
                <stop offset="100%" stopColor={activeThemeConfig.gradMid} />
              </linearGradient>
              <linearGradient
                id={`grad_mid_${theme}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={activeThemeConfig.gradMid} />
                <stop offset="100%" stopColor={activeThemeConfig.gradBright} />
              </linearGradient>
              <linearGradient
                id={`grad_bright_${theme}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={activeThemeConfig.gradBright} />
                <stop offset="100%" stopColor={activeThemeConfig.gradHighlight} />
              </linearGradient>
            </defs>

            {/* ── Angle 0: North / Straight Up (0°) ── */}
            <g
              ref={(el) => { gRefs.current[0] = el; }}
              transform={TIP_TRANSFORMS[0]}
              style={{ display: activeAngle === 0 ? 'inline' : 'none' }}
            >
              <path
                fill={`url(#grad_dark_${theme})`}
                stroke={activeThemeConfig.stroke}
                strokeWidth="45"
                strokeLinejoin="round"
                strokeLinecap="round"
                d="M1583.082,1249.99v148.99l-0.36-0.81c-2.84,17.08-22.05,29.51-40.17,20.19l-426.16-219 c-3.98-2.04-8.33-3.07-12.68-3.07V436.9c9.94,0,19.89,5.21,24.95,15.62l395.79,814.39L1583.082,1249.99z"
              />
              <path
                fill={`url(#grad_mid_${theme})`}
                stroke={activeThemeConfig.stroke}
                strokeWidth="45"
                strokeLinejoin="round"
                strokeLinecap="round"
                d="M1103.712,436.9v759.39 c-4.35,0-8.7,1.03-12.67,3.07l-426.16,219c-20.42,10.5-42.21-6.59-40.43-26.85l-0.1,0.18v-138.2l34.28-7.9l26.99,15.89 l393.15-808.96C1083.832,442.11,1093.772,436.9,1103.712,436.9z"
              />
              <path
                fill={`url(#grad_bright_${theme})`}
                stroke={activeThemeConfig.stroke}
                strokeWidth="50"
                strokeLinejoin="round"
                strokeLinecap="round"
                d="M1078.769,310.371l-451.511,929.051 c-11.65,23.971,13.919,48.974,37.623,36.792l426.155-219.009c7.957-4.089,17.398-4.089,25.356,0l426.155,219.009 c23.704,12.182,49.273-12.821,37.624-36.792L1128.66,310.371C1118.544,289.554,1088.885,289.554,1078.769,310.371z"
              />
            </g>

            {/* ── Angle 1: North-West / Classic Top-Left (-33.8°) ── */}
            <g
              ref={(el) => { gRefs.current[1] = el; }}
              transform={TIP_TRANSFORMS[1]}
              style={{ display: activeAngle === 1 ? 'inline' : 'none' }}
            >
              <path
                fill={`url(#grad_mid_${theme})`}
                stroke={activeThemeConfig.stroke}
                strokeWidth="45"
                strokeLinejoin="round"
                strokeLinecap="round"
                d="M699.85,2248.454l-70.492,78.567 c-0.03,0.032-0.059,0.066-0.089,0.099l-0.284,0.317l0.006,0.006c-6.438,7.223-9.659,17.407-6.952,28.323l281.127,1133.454 c6.385,25.741,38.368,31.276,53.953,13.315l0.004,0.009l75.398-84.838l141.183-422.61c3.944-9.314,12.139-16.153,22.007-18.368 l528.536-118.623c9.625-2.16,16.516-7.935,20.495-15.146l0.019,0.011l70.193-77.403L699.85,2248.454z"
              />
              <path
                fill={`url(#grad_bright_${theme})`}
                stroke={activeThemeConfig.stroke}
                strokeWidth="50"
                strokeLinejoin="round"
                strokeLinecap="round"
                d="M694.793,2274.451l281.127,1133.454 c7.253,29.245,47.559,32.424,59.308,4.679l211.229-498.802c3.944-9.314,12.139-16.153,22.007-18.368l528.536-118.623 c29.399-6.598,33.479-46.823,6.003-59.189L738.097,2238.309C714.237,2227.57,688.495,2249.055,694.793,2274.451z"
              />
            </g>

            {/* ── Angle 2: North-East / Top-Right (+28.0°) ── */}
            <g
              ref={(el) => { gRefs.current[2] = el; }}
              transform={TIP_TRANSFORMS[2]}
              style={{ display: activeAngle === 2 ? 'inline' : 'none' }}
            >
              <path
                fill={`url(#grad_dark_${theme})`}
                stroke={activeThemeConfig.stroke}
                strokeWidth="45"
                strokeLinejoin="round"
                strokeLinecap="round"
                d="M3412.958,1637.454l-0.01,0.01 c-11.59,6.74-27.3,6.13-38.2-5.88l-360.37-396.85c-6.73-7.41-16.58-11.08-26.45-9.86l-528.77,65.38c-1.38,0.17-2.74,0.25-4.06,0.25 c-12.73,0-22.69-7.6-27.48-17.72l-35.67-81.817l583.67-480.433l401.76,838.43L3412.958,1637.454z"
              />
              <path
                fill={`url(#grad_mid_${theme})`}
                stroke={activeThemeConfig.stroke}
                strokeWidth="45"
                strokeLinejoin="round"
                strokeLinecap="round"
                d="M3412.958,1637.454l-35.58-88.49 l-401.76-838.43l296.48-348.39l37.55,75.52c1.08,1.7,2,3.54,2.74,5.5l0.07,0.15l-0.02-0.01c0.94,2.51,1.59,5.21,1.87,8.1 l113.83,1155.99C3429.478,1620.994,3422.668,1631.813,3412.958,1637.454z"
              />
              <path
                fill={`url(#grad_bright_${theme})`}
                stroke={activeThemeConfig.stroke}
                strokeWidth="50"
                strokeLinejoin="round"
                strokeLinecap="round"
                d="M3225.623,357.912l-828.214,795.601 c-21.369,20.528-4.309,56.442,25.104,52.847l528.772-64.628c9.873-1.207,19.722,2.423,26.451,9.749l360.366,392.317 c20.045,21.822,56.332,5.569,53.395-23.917L3277.67,377.094C3275.12,351.489,3244.18,340.086,3225.623,357.912z"
              />
            </g>

            {/* ── Angle 3: South / Downward (+150.0°) ── */}
            <g
              ref={(el) => { gRefs.current[3] = el; }}
              transform={TIP_TRANSFORMS[3]}
              style={{ display: activeAngle === 3 ? 'inline' : 'none' }}
            >
              <path
                fill={`url(#grad_dark_${theme})`}
                stroke={activeThemeConfig.stroke}
                strokeWidth="45"
                strokeLinejoin="round"
                strokeLinecap="round"
                d="M3518.336,2790.437l-37.33,133.11h-0.02 c-1.33,12-10.18,23.12-24.65,24.65l-476.5,50.25c-8.9,0.94-16.79,6.11-21.21,13.89l-236.53,416.69 c-6.8,11.99-19.47,15.93-30.58,13.28l35.2-138.07c0,0,194.36-374.16,339.28-647.44L3518.336,2790.437z"
              />
              <path
                fill={`url(#grad_mid_${theme})`}
                stroke={activeThemeConfig.stroke}
                strokeWidth="45"
                strokeLinejoin="round"
                strokeLinecap="round"
                d="M3065.996,2656.797 c-144.92,273.28-339.28,647.44-339.28,647.44l-35.2,138.07c-10.39-2.47-19.41-10.68-21.05-23.45l-131.26-1024.58 c-0.52-4.05-0.16-7.89,0.87-11.41l-1.11-0.63l38.57-137.57L3065.996,2656.797z"
              />
              <path
                fill={`url(#grad_bright_${theme})`}
                stroke={activeThemeConfig.stroke}
                strokeWidth="50"
                strokeLinejoin="round"
                strokeLinecap="round"
                d="M2577.776,2255.423l131.263,1024.582 c3.387,26.436,38.475,33.345,51.632,10.167l236.525-416.689c4.417-7.78,12.315-12.953,21.212-13.891l476.496-50.254 c26.505-2.795,34.196-37.72,11.318-51.392l-886.707-529.857C2599.646,2216.217,2574.835,2232.466,2577.776,2255.423z"
              />
            </g>
          </svg>
        </div>
      </div>

      {/* Global CSS to completely suppress browser native pointer on desktop */}
      <style>{`
        html, body, * { cursor: none !important; }
        @media (pointer: coarse) {
          html, body, * { cursor: auto !important; }
        }
      `}</style>
    </>
  );
}
