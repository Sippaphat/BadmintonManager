import api from './api';

/**
 * Get all schedules for a group
 */
export async function fetchSchedules(groupId) {
  const response = await api.get(`/api/groups/${groupId}/schedules`);
  return response.data.schedules || [];
}

/**
 * Create a new schedule/event
 */
export async function createSchedule(groupId, scheduleData) {
  const response = await api.post(`/api/groups/${groupId}/schedules`, scheduleData);
  return response.data.schedule;
}

/**
 * Delete a schedule
 */
export async function deleteSchedule(groupId, scheduleId) {
  const response = await api.delete(`/api/groups/${groupId}/schedules/${scheduleId}`);
  return response.data;
}

/**
 * Generate Google Calendar link
 */
export function generateGoogleCalendarLink(event) {
  const startDateTime = new Date(`${event.date}T${event.startTime}`).toISOString().replace(/-|:|\.\d\d\d/g, '');
  const endDateTime = new Date(`${event.date}T${event.endTime}`).toISOString().replace(/-|:|\.\d\d\d/g, '');
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startDateTime}/${endDateTime}`,
    details: event.description || '',
    location: event.location || '',
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Outlook Calendar link
 */
export function generateOutlookCalendarLink(event) {
  const startDateTime = new Date(`${event.date}T${event.startTime}`).toISOString();
  const endDateTime = new Date(`${event.date}T${event.endTime}`).toISOString();
  
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: startDateTime,
    enddt: endDateTime,
    body: event.description || '',
    location: event.location || '',
  });
  
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Download ICS file for calendar import
 */
export function downloadICSFile(event) {
  const startDateTime = new Date(`${event.date}T${event.startTime}`)
    .toISOString()
    .replace(/-|:|\.\d\d\d/g, '');
  const endDateTime = new Date(`${event.date}T${event.endTime}`)
    .toISOString()
    .replace(/-|:|\.\d\d\d/g, '');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Badminton Manager//EN',
    'BEGIN:VEVENT',
    `DTSTART:${startDateTime}`,
    `DTEND:${endDateTime}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description || ''}`,
    `LOCATION:${event.location || ''}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${event.title.replace(/\s+/g, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
