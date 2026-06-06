import { useEffect, useRef } from 'react';
import './Prism.css';

const Prism = ({
  height = 3.5,
  baseWidth = 5.5,
  animationType = 'rotate',
  glow = 1,
  offset = { x: 0, y: 0 },
  noise = 0.5,
  transparent = true,
  scale = 3.6,
  hueShift = 0,
  colorFrequency = 1,
  hoverStrength = 2,
  inertia = 0.05,
  bloom = 1,
  suspendWhenOffscreen = false,
  timeScale = 0.5,
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const H      = Math.max(0.001, height);
    const BW     = Math.max(0.001, baseWidth);
    const BASE_HALF = BW * 0.5;
    const GLOW   = Math.max(0, glow);
    const NOISE  = Math.max(0, noise);
    const offX   = offset?.x ?? 0;
    const offY   = offset?.y ?? 0;
    const SAT    = transparent ? 1.5 : 1;
    const SCALE  = Math.max(0.001, scale);
    const HUE    = hueShift || 0;
    const CFREQ  = Math.max(0, colorFrequency || 1);
    const BLOOM  = Math.max(0, bloom || 1);
    const TS     = Math.max(0, timeScale || 1);
    const HOVSTR = Math.max(0, hoverStrength || 1);
    const INERT  = Math.max(0, Math.min(1, inertia || 0.12));
    const dpr    = Math.min(2, window.devicePixelRatio || 1);

    // ── Canvas ──────────────────────────────────────────────────────────────
    const canvas = document.createElement('canvas');
    Object.assign(canvas.style, {
      position: 'absolute', inset: '0',
      width: '100%', height: '100%', display: 'block',
    });
    container.appendChild(canvas);

    const gl = canvas.getContext('webgl', { alpha: transparent, antialias: false, premultipliedAlpha: false });
    if (!gl) { console.error('WebGL not supported'); return; }

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    if (!transparent) gl.disable(gl.BLEND);

    // ── Shaders ─────────────────────────────────────────────────────────────
    const vert = `
      attribute vec2 position;
      void main() { gl_Position = vec4(position, 0.0, 1.0); }
    `;

    const frag = `
      precision highp float;
      uniform vec2  iResolution;
      uniform float iTime;
      uniform mat3  uRot;
      uniform int   uUseBaseWobble;
      uniform float uGlow, uNoise, uSaturation, uHueShift;
      uniform float uColorFreq, uBloom, uCenterShift;
      uniform float uInvBaseHalf, uInvHeight, uMinAxis, uPxScale, uTimeScale;
      uniform vec2  uOffsetPx;

      vec4 tanh4(vec4 x){ vec4 e=exp(2.0*x); return (e-1.0)/(e+1.0); }
      float rand(vec2 c){ return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453123); }

      float sdOcta(vec3 p){
        vec3 q=vec3(abs(p.x)*uInvBaseHalf, abs(p.y)*uInvHeight, abs(p.z)*uInvBaseHalf);
        return (q.x+q.y+q.z-1.0)*uMinAxis*0.5773502691896258;
      }
      float sdPyr(vec3 p){ return max(sdOcta(p), -p.y); }

      mat3 hueRot(float a){
        float c=cos(a), s=sin(a);
        return mat3(0.299,0.587,0.114,0.299,0.587,0.114,0.299,0.587,0.114)
              +mat3(0.701,-0.587,-0.114,-0.299,0.413,-0.114,-0.300,-0.588,0.886)*c
              +mat3(0.168,-0.331,0.500,0.328,0.035,-0.500,-0.497,0.296,0.201)*s;
      }

      void main(){
        vec2 f=(gl_FragCoord.xy - 0.5*iResolution.xy - uOffsetPx)*uPxScale;
        float z=5.0, d=0.0;
        vec3 p; vec4 o=vec4(0.0);
        mat2 wob=mat2(1.0);
        if(uUseBaseWobble==1){
          float t=iTime*uTimeScale;
          wob=mat2(cos(t),cos(t+33.0),cos(t+11.0),cos(t));
        }
        for(int i=0;i<100;i++){
          p=vec3(f,z); p.xz=p.xz*wob; p=uRot*p;
          vec3 q=p; q.y+=uCenterShift;
          d=0.1+0.2*abs(sdPyr(q)); z-=d;
          o+=(sin((p.y+z)*uColorFreq+vec4(0,1,2,3))+1.0)/d;
        }
        o=tanh4(o*o*(uGlow*uBloom)/1e5);
        vec3 col=o.rgb;
        col+=(rand(gl_FragCoord.xy+vec2(iTime))-0.5)*uNoise;
        col=clamp(col,0.0,1.0);
        float L=dot(col,vec3(0.2126,0.7152,0.0722));
        col=clamp(mix(vec3(L),col,uSaturation),0.0,1.0);
        if(abs(uHueShift)>0.0001) col=clamp(hueRot(uHueShift)*col,0.0,1.0);
        gl_FragColor=vec4(col, transparent ? o.a : 1.0);
      }
    `.replace('transparent ?', transparent ? 'true ?' : 'false ?');

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('Shader error:', gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };

    const vs = compile(gl.VERTEX_SHADER, vert);
    const fs = compile(gl.FRAGMENT_SHADER, frag);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Link error:', gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    // ── Geometry: fullscreen triangle ────────────────────────────────────────
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // ── Uniform locations ────────────────────────────────────────────────────
    const U = {};
    ['iResolution','iTime','uRot','uUseBaseWobble','uGlow','uOffsetPx',
     'uNoise','uSaturation','uHueShift','uColorFreq','uBloom','uCenterShift',
     'uInvBaseHalf','uInvHeight','uMinAxis','uPxScale','uTimeScale']
      .forEach(n => { U[n] = gl.getUniformLocation(prog, n); });

    // ── Static uniforms ──────────────────────────────────────────────────────
    gl.uniform1i(U.uUseBaseWobble, animationType === 'hover' || animationType === '3drotate' ? 0 : 1);
    gl.uniform1f(U.uGlow,         GLOW);
    gl.uniform1f(U.uNoise,        NOISE);
    gl.uniform1f(U.uSaturation,   SAT);
    gl.uniform1f(U.uHueShift,     HUE);
    gl.uniform1f(U.uColorFreq,    CFREQ);
    gl.uniform1f(U.uBloom,        BLOOM);
    gl.uniform1f(U.uCenterShift,  H * 0.25);
    gl.uniform1f(U.uInvBaseHalf,  1 / BASE_HALF);
    gl.uniform1f(U.uInvHeight,    1 / H);
    gl.uniform1f(U.uMinAxis,      Math.min(BASE_HALF, H));
    gl.uniform1f(U.uTimeScale,    TS);
    gl.uniformMatrix3fv(U.uRot, false, new Float32Array([1,0,0,0,1,0,0,0,1]));

    // ── Resize ───────────────────────────────────────────────────────────────
    const resize = () => {
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      canvas.width  = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(U.iResolution, canvas.width, canvas.height);
      gl.uniform2f(U.uOffsetPx,   offX * dpr,  offY * dpr);
      gl.uniform1f(U.uPxScale,    1 / (canvas.height * 0.1 * SCALE));
    };
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    // ── Rotation helpers ─────────────────────────────────────────────────────
    const rotBuf = new Float32Array(9);
    const euler = (yaw, pitch, roll) => {
      const cy=Math.cos(yaw),sy=Math.sin(yaw);
      const cx=Math.cos(pitch),sx=Math.sin(pitch);
      const cz=Math.cos(roll),sz=Math.sin(roll);
      rotBuf[0]=cy*cz+sy*sx*sz; rotBuf[1]=cx*sz; rotBuf[2]=-sy*cz+cy*sx*sz;
      rotBuf[3]=-cy*sz+sy*sx*cz;rotBuf[4]=cx*cz; rotBuf[5]=sy*sz+cy*sx*cz;
      rotBuf[6]=sy*cx;           rotBuf[7]=-sx;   rotBuf[8]=cy*cx;
    };

    // ── Hover pointer ────────────────────────────────────────────────────────
    let yaw=0,pitch=0,roll=0,tYaw=0,tPitch=0;
    const lerp = (a,b,t) => a+(b-a)*t;
    const ptr  = {x:0,y:0,in:true};
    const onMove = e => {
      ptr.x=Math.max(-1,Math.min(1,(e.clientX-window.innerWidth*0.5)/(window.innerWidth*0.5)));
      ptr.y=Math.max(-1,Math.min(1,(e.clientY-window.innerHeight*0.5)/(window.innerHeight*0.5)));
      ptr.in=true;
    };

    const rnd=()=>Math.random();
    const wX=(0.3+rnd()*0.6), wY=(0.2+rnd()*0.7), wZ=(0.1+rnd()*0.5);
    const phX=rnd()*Math.PI*2, phZ=rnd()*Math.PI*2;

    // ── Render loop ──────────────────────────────────────────────────────────
    let raf = 0;
    const t0 = performance.now();

    const render = t => {
      const time = (t - t0) * 0.001;
      gl.uniform1f(U.iTime, time);

      if (animationType === 'hover') {
        tYaw   = (ptr.in ? -ptr.x : 0) * 0.6 * HOVSTR;
        tPitch = (ptr.in ?  ptr.y : 0) * 0.6 * HOVSTR;
        yaw  =lerp(yaw,  tYaw,  INERT);
        pitch=lerp(pitch,tPitch,INERT);
        roll =lerp(roll, 0,     0.1);
        euler(yaw,pitch,roll);
        gl.uniformMatrix3fv(U.uRot, false, rotBuf);
      } else if (animationType === '3drotate') {
        const ts=time*TS;
        euler(ts*wY, Math.sin(ts*wX+phX)*0.6, Math.sin(ts*wZ+phZ)*0.5);
        gl.uniformMatrix3fv(U.uRot, false, rotBuf);
      }
      // 'rotate' uses identity + wobble inside shader

      if (!transparent) gl.clearColor(0,0,0,1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(render);
    };

    if (animationType === 'hover') {
      window.addEventListener('pointermove', onMove, { passive: true });
    }

    if (suspendWhenOffscreen) {
      const io = new IntersectionObserver(es => {
        if (es.some(e => e.isIntersecting)) { if (!raf) raf = requestAnimationFrame(render); }
        else { cancelAnimationFrame(raf); raf = 0; }
      });
      io.observe(container);
      container.__prismIO = io;
    }
    raf = requestAnimationFrame(render);

    // ── Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (animationType === 'hover') window.removeEventListener('pointermove', onMove);
      if (suspendWhenOffscreen && container.__prismIO) {
        container.__prismIO.disconnect();
        delete container.__prismIO;
      }
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (canvas.parentElement === container) container.removeChild(canvas);
    };
  }, [
    height, baseWidth, animationType, glow, noise,
    offset?.x, offset?.y, scale, transparent, hueShift,
    colorFrequency, timeScale, hoverStrength, inertia,
    bloom, suspendWhenOffscreen,
  ]);

  return <div className="prism-container" ref={containerRef} />;
};

export default Prism;
