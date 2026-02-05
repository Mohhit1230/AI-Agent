import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const Preloader = ({ onComplete }) => {
  const preloaderRef = useRef(null);
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const shardsRef = useRef([]);
  const panelsRef = useRef([]);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          const exitTl = gsap.timeline({
            onComplete: () => {
              if (onComplete) onComplete();
            },
          });

          exitTl
            .to(containerRef.current, {
              opacity: 0,
              y: 50,
              scale: 0.9,
              filter: "blur(20px)",
              duration: 0.8,
              ease: "power3.in",
            })
            .to(
              panelsRef.current,
              {
                yPercent: 100,
                duration: 1.2,
                stagger: {
                  amount: -0.5,
                  from: "end",
                },
                ease: "expo.inOut",
              },
              "-=0.4"
            );
        },
      });

      // Initial States
      gsap.set(containerRef.current, { opacity: 0 });
      gsap.set(logoRef.current, { scale: 0, opacity: 0, rotationY: 90 });
      gsap.set(shardsRef.current, {
        scale: 0,
        opacity: 0,
        rotationX: () => gsap.utils.random(-180, 180),
        rotationY: () => gsap.utils.random(-180, 180),
        x: () => gsap.utils.random(-100, 100),
        y: () => gsap.utils.random(-100, 100),
      });

      // 1. Entrance Sequence (Fast & Impactful)
      tl.to(containerRef.current, { opacity: 1, duration: 0.5 })
        .to(shardsRef.current, {
          scale: 1,
          opacity: 0.6,
          x: 0,
          y: 0,
          rotationX: 0,
          rotationY: 0,
          duration: 1.5,
          stagger: 0.05,
          ease: "expo.out",
        })
        .to(
          logoRef.current,
          {
            scale: 1,
            opacity: 1,
            rotationY: 0,
            duration: 1.2,
            ease: "elastic.out(1, 0.75)",
          },
          "-=1"
        );

      // 2. Progress Logic (4-5 Seconds)
      const counter = { val: 0 };
      gsap.to(counter, {
        val: 100,
        duration: 2.5,
        ease: "power1.inOut",
        onUpdate: () => {
          setPercent(Math.floor(counter.val));
        },
      });

      // 3. Continuous Prismatic Animation
      // Shards shifting
      shardsRef.current.forEach((shard, i) => {
        gsap.to(shard, {
          rotationY: i % 2 === 0 ? 360 : -360,
          rotationX: i % 3 === 0 ? 180 : -180,
          duration: 10 + i * 2,
          repeat: -1,
          ease: "none",
        });

        gsap.to(shard, {
          scale: 1.1,
          opacity: 0.8,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.2,
        });
      });

      // Logo Floating & Glint
      gsap.to(logoRef.current, {
        y: -15,
        rotationZ: 2,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Energy Pulse
      gsap.to(".energy-ring", {
        scale: 1.4,
        opacity: 0,
        duration: 2,
        repeat: -1,
        ease: "power2.out",
        stagger: 0.5,
      });
    });

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div
      ref={preloaderRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
    >
      {/* Staircase Panels */}
      <div className="absolute inset-0 flex pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            ref={(el) => (panelsRef.current[i] = el)}
            className="h-[110%] flex-1 bg-black border-x border-white/5"
            style={{ zIndex: 0 }}
          />
        ))}
      </div>

      <div
        ref={containerRef}
        className="relative z-10 flex flex-col items-center justify-center w-full h-full"
      >
        {/* Background (Inside the animated container) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/25 blur-[120px]" />
          <div
            className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#fd4444]/25 blur-[120px]"
            style={{ animationDelay: "2s" }}
          />
          {/* Grain/Noise Texture */}
          <div
            className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* NEW DESIGN: Prismatic Geometric Core */}
        <div
          className="relative w-[400px] h-[400px] flex items-center justify-center"
          style={{ perspective: "1200px" }}
        >
          {/* Energy Pulsing Rings */}
          {[...Array(3)].map((_, i) => (
            <div
              key={`ring-${i}`}
              className="energy-ring absolute w-64 h-64 border-2 border-cyan-500/30 rounded-full"
              style={{ boxShadow: "0 0 30px rgba(6, 182, 212, 0.2)" }}
            />
          ))}

          {/* Floating Glass Shards (Prism Layers) */}
          <div
            className="absolute inset-0"
            style={{ transformStyle: "preserve-3d" }}
          >
            {[...Array(4)].map((_, i) => (
              <div
                key={`shard-${i}`}
                ref={(el) => (shardsRef.current[i] = el)}
                className="absolute inset-0 flex items-center justify-center p-4 py-1.5"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  className="w-80 h-80 border border-white/10 rounded-[4rem]"
                  style={{
                    background:
                      i % 2 === 0
                        ? "linear-gradient(135deg, rgba(6, 182, 212, 0.05), transparent)"
                        : "linear-gradient(225deg, rgba(253, 68, 68, 0.05), transparent)",
                    backdropFilter: "blur(4px)",
                    transform: `translateZ(${i * 15}px) rotate(${i * 45}deg)`,
                    boxShadow: i === 7 ? "0 0 50px rgba(0,0,0,0.5)" : "none",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Central Prismatic Logo container */}
          <div
            ref={logoRef}
            className="relative z-10 w-52 h-52 group"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Glow Aura */}
            <div className="absolute inset-[-20px] bg-gradient-to-br from-cyan-500/20 to-[#fd4444]/20 blur-[40px] rounded-full animate-pulse" />

            {/* The "Extrude" Prism Layers */}
            {[...Array(4)].map((_, i) => (
              <div
                key={`extrude-${i}`}
                className="absolute inset-0 rounded-[3rem] border border-white/5 bg-white/5 backdrop-blur-xl"
                style={{
                  transform: `translateZ(${(i + 1) * 10}px)`,
                  opacity: 0.3,
                }}
              />
            ))}

            {/* Front Plate with Logo */}
            <div
              className="relative w-full h-full bg-[#0a0a0a]/80 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-10 flex items-center justify-center overflow-hidden shadow-2xl"
              style={{ transform: "translateZ(45px)" }}
            >
              {/* Dynamic light glint */}
              <div className="absolute top-0 left-0 w-full h-[300%] bg-gradient-to-b from-white/0 via-white/10 to-white/0 rotate-[35deg] translate-y-[-100%] animate-[glint_4s_linear_infinite]" />

              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-contain filter drop-shadow(0 15px 30px rgba(0,0,0,0.5))"
              />
            </div>

            {/* Corner Bracket Accents (Electric Cyan & Red) */}
            <div
              className="absolute -top-4 -left-4 w-12 h-12 border-t-4 border-l-4 border-cyan-400 rounded-tl-2xl shadow-[0_0_15px_rgba(34,211,238,0.5)]"
              style={{ transform: "translateZ(60px)" }}
            />
            <div
              className="absolute -bottom-4 -right-4 w-12 h-12 border-b-4 border-r-4 border-[#fd4444] rounded-br-2xl shadow-[0_0_15px_rgba(253,68,68,0.5)]"
              style={{ transform: "translateZ(60px)" }}
            />
          </div>
        </div>

        {/* Progress Display */}
        <div className="mt-16 text-center">
          <div className="relative flex flex-col items-center">
            <div className="flex items-end gap-2 mb-4">
              <span className="text-8xl font-black italic tracking-tighter text-white/95 tabular-nums">
                {percent}
              </span>
              <span className="text-2xl font-bold text-[#fd4444] mb-3">%</span>
            </div>

            {/* Elegant Geometric Progress Bar */}
            <div className="relative w-72 h-[3px] bg-white/5 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-[#fd4444] to-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.6)] transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>

            {/* Status Badge */}
            <div className="mt-6 px-4 py-1.5 border border-cyan-500/30 rounded-full bg-cyan-950/20 backdrop-blur-md">
              <p className="text-[10px] tracking-[0.4em] text-cyan-400 font-bold uppercase">
                {percent < 100 ? "Synchronizing_Core" : "Access_Granted"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
@keyframes glint {
    0% { transform: translateY(-100%) rotate(35deg); }
    100% { transform: translateY(100%) rotate(35deg); }
}
`,
        }}
      />
    </div>
  );
};

export default Preloader;
