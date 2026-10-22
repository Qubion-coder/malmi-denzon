import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Volume2, VolumeX } from 'lucide-react';

interface IntroScreenProps {
  onComplete: () => void;
  onMusicStart?: () => void;
}

export function IntroScreen({ onComplete, onMusicStart }: IntroScreenProps) {
  const [opening, setOpening] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleOpen = () => {
    if (opening) return;
    setOpening(true);
    onMusicStart?.();
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.play().catch((error) => {
      console.error('Could not play the intro video:', error);
      setOpening(false);
    });
  };

  return (
    <main className="fixed inset-0 z-[100] overflow-hidden bg-[#21191a] text-white">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover opacity-75"
        src="/gemini_generated_video_8a3962d0.mp4"
        muted={muted}
        playsInline
        preload="auto"
        onEnded={onComplete}
        aria-label="Romantic wedding introduction"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/65" />

      <motion.div
        animate={{ opacity: opening ? 0 : 1 }}
        transition={{ duration: 0.25 }}
        className="relative z-30 flex min-h-full -translate-y-16 flex-col items-center justify-center px-6 text-center sm:translate-y-0"
        aria-hidden={opening}
      >
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-10 rounded-full border border-white/40 bg-black/20 px-6 py-2 backdrop-blur-md"
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.45em] text-white/90">
            An invitation to celebrate love
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.15 }}
        >
          <p className="mb-2 font-serif text-sm italic text-[#302a28]/85 sm:text-base">Together with their families</p>
          <h1 className="font-names text-4xl leading-none text-[#302a28] drop-shadow-lg sm:text-6xl">
            Malmi <span className="mx-1 text-3xl text-[#5b4a43]/90 sm:text-5xl">&amp;</span> Denson
          </h1>
          <p className="mt-4 font-serif text-sm tracking-[0.15em] text-[#302a28]/90 sm:text-base">10 DECEMBER 2026</p>
        </motion.div>

        <motion.button
          type="button"
          onClick={handleOpen}
          disabled={opening}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 inline-flex items-center gap-3 rounded-full border border-[#f6dfb0]/70 bg-black/30 px-8 py-4 text-xs font-bold uppercase tracking-[0.3em] text-[#f6dfb0] shadow-2xl backdrop-blur-md transition hover:scale-105 hover:bg-black/45 disabled:cursor-wait"
        >
          <Heart className="h-4 w-4 fill-current" />
          View Invitation
        </motion.button>
      </motion.div>

      <button
        type="button"
        onClick={() => setMuted((value) => !value)}
        className="absolute right-6 top-6 z-30 rounded-full border border-white/35 bg-black/20 p-3 text-white backdrop-blur-md transition hover:bg-black/40"
        aria-label={muted ? 'Unmute intro video' : 'Mute intro video'}
      >
        {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>

      <motion.img
        src="/door-left.webp"
        alt=""
        aria-hidden="true"
        initial={false}
        animate={{ x: opening ? '-100%' : 0, scale: 1.35 }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        className="pointer-events-none absolute inset-y-0 left-0 z-20 h-[100dvh] w-1/2 origin-right object-cover object-center"
      />
      <motion.img
        src="/door-right.webp"
        alt=""
        aria-hidden="true"
        initial={false}
        animate={{ x: opening ? '100%' : 0, scale: 1.35 }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        className="pointer-events-none absolute inset-y-0 right-0 z-20 h-[100dvh] w-1/2 origin-left object-cover object-center"
      />
    </main>
  );
}
