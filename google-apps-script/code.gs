/**
 * Malmi & Denson wedding – RSVP + Wishes endpoint
 * Spreadsheet: https://docs.google.com/spreadsheets/d/1lLB4w5y-sPZX1MAOQHPxpPH5Wvur9hz618jzJlbuJPM
 *
 * The website POSTs form data with `sheet=RSVP` or `sheet=WISH`.
 * Each goes to its own tab, created automatically with headers.
 */
const SPREADSHEET_ID = '1lLB4w5y-sPZX1MAOQHPxpPH5Wvur9hz618jzJlbuJPM';

const SHEETS = {
  RSVP: {
    name: 'RSVP',
    headers: [
      'Timestamp',
      'Name',
      'Invite Type',
      'Invited To',
      'Attending',
      'Guests Coming',
      'Attendees & Choices',
      'Events Attending',
      'Dietary Notes',
    ],
    widths: [160, 220, 110, 230, 90, 110, 380, 220, 280],
  },
  WISH: {
    name: 'Wishes',
    headers: ['Timestamp', 'Name', 'Invited To', 'Message'],
    widths: [160, 220, 230, 520],
  },
};

const INVITED_TO_LABELS = {
  church: 'Church Ceremony only',
  hotel: 'Hotel Reception only',
  both: 'Church & Reception',
};

const INVITE_TYPE_LABELS = {
  single: 'One Person',
  couple: 'Couple',
  family: 'Family',
};

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const payload = parsePayload_(e);
    const key = String(payload.sheet || '').toUpperCase();
    const config = SHEETS[key];

    if (!config) {
      return jsonResponse_({ ok: false, error: 'Invalid sheet. Use RSVP or WISH.' });
    }

    const sheet = getSheet_(config);

    if (key === 'RSVP') {
      sheet.appendRow([
        new Date(),
        payload.fullName || '',
        INVITE_TYPE_LABELS[payload.inviteType] || payload.inviteType || '',
        INVITED_TO_LABELS[payload.event] || payload.event || '',
        payload.attending || '',
        Number(payload.guests) || 0,
        payload.attendees || '',
        payload.eventsAttending || '',
        payload.dietaryNotes || '',
      ]);
    } else {
      sheet.appendRow([
        new Date(),
        payload.name || '',
        INVITED_TO_LABELS[payload.event] || payload.event || '',
        payload.message || '',
      ]);
    }

    return jsonResponse_({ ok: true });
  } catch (error) {
    return jsonResponse_({
      ok: false,
      error: String(error && error.message ? error.message : error),
    });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return jsonResponse_({ ok: true, message: 'Wedding form endpoint is running.' });
}

/** Run this once from the editor (Run ▶ setup) to create both tabs with headers. */
function setup() {
  getSheet_(SHEETS.RSVP);
  getSheet_(SHEETS.WISH);
}

function getSheet_(config) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(config.name);
  if (!sheet) {
    sheet = ss.insertSheet(config.name);
  }
  if (sheet.getLastRow() === 0) {
    writeHeaders_(sheet, config);
  }
  return sheet;
}

function writeHeaders_(sheet, config) {
  const headerRange = sheet.getRange(1, 1, 1, config.headers.length);
  headerRange
    .setValues([config.headers])
    .setFontWeight('bold')
    .setFontColor('#FFFFFF')
    .setBackground('#A87D25')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 32);
  config.widths.forEach(function (width, i) {
    sheet.setColumnWidth(i + 1, width);
  });
  // Timestamp column as readable date & time.
  sheet.getRange('A2:A').setNumberFormat('dd/MM/yyyy hh:mm a');
  // Wrap long text columns (attendees, notes, messages).
  sheet.getRange(2, 1, sheet.getMaxRows() - 1, config.headers.length).setWrap(true).setVerticalAlignment('top');
}

function parsePayload_(e) {
  const params = e && e.parameter ? e.parameter : {};
  if (Object.keys(params).length > 0) {
    return params;
  }

  const contents = e && e.postData && e.postData.contents ? e.postData.contents : '';
  if (!contents) {
    return {};
  }

  if (contents.indexOf('=') !== -1 && contents.indexOf('{') !== 0) {
    return parseQueryString_(contents);
  }

  try {
    return JSON.parse(contents);
  } catch (_error) {
    return {};
  }
}

function parseQueryString_(query) {
  const out = {};
  const pairs = String(query).split('&');

  for (let i = 0; i < pairs.length; i++) {
    const part = pairs[i];
    if (!part) continue;

    const idx = part.indexOf('=');
    const rawKey = idx >= 0 ? part.slice(0, idx) : part;
    const rawValue = idx >= 0 ? part.slice(idx + 1) : '';
    out[decodeURIComponent(rawKey.replace(/\+/g, ' '))] = decodeURIComponent(rawValue.replace(/\+/g, ' '));
  }

  return out;
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
