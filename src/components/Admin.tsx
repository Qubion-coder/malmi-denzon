import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, Sparkles, User, Users, Link as LinkIcon, ArrowLeft, Plus, X, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { buildInvite, EVENT_LABELS, type InviteType, type InviteEvent } from '../invite';

const labelClass = 'block text-xs uppercase tracking-[0.2em] font-bold text-stone-500 mb-3 flex items-center gap-2 ml-1';
const inputClass = 'w-full bg-white px-6 py-4 rounded-full border border-stone-200/80 focus:ring-2 focus:ring-brand-lavender/30 focus:border-brand-plum/40 outline-none transition-all font-serif italic text-lg shadow-inner text-stone-800 placeholder:text-stone-400';

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="grid gap-2 p-1.5 bg-stone-100/80 rounded-[1.5rem] border border-stone-200/60" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-3 rounded-[1.2rem] text-[11px] sm:text-xs font-bold uppercase tracking-[0.12em] transition-all ${
            value === opt.value ? 'bg-white text-brand-plum shadow-md border border-brand-plum/30' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export const Admin: React.FC = () => {
  const [inviteType, setInviteType] = useState<InviteType>('single');
  const [guestTitle, setGuestTitle] = useState('Mr.');
  const [coupleMode, setCoupleMode] = useState<'mrmrs' | 'names'>('mrmrs');
  const [guestName, setGuestName] = useState('');
  const [partners, setPartners] = useState(['', '']);
  const [familyMembers, setFamilyMembers] = useState<string[]>(['', '']);
  const [inviteEvent, setInviteEvent] = useState<InviteEvent>('both');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [copied, setCopied] = useState<'link' | 'message' | null>(null);

  const updateListItem = (list: string[], setList: (l: string[]) => void, index: number, value: string) =>
    setList(list.map((item, i) => (i === index ? value : item)));

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();

    const isTwoNames = inviteType === 'couple' && coupleMode === 'names';
    const members = inviteType === 'family' ? familyMembers : isTwoNames ? partners : [];
    const name = isTwoNames ? partners.map((p) => p.trim()).join(' & ') : guestName.trim();

    if (isTwoNames ? partners.some((p) => !p.trim()) : !name) {
      toast.error(isTwoNames ? 'Please enter both names' : 'Please enter a guest name');
      return;
    }
    if (inviteType === 'family' && !familyMembers.some((m) => m.trim())) {
      toast.error('Please add at least one family member');
      return;
    }

    const prefix = inviteType === 'single' ? guestTitle : inviteType === 'couple' && coupleMode === 'mrmrs' ? 'Mr. & Mrs.' : '';
    const invite = buildInvite({ type: inviteType, prefix, name, members, event: inviteEvent });
    setGeneratedUrl(invite.url);
    setDisplayName(invite.displayName);
    setCopied(null);
    toast.success('Invitation link generated successfully!');
  };

  const handleCopy = (value: string, type: 'link' | 'message') => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(type);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(null), 3000);
    }).catch(() => {
      toast.error('Failed to copy link. Please select and copy manually.');
    });
  };

  const generateFullMessage = (url: string) => {
    return `Dear ${displayName} ❤️

With joyful hearts, we warmly invite you to celebrate one of the most special days of our lives as we begin our journey together.

Please view our wedding invitation and all the event details through the link below 🌐:

${url}

Your presence would truly mean the world to us, and we would be honored to celebrate this beautiful moment together.

With love,
❤️ Malmi & Denson`;
  };

  const handleCopyMessageActive = () => {
    const msg = generateFullMessage(generatedUrl);
    navigator.clipboard.writeText(msg).then(() => {
      setCopied('message');
      toast.success('Full message copied!');
    }).catch(() => {
      toast.error('Failed to copy message.');
    });
  };

  return (
    <div className="min-h-screen bg-brand-blush py-12 px-4 sm:px-6 lg:px-8 font-sans text-stone-800 relative overflow-hidden selection:bg-brand-plum/20">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-radial from-brand-lavender/20 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto">
        {/* Back to main website button */}
        <div className="mb-8 flex justify-between items-center">
          <a 
            href="/" 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 border border-brand-lavender/40 text-stone-600 hover:text-brand-plum hover:bg-white transition-all shadow-sm font-medium text-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Invitation
          </a>
          <span className="px-4 py-1.5 rounded-full bg-brand-rose border border-brand-lavender/30 text-brand-plum text-xs font-bold uppercase tracking-widest shadow-sm">
            Admin Dashboard
          </span>
        </div>

        {/* Main Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-brand-plum animate-pulse" />
            <span className="text-brand-plum uppercase tracking-[0.5em] text-xs font-bold drop-shadow-sm">Invitation Generator</span>
            <Sparkles className="w-5 h-5 text-brand-plum animate-pulse" />
          </div>
          <h1 className="text-5xl sm:text-6xl font-display text-stone-800 tracking-tight mb-4 drop-shadow-sm">
            Wedding <span className="italic font-light text-brand-plum">Admin Panel</span>
          </h1>
          <p className="text-stone-500 font-serif italic text-lg max-w-xl mx-auto">
            Generate personalized invitation links for your guests with specific event access.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Generator Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 bg-white/80 backdrop-blur-2xl p-8 sm:p-10 rounded-[2.5rem] border border-white shadow-[0_20px_50px_rgba(176,137,104,0.15)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-rose via-brand-plum to-brand-rose" />

            <form onSubmit={handleGenerate} className="space-y-8">
              {/* Invite Type */}
              <div>
                <label className={labelClass}>
                  <Users className="w-4 h-4 text-brand-plum" />
                  Invite Type
                </label>
                <Segmented
                  value={inviteType}
                  onChange={setInviteType}
                  options={[
                    { value: 'single', label: 'One Person' },
                    { value: 'couple', label: 'Couple' },
                    { value: 'family', label: 'Family' },
                  ]}
                />
              </div>

              {inviteType === 'single' && (
                <div className="space-y-6">
                  <div>
                    <label className={labelClass}>
                      <User className="w-4 h-4 text-brand-plum" />
                      Select Prefix
                    </label>
                    <select
                      value={guestTitle}
                      onChange={(e) => setGuestTitle(e.target.value)}
                      className="w-full bg-white px-6 py-4 rounded-full border border-stone-200/80 focus:ring-2 focus:ring-brand-lavender/30 focus:border-brand-plum/40 outline-none transition-all font-serif text-lg shadow-inner text-stone-800 cursor-pointer"
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Miss">Miss</option>
                      <option value="Dear">Dear</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>
                      <User className="w-4 h-4 text-brand-plum" />
                      Guest Name
                    </label>
                    <input type="text" placeholder="e.g. Sanjaya" value={guestName} onChange={(e) => setGuestName(e.target.value)} className={inputClass} />
                  </div>
                </div>
              )}

              {inviteType === 'couple' && (
                <div className="space-y-6">
                  <Segmented
                    value={coupleMode}
                    onChange={setCoupleMode}
                    options={[
                      { value: 'mrmrs', label: 'Mr. & Mrs.' },
                      { value: 'names', label: 'Two Names' },
                    ]}
                  />
                  {coupleMode === 'mrmrs' ? (
                    <div>
                      <label className={labelClass}>
                        <User className="w-4 h-4 text-brand-plum" />
                        Name (shown as Mr. & Mrs. ...)
                      </label>
                      <input type="text" placeholder="e.g. Sanjaya Perera" value={guestName} onChange={(e) => setGuestName(e.target.value)} className={inputClass} />
                    </div>
                  ) : (
                    partners.map((partner, i) => (
                      <div key={i}>
                        <label className={labelClass}>
                          <User className="w-4 h-4 text-brand-plum" />
                          {i === 0 ? 'First Name' : 'Second Name'}
                        </label>
                        <input
                          type="text"
                          placeholder={i === 0 ? 'e.g. Sanjaya' : 'e.g. Nadeesha'}
                          value={partner}
                          onChange={(e) => updateListItem(partners, setPartners, i, e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    ))
                  )}
                </div>
              )}

              {inviteType === 'family' && (
                <div className="space-y-6">
                  <div>
                    <label className={labelClass}>
                      <Users className="w-4 h-4 text-brand-plum" />
                      Family Name (shown as ... and Family)
                    </label>
                    <input type="text" placeholder="e.g. Perera" value={guestName} onChange={(e) => setGuestName(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>
                      <User className="w-4 h-4 text-brand-plum" />
                      Family Members
                    </label>
                    <div className="space-y-3">
                      {familyMembers.map((member, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder={`Member ${i + 1}`}
                            value={member}
                            onChange={(e) => updateListItem(familyMembers, setFamilyMembers, i, e.target.value)}
                            className={inputClass}
                          />
                          {familyMembers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setFamilyMembers(familyMembers.filter((_, j) => j !== i))}
                              className="shrink-0 w-11 h-11 rounded-full border border-stone-200 text-stone-400 hover:text-red-500 hover:border-red-200 flex items-center justify-center transition-colors"
                              aria-label="Remove member"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setFamilyMembers([...familyMembers, ''])}
                      className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-dashed border-brand-plum/50 text-brand-plum text-xs font-bold uppercase tracking-[0.15em] hover:bg-brand-rose/40 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Member
                    </button>
                  </div>
                </div>
              )}

              {/* Event Access */}
              <div>
                <label className={labelClass}>
                  <MapPin className="w-4 h-4 text-brand-plum" />
                  Invited To
                </label>
                <Segmented
                  value={inviteEvent}
                  onChange={setInviteEvent}
                  options={[
                    { value: 'church', label: 'Church' },
                    { value: 'hotel', label: 'Hotel' },
                    { value: 'both', label: 'Both' },
                  ]}
                />
                <p className="mt-2 ml-2 text-sm font-serif italic text-stone-500">{EVENT_LABELS[inviteEvent]}</p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-stone-800 text-brand-rose py-5 rounded-full font-sans tracking-[0.3em] font-bold text-xs uppercase hover:bg-stone-900 transition-all shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.25)] active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <LinkIcon className="w-4 h-4 text-brand-plum" />
                Generate Link
              </button>
            </form>
          </motion.div>

          {/* Generated Link & History */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 space-y-8"
          >
            {/* Active Generated Link Box */}
            <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white shadow-[0_20px_50px_rgba(176,137,104,0.15)] relative overflow-hidden">
              <h3 className="font-serif text-2xl text-stone-800 mb-4 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-brand-plum" />
                Generated Link
              </h3>
              
              {generatedUrl ? (
                <div className="space-y-6 animate-fadeIn">
                  <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200/80 shadow-inner">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-plum mb-3 flex items-center gap-2">
                      <Sparkles className="w-3 h-3" /> WhatsApp Message Preview
                    </p>
                    <div className="text-sm text-stone-700 font-serif whitespace-pre-wrap leading-relaxed bg-white/60 p-4 rounded-xl border border-stone-100">
                      {generateFullMessage(generatedUrl)}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleCopy(generatedUrl, 'link')}
                      className="flex-1 bg-brand-plum text-white py-3.5 px-6 rounded-full font-sans tracking-[0.2em] font-bold text-[11px] uppercase hover:bg-brand-plum/90 transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
                    >
                      {copied === 'link' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied === 'link' ? 'Copied!' : 'Copy Link Only'}
                    </button>
                    <button
                      onClick={handleCopyMessageActive}
                      className="flex-1 bg-brand-rose text-brand-plum py-3.5 px-6 rounded-full font-sans tracking-[0.2em] font-bold text-[11px] uppercase hover:bg-brand-rose/90 transition-all shadow-sm border border-brand-lavender/30 flex items-center justify-center gap-2 active:scale-95"
                    >
                      {copied === 'message' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      Copy Full Message
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-2xl">
                  <p className="text-stone-400 font-serif italic text-base">
                    Fill the form and click generate to create a link.
                  </p>
                </div>
              )}
            </div>


          </motion.div>
        </div>
      </div>
    </div>
  );
};
