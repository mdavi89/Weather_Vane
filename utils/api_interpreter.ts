import { ClockTime, TimePeriod, TimeSlots } from '../../../server/src/utils/timeslots';
import { fetchCalendarEvents } from '../api/calendarCalls';
import { DaysWithRanges } from '../components/calendar';




const startDateArray: Date[] = [];
const eventArray: TimePeriod[] = [];
const timeSlotsClientArray: TimeSlots[] = [];
const timeSlotsInspectorArray: TimeSlots[] = [];

const eventData = await fetchCalendarEvents();

interface CalendarEvent {
    kind: string;
    etag: string;
    id: string;
    status: string;
    htmlLink: string;
    created: string;
    updated: string;
    summary?: string;
    creator: {
      email: string;
      self: boolean;
    };
    organizer: {
      email: string;
      self: boolean;
    };
    start?: {
      dateTime?: string; // Events with specific times
      date?: string;     // All-day events
      timeZone?: string;
    };
    end?: {
      dateTime?: string; // Events with specific times
      date?: string;     // All-day events
      timeZone?: string;
    };
    iCalUID: string;
    sequence: number;
    reminders: {
      useDefault: boolean;
    };
    eventType: string;
  }
  

eventData.forEach((event: CalendarEvent) => {

let startTime = event.start?.dateTime;
let endTime = event.end?.dateTime;

let startTimeDate = startTime?.slice(0,10);
let startTimeHr= parseInt(startTime?.slice(11, 13)!);
let startTimeMin = parseInt(startTime?.slice(14,16)!);
let endTimeHr = parseInt(endTime?.slice(11,13)!);
let endTimeMin = parseInt(endTime?.slice(14,16)!);

let startTimeConvert: ClockTime =  { hours: startTimeHr, minutes: startTimeMin }
let endTimeConvert: ClockTime =  { hours: endTimeHr, minutes: endTimeMin }
let eventPeriod: TimePeriod = {start: startTimeConvert, end: endTimeConvert}

startDateArray.push(new Date(startTimeDate || ''));
eventArray.push(eventPeriod);

})

function dateToTimePeriod(start: ClockTime, end: ClockTime, date: string): TimePeriod {
  return {
    date, // Assign the date provided
    start: { hours: start.hours, minutes: start.minutes },
    end: { hours: end.hours, minutes: end.minutes },
  };
}
function timeSlotsToDaysWithRanges(timeSlots: TimeSlots[]): DaysWithRanges {
  const daysMap = new Map<string, TimePeriod[]>();

  timeSlots.forEach(slot => {
    const { date } = slot.totalSchedule;

    // Combine occupied and available times
    const timePeriods: TimePeriod[] = [
      ...slot.occupiedTimes,
      ...slot.availableTimes.map(({ start, end }) => ({
        date,
        start,
        end,
      })),
    ];

    // Add or append to the daysMap
    if (!daysMap.has(date!)) {
      daysMap.set(date!, []);
    }

    const existingPeriods = daysMap.get(date!)!;
    daysMap.set(date!, [...existingPeriods, ...timePeriods]);
  });

  return { daysMap };
}

function setClientTimes(startDateA: Date[], eventA: TimePeriod[]) {
startDateA.forEach((startDate) => {
  // Define the date string for this iteration
  const dateString = startDate.toISOString().split("T")[0]; // Extracts 'YYYY-MM-DD'

  // Define total schedule for the day (e.g., 00:00 to 23:59)
  const totalSchedule: TimePeriod = {
    date: dateString, // Add the date
    start: { hours: 0, minutes: 0 }, // Midnight
    end: { hours: 23, minutes: 59 }, // End of day
  };

  // Initialize TimeSlots instance
  const timeSlots = new TimeSlots(totalSchedule);

  // Mark occupied periods
  eventA.forEach((event) => {
    // Convert event times to a TimePeriod with a date
    const period = dateToTimePeriod(event.start, event.end, dateString);
    // console.log("Marking period:", period);
    // console.log("Occupied times:", timeSlots.occupiedTimes);
    timeSlots.markTimePeriodBusy(period);
    timeSlots.changeAvailabilityArray(period);
  });

  timeSlotsClientArray.push(timeSlots);

  
});
}

function setInspectorTimes(startDateA: Date[], eventA: TimePeriod[]) {
  startDateA.forEach((startDate) => {
    // Define the date string for this iteration
    const dateString = startDate.toISOString().split("T")[0]; // Extracts 'YYYY-MM-DD'
  
    // Define total schedule for the day (e.g., 00:00 to 23:59)
    const totalSchedule: TimePeriod = {
      date: dateString, // Add the date
      start: { hours: 0, minutes: 0 }, // Midnight
      end: { hours: 23, minutes: 59 }, // End of day
    };
  
    // Initialize TimeSlots instance
    const timeSlots = new TimeSlots(totalSchedule);
    // console.log(timeSlots);
  
    // Mark occupied periods
    eventA.forEach((event) => {
      // Convert event times to a TimePeriod with a date
      const period = dateToTimePeriod(event.start, event.end, dateString);
      // console.log("Marking period:", period);
      // console.log("Occupied times:", timeSlots.occupiedTimes);
      timeSlots.markTimePeriodBusy(period);
      timeSlots.changeAvailabilityArray(period);
    });
  
    // Get available slots
    timeSlotsInspectorArray.push(timeSlots);
  });
  }

  setClientTimes(startDateArray, eventArray);
  setInspectorTimes(startDateArray, eventArray);

  export const clientTimes = timeSlotsToDaysWithRanges(timeSlotsClientArray);
  export const inspectorTimes = timeSlotsToDaysWithRanges(timeSlotsInspectorArray);


  

