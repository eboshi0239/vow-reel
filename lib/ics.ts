// Calendar sync helpers: generate an .ics file and a Google Calendar URL.

function toStamp(dateISO: string): string {
  // All-day style stamp -> use the date with a default 10:00 local time block.
  const d = new Date(dateISO + 'T10:00:00')
  const end = new Date(d.getTime() + 1000 * 60 * 60 * 2)
  const fmt = (x: Date) =>
    x
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}Z$/, 'Z')
  return `${fmt(d)}/${fmt(end)}`
}

export interface CalendarEvent {
  title: string
  dateISO: string
  location: string
  description: string
}

export function buildIcs(event: CalendarEvent): string {
  const [start, end] = toStamp(event.dateISO).split('/')
  const uid = `${Date.now()}@vowreel.kr`
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VowReel//KO//',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${start}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title}`,
    `LOCATION:${event.location}`,
    `DESCRIPTION:${event.description}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export function downloadIcs(event: CalendarEvent) {
  const blob = new Blob([buildIcs(event)], {
    type: 'text/calendar;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `vowreel-${event.dateISO}.ics`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function googleCalendarUrl(event: CalendarEvent): string {
  const dates = toStamp(event.dateISO)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates,
    location: event.location,
    details: event.description,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
