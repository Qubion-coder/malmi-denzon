import { useState, useRef, useEffect, useCallback } from 'react';
import { Toaster } from 'sonner';

import { InvitationContent } from './components/InvitationContent';
import { Admin } from './components/Admin';
import { IntroScreen } from './components/IntroScreen';
import { parseInvite } from './invite';

const isAdminRoute = () => window.location.pathname === '/admin';

export default function App() {
  const [showInvitation, setShowInvitation] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const invite = parseInvite();
  const eventLabel = invite.event === 'church'
    ? 'our Wedding Ceremony'
    : invite.event === 'hotel'
      ? 'our Wedding Reception'
      : 'Our Wedding Celebration';

  // Count down to the first event this guest is invited to.
  const weddingDate = new Date(invite.event === 'hotel' ? '2026-12-10T19:00:00' : '2026-12-10T11:00:00');

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/Westlife -  Beautiful in white (Lyrics)_256k.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
      audioRef.current.preload = 'none';
    }
    return audioRef.current;
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMusic = useCallback(() => {
    const audio = ensureAudio();
    if (isMusicPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
    setIsMusicPlaying((playing) => !playing);
  }, [ensureAudio, isMusicPlaying]);

  const handleIntroMusicStart = useCallback(() => {
    setIsMusicPlaying(true);
    const audio = ensureAudio();
    audio.play().catch(console.error);
  }, [ensureAudio]);

  if (isAdminRoute()) {
    return (
      <>
        <Toaster position="top-center" />
        <Admin />
      </>
    );
  }

  return (
    <>
      <Toaster position="top-center" />

      <InvitationContent
        active={showInvitation}
        invite={invite}
        eventLabel={eventLabel}
        weddingDate={weddingDate}
        isMusicPlaying={isMusicPlaying}
        onToggleMusic={toggleMusic}
      />

      {!showInvitation && (
        <IntroScreen
          onComplete={() => {
            window.scrollTo(0, 0);
            setShowInvitation(true);
          }}
          onMusicStart={handleIntroMusicStart}
        />
      )}

    </>
  );
}
