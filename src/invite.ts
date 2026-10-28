export type InviteType = 'single' | 'couple' | 'family';
export type InviteEvent = 'church' | 'hotel' | 'both';

export interface Invite {
  /** Name shown on the invitation, e.g. "Mr. & Mrs. Perera" or "Perera and Family". */
  displayName: string;
  type: InviteType;
  /** People who can be ticked in the RSVP (couple / family). Empty for single guests. */
  members: string[];
  event: InviteEvent;
}

export interface InviteInput {
  type: InviteType;
  /** For single guests: Mr. / Mrs. / Miss / Dear. For couples: 'Mr. & Mrs.' or '' (two names). */
  prefix: string;
  name: string;
  members: string[];
  event: InviteEvent;
}

export const EVENT_LABELS: Record<InviteEvent, string> = {
  church: 'Church Ceremony only',
  hotel: 'Hotel Reception only',
  both: 'Church Ceremony & Hotel Reception',
};

const formatDisplayName = (prefix: string, name: string) =>
  prefix === 'Family'
    ? `${name} and Family`
    : prefix === 'Dear' || !prefix
      ? name
      : `${prefix} ${name}`.trim();

// Chat apps drop a trailing "." from links, so "Mr. & Mrs." can arrive as "Mr. & Mrs".
const normalizePrefix = (value: string) =>
  ({ 'Mr': 'Mr.', 'Mrs': 'Mrs.', 'Mr. & Mrs': 'Mr. & Mrs.', 'Mr & Mrs': 'Mr. & Mrs.' } as Record<string, string>)[value.trim()] ?? value.trim();

const normalizeEvent =(value: string | null): InviteEvent =>
  value === 'church' || value === 'hotel' ? value : 'both';

/** Reads the invitation details from the current URL. Old links (name + prefix only) still work. */
export function parseInvite(): Invite {
  const params = new URLSearchParams(window.location.search);
  const pathName = decodeURIComponent(window.location.pathname.slice(1)).trim();
  const name = (params.get('name') || pathName).trim();
  const prefix = normalizePrefix(params.get('prefix') || params.get('title') || '');
  const members = params.getAll('m').map((m) => m.trim()).filter(Boolean);

  let type: InviteType = (params.get('type') as InviteType) || 'single';
  if (!params.get('type')) {
    if (prefix === 'Mr. & Mrs.') type = 'couple';
    else if (prefix === 'Family') type = 'family';
  }

  if (type === 'couple' && members.length === 0 && prefix === 'Mr. & Mrs.' && name) {
    members.push(`Mr. ${name}`, `Mrs. ${name}`);
  }

  return {
    displayName: name ? formatDisplayName(prefix, name) : '',
    type,
    members,
    event: normalizeEvent(params.get('event')),
  };
}

export function buildInvite(input: InviteInput): { url: string; displayName: string } {
  const name = input.name.trim();
  const params = new URLSearchParams();

  if (input.type !== 'single') params.set('type', input.type);
  const prefix = input.type === 'family' ? 'Family' : input.prefix;
  if (prefix && prefix !== 'Dear') params.set('prefix', prefix);
  // Mr. & Mrs. members are derived from the name, so they don't need to be in the link.
  if (!(input.type === 'couple' && prefix === 'Mr. & Mrs.')) {
    input.members.map((m) => m.trim()).filter(Boolean).forEach((m) => params.append('m', m));
  }
  if (input.event !== 'both') params.set('event', input.event);

  // Encode a trailing "." so chat apps keep it as part of the link.
  const query = params.toString().replace(/\.$/, '%2E');
  return {
    url: `${window.location.origin}/${encodeURIComponent(name)}${query ? `?${query}` : ''}`,
    displayName: formatDisplayName(prefix, name),
  };
}
