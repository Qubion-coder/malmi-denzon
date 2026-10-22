import React from 'react';
import { motion } from 'motion/react';
import {
  GlassWater,
  HeartHandshake,
  Flame,
  Mic,
  Camera,
  Cake,
  Music,
  Film,
  UtensilsCrossed,
  PartyPopper,
  CarFront,
} from 'lucide-react';

const events = [
  { time: '7.00', period: 'PM', title: 'Guest Arrival & Welcome Drinks', icon: GlassWater },
  { time: '7.10', period: 'PM', title: 'Entrance of the Couple', icon: HeartHandshake },
  { time: '7.20', period: 'PM', title: 'Oil Lamp Lighting', icon: Flame },
  { time: '7.30', period: 'PM', title: 'Welcome Speech', icon: Mic },
  { time: '7.40 – 8.30', period: 'PM', title: 'Family Photography Session', icon: Camera },
  { time: '8.30', period: 'PM', title: 'Wedding Cake Cutting & Toast', icon: Cake },
  { time: '9.00', period: 'PM', title: "Couple's First Dance", icon: Music },
  { time: '9.10 – 9.20', period: 'PM', title: 'Wedding Slideshow', icon: Film },
  { time: '9.30', period: 'PM', title: 'Buffet Dinner', icon: UtensilsCrossed },
  { time: '10.30', period: 'PM', title: 'Open Dance Floor & Celebration', icon: PartyPopper },
  { time: '12.30', period: 'AM', title: 'Departure of the Newlyweds', icon: CarFront },
];

interface TimelineProps {
  event?: string | null;
}

export const Timeline: React.FC<TimelineProps> = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 relative">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[70%] h-[50%] bg-gradient-radial from-brand-plum/10 to-transparent rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="text-center mb-16 sm:mb-24 relative z-10"
      >
        <span className="text-brand-plum uppercase tracking-[0.4em] sm:tracking-[0.5em] text-[10px] sm:text-[11px] font-bold mb-4 block drop-shadow-sm">
          The Evening's Flow
        </span>
        <h2 className="text-5xl sm:text-7xl font-display text-stone-800 tracking-tight drop-shadow-sm leading-tight">
          Reception <span className="italic font-light bg-gradient-to-r from-[#A87D25] via-[#DFBD69] to-[#9A7220] bg-clip-text text-transparent">Timeline</span>
        </h2>
        <div className="flex items-center justify-center gap-3 mt-6">
          <div className="w-12 h-px bg-gradient-to-r from-transparent to-brand-plum/60" />
          <div className="w-1.5 h-1.5 rotate-45 bg-brand-plum" />
          <div className="w-12 h-px bg-gradient-to-l from-transparent to-brand-plum/60" />
        </div>
      </motion.div>

      <div className="relative z-10">
        {/* Golden thread: left on mobile, centred on desktop */}
        <div className="absolute top-0 bottom-0 left-6 md:left-1/2 md:-translate-x-1/2 w-[1.5px] bg-gradient-to-b from-transparent via-brand-plum/50 to-transparent" />

        <div className="space-y-8 sm:space-y-10">
          {events.map((item, index) => {
            const isLeft = index % 2 === 0;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex items-center md:grid md:grid-cols-[1fr_auto_1fr] md:gap-10"
              >
                {/* Desktop: time on the opposite side of the card */}
                <div className={`hidden md:block ${isLeft ? 'md:order-3 text-left' : 'md:order-1 text-right'}`}>
                  <TimeBadge time={item.time} period={item.period} />
                </div>

                {/* Icon node */}
                <div className="relative z-10 shrink-0 md:order-2">
                  <div className="w-12 h-12 rounded-full bg-white border border-brand-plum/40 shadow-[0_6px_20px_rgba(168,125,37,0.25)] flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-brand-plum" />
                  </div>
                  <div className="absolute inset-[-5px] rounded-full border border-brand-plum/15" />
                </div>

                {/* Card */}
                <div className={`ml-5 md:ml-0 flex-1 ${isLeft ? 'md:order-1' : 'md:order-3'}`}>
                  <div className={`group relative bg-white/70 backdrop-blur-md border border-white shadow-[0_15px_35px_rgba(176,137,104,0.12)] rounded-2xl px-5 py-4 sm:px-7 sm:py-5 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(168,125,37,0.2)] ${isLeft ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="md:hidden mb-1.5">
                      <TimeBadge time={item.time} period={item.period} />
                    </div>
                    <h4 className="font-serif text-xl sm:text-2xl text-stone-800 leading-snug group-hover:text-[#A87D25] transition-colors duration-500">
                      {item.title}
                    </h4>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function TimeBadge({ time, period }: { time: string; period: string }) {
  return (
    <span className="whitespace-nowrap font-serif italic font-semibold text-lg sm:text-2xl text-stone-800">
      {time} {period}
    </span>
  );
}
