import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Loader2, Heart, Sparkles, Check, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { SCRIPT_URL } from '../config';
import type { Invite, InviteEvent } from '../invite';

interface RSVPFormProps {
  invite: Invite;
  eventName?: string;
}

const EVENT_CHOICES = [
  { value: 'both', label: 'Church Ceremony & Hotel Reception' },
  { value: 'church', label: 'Church Ceremony only' },
  { value: 'hotel', label: 'Hotel Reception only' },
];

type MemberChoice = 'both' | 'church' | 'hotel' | 'no';

const MEMBER_CHOICES: Record<InviteEvent, { value: MemberChoice; label: string }[]> = {
  both: [
    { value: 'both', label: 'Both' },
    { value: 'church', label: 'Church only' },
    { value: 'hotel', label: 'Reception only' },
    { value: 'no', label: 'Not coming' },
  ],
  church: [
    { value: 'church', label: 'Attending' },
    { value: 'no', label: 'Not coming' },
  ],
  hotel: [
    { value: 'hotel', label: 'Attending' },
    { value: 'no', label: 'Not coming' },
  ],
};

const SHEET_LABELS: Record<MemberChoice, string> = {
  both: 'Church & Reception',
  church: 'Church only',
  hotel: 'Reception only',
  no: 'Not coming',
};

const sectionLabelClass = 'block text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500 mb-3 ml-2';

const ChoiceButton: React.FC<{ selected: boolean; onClick: () => void; children: React.ReactNode }> = ({ selected, onClick, children }) => {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`w-full flex items-center gap-4 text-left px-5 py-3.5 rounded-2xl border transition-all duration-300 font-serif text-lg ${
        selected
          ? 'bg-white border-brand-plum/60 shadow-[0_8px_20px_rgba(168,125,37,0.15)] text-stone-800'
          : 'bg-white/50 border-stone-200/60 text-stone-500 hover:bg-white/80'
      }`}
    >
      <span
        className={`shrink-0 w-6 h-6 flex items-center justify-center border-[1.5px] transition-all rounded-full ${
          selected ? 'bg-gradient-to-br from-[#A87D25] via-[#DFBD69] to-[#9A7220] border-transparent' : 'border-stone-300'
        }`}
      >
        {selected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
      </span>
      <span className="italic">{children}</span>
    </button>
  );
};

