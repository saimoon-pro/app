import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { assetUrl } from '@/lib/assetUrl';
import { SkipForward } from 'lucide-react';

const REGULATOR_VIDEOS: Record<number, string> = {
  1: assetUrl('backgrounds/Regulator 1.mp4'),
  2: assetUrl('backgrounds/Regulator 2.mp4'),
  3: assetUrl('backgrounds/Regulator 3.mov'),
  4: assetUrl('backgrounds/Regulator 4.mov'),
  5: assetUrl('backgrounds/Regulator 5.mp4'),
  6: assetUrl('backgrounds/Regulator 6.mp4'),
};

const CONTACT_VIDEO = assetUrl('backgrounds/Contact Screen.mp4');
const TRANSITION_VIDEO = assetUrl('backgrounds/Transition.mp4');

// ── WebGL Alpha/Luma Matte Transition Compositor ──
function AlphaMatteCanvas({
  introVideo,
  regulatorVideo,
  transitionVideo,
  onComplete,
}: {
  introVideo: HTMLVideoElement | null;
  regulatorVideo: HTMLVideoElement | null;
  transitionVideo: HTMLVideoElement | null;
  onComplete: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !introVideo || !regulatorVideo || !transitionVideo) return;

    const gl = canvas.getContext('webgl', { alpha: false, preserveDrawingBuffer: false });
    if (!gl) {
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }

    const vsSource = `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main() {
        v_uv = vec2((a_pos.x + 1.0) * 0.5, 1.0 - (a_pos.y + 1.0) * 0.5);
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      uniform sampler2D u_intro;
      uniform sampler2D u_regulator;
      uniform sampler2D u_matte;
      varying vec2 v_uv;
      void main() {
        vec4 colIntro = texture2D(u_intro, v_uv);
        vec4 colReg = texture2D(u_regulator, v_uv);
        vec4 colMatte = texture2D(u_matte, v_uv);
        // Luma matte: white dots reveal incoming Regulator 1, black retains Intro
        float luma = clamp(dot(colMatte.rgb, vec3(0.299, 0.587, 0.114)) * 1.3, 0.0, 1.0);
        gl_FragColor = mix(colIntro, colReg, luma);
      }
    `;

    function createShader(type: number, source: string) {
      const s = gl!.createShader(type);
      if (!s) return null;
      gl!.shaderSource(s, source);
      gl!.compileShader(s);
      return s;
    }

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    function setupTexture(unit: number, uniformName: string) {
      const tex = gl!.createTexture();
      gl!.activeTexture(gl!.TEXTURE0 + unit);
      gl!.bindTexture(gl!.TEXTURE_2D, tex);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
      const loc = gl!.getUniformLocation(program!, uniformName);
      gl!.uniform1i(loc, unit);
      return tex;
    }

    const texIntro = setupTexture(0, 'u_intro');
    const texReg = setupTexture(1, 'u_regulator');
    const texMatte = setupTexture(2, 'u_matte');

    let completed = false;

    function render() {
      if (completed) return;

      if (introVideo!.readyState >= 2) {
        gl!.activeTexture(gl!.TEXTURE0);
        gl!.bindTexture(gl!.TEXTURE_2D, texIntro);
        gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, introVideo!);
      }

      if (regulatorVideo!.readyState >= 2) {
        gl!.activeTexture(gl!.TEXTURE1);
        gl!.bindTexture(gl!.TEXTURE_2D, texReg);
        gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, regulatorVideo!);
      }

      if (transitionVideo!.readyState >= 2) {
        gl!.activeTexture(gl!.TEXTURE2);
        gl!.bindTexture(gl!.TEXTURE_2D, texMatte);
        gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, transitionVideo!);
      }

      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      gl!.drawArrays(gl!.TRIANGLES, 0, 6);

      // First transition part finishes around 1.5s
      if (transitionVideo!.currentTime >= 1.5) {
        completed = true;
        onComplete();
        return;
      }

      animFrameRef.current = requestAnimationFrame(render);
    }

    animFrameRef.current = requestAnimationFrame(render);

    const maxTimer = setTimeout(() => {
      if (!completed) {
        completed = true;
        onComplete();
      }
    }, 1600);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      clearTimeout(maxTimer);
      try {
        gl!.deleteTexture(texIntro);
        gl!.deleteTexture(texReg);
        gl!.deleteTexture(texMatte);
        gl!.deleteBuffer(buf);
        gl!.deleteProgram(program!);
      } catch {
        // Safe cleanup
      }
    };
  }, [introVideo, regulatorVideo, transitionVideo, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={360}
      className="absolute inset-0 w-full h-full object-cover z-20 pointer-events-none"
      style={{ transform: 'translate3d(0,0,0)', willChange: 'transform' }}
    />
  );
}

export default function BackgroundVideoSystem() {
  const introCompleted = useStore((s) => s.introCompleted);
  const setIntroCompleted = useStore((s) => s.setIntroCompleted);
  const currentRegulator = useStore((s) => s.currentRegulator);
  const activeNode = useStore((s) => s.activeNode);

  // Intro video states: 'welcome' | 'transitioning' | 'completed'
  const [introState, setIntroState] = useState<'welcome' | 'transitioning' | 'completed'>(
    introCompleted ? 'completed' : 'welcome'
  );

  const welcomeVideoRef = useRef<HTMLVideoElement>(null);
  const transitionVideoRef = useRef<HTMLVideoElement>(null);

  // Crossfade between dual video elements for buttery regulator switching
  const [activeLayer, setActiveLayer] = useState<'A' | 'B'>('A');
  const [layerAVideo, setLayerAVideo] = useState<string>(REGULATOR_VIDEOS[currentRegulator] || REGULATOR_VIDEOS[1]);
  const [layerBVideo, setLayerBVideo] = useState<string>('');
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);

  // Determine current active target video (Contact screen if activeNode is 'contact', else regulator)
  const isContactMode = activeNode === 'contact';
  const targetVideo = isContactMode ? CONTACT_VIDEO : (REGULATOR_VIDEOS[currentRegulator] || REGULATOR_VIDEOS[1]);

  // Handle Welcome video end -> play Transition (capped to 5 seconds)
  const handleWelcomeEnded = useCallback(() => {
    setIntroState('transitioning');
    if (transitionVideoRef.current) {
      transitionVideoRef.current.currentTime = 0;
      transitionVideoRef.current.play().catch(() => {});
    }
    if (videoARef.current) {
      videoARef.current.currentTime = 0;
      videoARef.current.play().catch(() => {});
    }
  }, []);

  // 5-second cap on Welcome Video
  useEffect(() => {
    if (introState !== 'welcome') return;
    const timer = setTimeout(() => {
      handleWelcomeEnded();
    }, 5000);
    return () => clearTimeout(timer);
  }, [introState, handleWelcomeEnded]);

  const handleWelcomeTimeUpdate = () => {
    if (welcomeVideoRef.current && welcomeVideoRef.current.currentTime >= 5) {
      handleWelcomeEnded();
    }
  };

  // Handle Transition video end -> enter main site
  const handleTransitionEnded = useCallback(() => {
    setIntroState('completed');
    setIntroCompleted(true);
  }, [setIntroCompleted]);

  // Skip intro handler
  const handleSkipIntro = useCallback(() => {
    setIntroState('completed');
    setIntroCompleted(true);
  }, [setIntroCompleted]);

  // Regulator / Contact Mode crossfade effect
  useEffect(() => {
    if (introState !== 'completed') return;

    if (activeLayer === 'A') {
      setLayerBVideo(targetVideo);
      if (videoBRef.current) {
        videoBRef.current.src = targetVideo;
        videoBRef.current.load();
        videoBRef.current.play().then(() => {
          setActiveLayer('B');
        }).catch(() => {
          setActiveLayer('B');
        });
      }
    } else {
      setLayerAVideo(targetVideo);
      if (videoARef.current) {
        videoARef.current.src = targetVideo;
        videoARef.current.load();
        videoARef.current.play().then(() => {
          setActiveLayer('A');
        }).catch(() => {
          setActiveLayer('A');
        });
      }
    }
  }, [targetVideo, introState]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* ── INTRO WELCOMING SEQUENCE ── */}
      {introState !== 'completed' && (
        <div className="absolute inset-0 z-50 pointer-events-auto bg-black flex items-center justify-center">
          {/* Welcoming Video (capped to 5s) */}
          <video
            ref={welcomeVideoRef}
            src={CONTACT_VIDEO}
            autoPlay
            muted
            playsInline
            onEnded={handleWelcomeEnded}
            onTimeUpdate={handleWelcomeTimeUpdate}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              introState === 'welcome' ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Hidden Transition Video Element used for Alpha Matte frames */}
          <video
            ref={transitionVideoRef}
            src={TRANSITION_VIDEO}
            muted
            playsInline
            className="hidden"
          />

          {/* WebGL Alpha/Luma Matte Transition between Contact Screen & Regulator 1 */}
          {introState === 'transitioning' && (
            <AlphaMatteCanvas
              introVideo={welcomeVideoRef.current}
              regulatorVideo={videoARef.current}
              transitionVideo={transitionVideoRef.current}
              onComplete={handleTransitionEnded}
            />
          )}

          {/* Skip Intro Button */}
          <button
            onClick={handleSkipIntro}
            className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 hover:bg-[#00C853]/90 text-white hover:text-black font-mono text-xs uppercase tracking-wider backdrop-blur-md border border-white/20 hover:border-[#00C853] transition-all duration-300 group shadow-lg cursor-pointer"
          >
            <span>Skip Intro</span>
            <SkipForward size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Welcoming Subtitle Banner */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/50 backdrop-blur-md border border-emerald-500/30 z-30">
            <span className="w-2 h-2 rounded-full bg-[#00C853] animate-ping" />
            <span className="font-mono text-xs text-white/90 tracking-widest uppercase">
              Welcome to Saimoon's Digital Universe
            </span>
          </div>
        </div>
      )}

      {/* ── MAIN REGULATOR BACKGROUND VIDEO LAYERS (DUAL-BUFFER) ── */}
      {/* Layer A (Regulator 1 is preloaded and ready for alpha matte) */}
      <video
        ref={videoARef}
        src={layerAVideo}
        autoPlay
        loop
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
          activeLayer === 'A' ? 'opacity-90' : 'opacity-0'
        }`}
        style={{ transform: 'translate3d(0, 0, 0)', willChange: 'opacity' }}
      />

      {/* Layer B */}
      <video
        ref={videoBRef}
        src={layerBVideo}
        autoPlay
        loop
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
          activeLayer === 'B' ? 'opacity-90' : 'opacity-0'
        }`}
        style={{ transform: 'translate3d(0, 0, 0)', willChange: 'opacity' }}
      />

      {/* Cinematic Vignette & Ambient Darkness Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(10, 26, 15, 0.4) 0%, rgba(5, 15, 8, 0.75) 100%)',
          backdropFilter: 'blur(0.5px)',
        }}
      />

      {/* Subtle Scanline / Cyber Grid Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0, 200, 83, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 200, 83, 0.2) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
}