export const RSVPForm: React.FC<RSVPFormProps> = ({ invite, eventName = 'the celebration' }) => {
  const inviteeName = invite.displayName;
  const eventParam = invite.event;
  const { members } = invite;
  // Couples and families answer per person; each picks which event(s) they will attend.
  const hasMembers = invite.type !== 'single' && members.length > 0;
  // No member list (general link, or old family links) -> pick a head count instead.
  const useHeadCount = !hasMembers && (!inviteeName || invite.type !== 'single');

  const [formData, setFormData] = useState({
    fullName: inviteeName,
    guests: '1',
    dietaryNotes: '',
  });
  const [response, setResponse] = useState<'yes' | 'no'>('yes');
  const [memberChoices, setMemberChoices] = useState<Record<string, MemberChoice>>(
    () => Object.fromEntries(members.map((m) => [m, eventParam])),
  );
  const [eventsAttending, setEventsAttending] = useState(eventParam);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (inviteeName) {
      setFormData(prev => ({ ...prev, fullName: inviteeName }));
    }
  }, [inviteeName]);

  const attendees = hasMembers ? members.filter((m) => memberChoices[m] !== 'no') : null;
  const isAttending = attendees ? attendees.length > 0 : useHeadCount ? formData.guests !== '0' : response === 'yes';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const guestCount = attendees ? attendees.length : useHeadCount ? Number(formData.guests) : isAttending ? 1 : 0;
      let eventsLabel = isAttending ? EVENT_CHOICES.find((c) => c.value === eventsAttending)?.label ?? '' : '-';
      if (attendees) {
        const church = attendees.filter((m) => memberChoices[m] !== 'hotel').length;
        const hotel = attendees.filter((m) => memberChoices[m] !== 'church').length;
        eventsLabel = isAttending ? `Church: ${church} · Reception: ${hotel}` : '-';
      }

      const payload = new FormData();
      payload.append('sheet', 'RSVP');
      payload.append('fullName', formData.fullName);
      payload.append('guests', String(guestCount));
      payload.append('dietaryNotes', formData.dietaryNotes);
      payload.append('event', eventParam);
      payload.append('attending', isAttending ? 'Yes' : 'No');
      payload.append('attendees', hasMembers ? members.map((m) => `${m} (${SHEET_LABELS[memberChoices[m]]})`).join(', ') : '');
      payload.append('eventsAttending', eventsLabel);
      payload.append('inviteType', invite.type);

      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: payload,
      });

      setStatus('success');
      toast.success('Your RSVP has been warmly received!');
    } catch (error) {
      console.error('Error sending RSVP: ', error);
      setStatus('error');
      toast.error('Could not submit RSVP. Please try again.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 relative py-10">
      {/* Premium ambient backdrop & glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-radial from-brand-plum/15 to-transparent rounded-full blur-[100px] pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="glass p-10 sm:p-14 lg:p-16 rounded-[3rem] border border-white/40 shadow-[0_30px_60px_rgba(176,137,104,0.1)] relative overflow-hidden bg-white/60 backdrop-blur-3xl lg:flex items-center gap-16"
      >
        {/* Soft top border line */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-rose via-brand-plum/80 to-brand-rose" />

        {/* Left Side: Elegant Text */}
        <div className="lg:w-1/2 lg:pr-10 mb-12 lg:mb-0 relative text-center lg:text-left">
          <Sparkles className="absolute -top-6 -left-6 w-12 h-12 text-brand-plum/30 animate-pulse" />

          <div className="inline-flex items-center justify-center lg:justify-start gap-4 mb-6">
            <span className="text-brand-plum uppercase tracking-[0.5em] text-[10px] sm:text-[11px] font-bold drop-shadow-sm">
              Kindly Respond
            </span>
            <div className="hidden lg:block w-16 h-[1px] bg-gradient-to-r from-brand-plum/60 to-transparent" />
          </div>

          <h2 className="text-5xl sm:text-6xl font-display text-stone-800 tracking-tight leading-[1.1] mb-6 drop-shadow-sm">
            Reserve <span className="italic font-light bg-gradient-to-r from-[#A87D25] via-[#DFBD69] to-[#9A7220] bg-clip-text text-transparent">Your</span> Seat
          </h2>

          <p className="text-stone-500/90 font-serif text-lg leading-relaxed mb-6">
            {inviteeName
              ? `Dear ${inviteeName}, your presence at ${eventName} means the world to us. Please kindly let us know if you will be able to join our celebration.`
              : `Your presence means the world to us. Please kindly let us know if you will be able to join our celebration.`
            }
          </p>
          <div className="mt-6 mb-8 text-sm font-sans tracking-[0.2em] uppercase font-semibold text-brand-plum drop-shadow-sm leading-loose">
            RSVP through the form below
            <span className="block mt-2 normal-case tracking-[0.1em] text-base sm:text-lg font-serif italic text-stone-700">
              Kindly respond on or before{' '}
              <span className="not-italic font-bold bg-gradient-to-r from-[#A87D25] via-[#DFBD69] to-[#9A7220] bg-clip-text text-transparent">15th November 2026</span>
            </span>
          </div>
          <div className="w-12 h-[1px] bg-brand-lavender/50 mx-auto lg:mx-0" />
        </div>

        {/* Right Side: Flowing Form */}
        <div className="lg:w-1/2 relative z-10">
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-16 px-8 bg-white/70 rounded-[2rem] border border-white shadow-xl"
              >
                <div className="w-24 h-24 bg-green-50/80 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-green-100">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <h3 className="text-4xl font-display text-stone-800 mb-4 tracking-tight drop-shadow-sm">With Gratitude</h3>
                <p className="text-stone-500/90 leading-relaxed font-serif text-lg mb-8">
                  {isAttending
                    ? 'Your response has been warmly received. We cannot wait to celebrate with you!'
                    : 'Your response has been received. You will be missed, and we thank you for your love and blessings.'}
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="px-6 py-2 rounded-full border border-brand-lavender/30 text-brand-plum font-sans text-[10px] tracking-[0.2em] uppercase hover:bg-brand-lavender/10 transition-all duration-300 shadow-sm"
                >
                  Update Response
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6 bg-white/40 p-8 sm:p-10 rounded-[2.5rem] border border-white shadow-[0_15px_30px_rgba(0,0,0,0.05)]"
              >
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500 mb-3 ml-2">Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="E.g., John & Jane Doe"
                    className="w-full bg-white/80 px-6 py-4 rounded-full border border-stone-200/60 focus:ring-2 focus:ring-brand-lavender/30 focus:border-brand-plum/40 outline-none transition-all duration-300 font-serif italic text-lg shadow-inner placeholder:text-stone-300"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>

                {hasMembers && (
                  <div>
                    <label className={sectionLabelClass}>
                      {eventParam === 'both' ? 'Who will attend & which events?' : 'Who will be attending?'}
                    </label>
                    <div className="space-y-3">
                      {members.map((member) => (
                        <div
                          key={member}
                          className={`relative bg-white/70 border rounded-2xl px-4 py-3.5 shadow-sm transition-colors duration-300 ${
                            memberChoices[member] === 'no' ? 'border-stone-200/60' : 'border-brand-plum/40'
                          }`}
                        >
                          <p className="flex items-center gap-2 font-serif italic text-lg text-stone-800 mb-2.5 ml-1">
                            <Heart
                              className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                                memberChoices[member] === 'no' ? 'text-stone-300' : 'text-brand-plum fill-brand-plum/40'
                              }`}
                            />
                            {member}
                          </p>

                          {/* Mobile: an elegant dropdown */}
                          <div className="relative sm:hidden">
                            <select
                              aria-label={`Attendance for ${member}`}
                              value={memberChoices[member]}
                              onChange={(e) => setMemberChoices((prev) => ({ ...prev, [member]: e.target.value as MemberChoice }))}
                              className={`w-full appearance-none pl-5 pr-11 py-3 rounded-full border font-serif italic text-base outline-none transition-all duration-300 focus:ring-2 focus:ring-brand-lavender/30 ${
                                memberChoices[member] === 'no'
                                  ? 'bg-stone-50 border-stone-200 text-stone-500'
                                  : 'bg-gradient-to-r from-brand-rose/70 via-white to-brand-rose/70 border-brand-plum/40 text-stone-800'
                              }`}
                            >
                              {MEMBER_CHOICES[eventParam].map((choice) => (
                                <option key={choice.value} value={choice.value}>
                                  {eventParam === 'both' ? SHEET_LABELS[choice.value] : choice.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-plum pointer-events-none" />
                          </div>

                          {/* Larger screens: tappable pills */}
                          <div role="radiogroup" aria-label={member} className="hidden sm:flex flex-wrap gap-2">
                            {MEMBER_CHOICES[eventParam].map((choice) => {
                              const selected = memberChoices[member] === choice.value;
                              return (
                                <button
                                  key={choice.value}
                                  type="button"
                                  role="radio"
                                  aria-checked={selected}
                                  onClick={() => setMemberChoices((prev) => ({ ...prev, [member]: choice.value }))}
                                  className={`px-3.5 py-2 rounded-full text-[11px] font-sans font-bold uppercase tracking-[0.1em] border transition-all duration-300 ${
                                    selected
                                      ? choice.value === 'no'
                                        ? 'bg-stone-700 border-stone-700 text-white'
                                        : 'bg-gradient-to-r from-[#A87D25] via-[#DFBD69] to-[#9A7220] border-transparent text-white shadow-[0_4px_12px_rgba(168,125,37,0.3)]'
                                      : 'bg-white border-stone-200 text-stone-500 hover:border-brand-plum/50'
                                  }`}
                                >
                                  {choice.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!hasMembers && !useHeadCount && (
                  <div role="radiogroup">
                    <label className={sectionLabelClass}>Will you be attending?</label>
                    <div className="space-y-2.5">
                      <ChoiceButton selected={response === 'yes'} onClick={() => setResponse('yes')}>Joyfully accept</ChoiceButton>
                      <ChoiceButton selected={response === 'no'} onClick={() => setResponse('no')}>Regretfully decline</ChoiceButton>
                    </div>
                  </div>
                )}

                {useHeadCount && (
                  <div>
                    <label className={sectionLabelClass}>Number of Guests</label>
                    <div className="relative group">
                      <select
                        className="w-full bg-white/80 px-6 py-4 rounded-full border border-stone-200/60 focus:ring-2 focus:ring-brand-lavender/30 focus:border-brand-plum/40 outline-none transition-all duration-300 appearance-none font-serif italic text-lg shadow-inner text-stone-700 cursor-pointer"
                        value={formData.guests}
                        onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                      >
                        <option value="1">Just Me (1 Guest)</option>
                        <option value="2">We are coming! (2 Guests)</option>
                        <option value="3">3 Guests</option>
                        <option value="4">4 Guests</option>
                        <option value="0">Regretfully, unable to attend</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-brand-plum transition-transform duration-300 group-hover:scale-110">
                        <Heart className="w-5 h-5 fill-brand-lavender/30 drop-shadow-sm" />
                      </div>
                    </div>
                  </div>
                )}

                {eventParam === 'both' && isAttending && !hasMembers && (
                  <div role="radiogroup">
                    <label className={sectionLabelClass}>Which will you attend?</label>
                    <div className="space-y-2.5">
                      {EVENT_CHOICES.map((choice) => (
                        <ChoiceButton
                          key={choice.value}
                          selected={eventsAttending === choice.value}
                          onClick={() => setEventsAttending(choice.value as typeof eventsAttending)}
                        >
                          {choice.label}
                        </ChoiceButton>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500 mb-3 ml-2">Dietary Notes (Optional)</label>
                  <textarea
                    placeholder="We'd love to know if you have any allergies..."
                    className="w-full bg-white/80 px-6 py-4 rounded-[2rem] border border-stone-200/60 focus:ring-2 focus:ring-brand-lavender/30 focus:border-brand-plum/40 outline-none transition-all duration-300 h-28 resize-none font-serif italic text-lg shadow-inner placeholder:text-stone-300"
                    value={formData.dietaryNotes}
                    onChange={(e) => setFormData({ ...formData, dietaryNotes: e.target.value })}
                  />
                </div>

                <div className="pt-4">
                  <button
                    disabled={status === 'loading'}
                    type="submit"
                    className="w-full bg-stone-900 text-[#F7F3EB] py-5 rounded-full font-sans tracking-[0.3em] font-bold text-[11px] uppercase hover:bg-stone-950 border border-brand-plum/40 transition-all duration-300 shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.25)] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70"
                  >
                    {status === 'loading' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      isAttending ? 'Confirm Attendance' : 'Send Our Regrets'
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
