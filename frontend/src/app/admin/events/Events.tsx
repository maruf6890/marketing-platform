"use client";
import { Calendar, CalendarCurrentDate, CalendarDayView, CalendarMonthView, CalendarNextTrigger, CalendarPrevTrigger, CalendarTodayTrigger, CalendarViewTrigger, CalendarWeekView, CalendarYearView } from '@/components/FullCalandar';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import React from 'react'
import { Overlay } from 'vaul';
interface Events {
  id: string;
  start: Date;
  end: Date;
  title: string;
  color: string;
}
export default function Events() {
  const [selectedEvent, setSelectedEvent] = React.useState<Events | null>(null);



  return (
    <div>
      <Calendar
        onEventClick={(event) => setSelectedEvent(event as Events)}
        defaultDate={new Date()}
        events={[
          {
            id: "1",
            start: new Date("2026-06-26T09:30:00Z"),
            end: new Date("2026-06-26T14:30:00Z"),
            title: "event A",
            color: "pink",
          },
          {
            id: "2",
            start: new Date("2026-06-26T10:00:00Z"),
            end: new Date("2026-06-26T10:30:00Z"),
            title: "event B",
            color: "blue",
          },
        ]}
      >
        <div className="h-dvh py-6 flex flex-col">
          <div className="flex px-6 items-center gap-2 mb-6">
            <CalendarViewTrigger
              className="aria-[current=true]:bg-accent"
              view="day"
            >
              Day
            </CalendarViewTrigger>
            <CalendarViewTrigger
              view="week"
              className="aria-[current=true]:bg-accent"
            >
              Week
            </CalendarViewTrigger>
            <CalendarViewTrigger
              view="month"
              className="aria-[current=true]:bg-accent"
            >
              Month
            </CalendarViewTrigger>
            <CalendarViewTrigger
              view="year"
              className="aria-[current=true]:bg-accent"
            >
              Year
            </CalendarViewTrigger>

            <span className="flex-1" />

            <CalendarCurrentDate />

            <CalendarPrevTrigger>
              <ChevronLeft size={20} />
              <span className="sr-only">Previous</span>
            </CalendarPrevTrigger>

            <CalendarTodayTrigger>Today</CalendarTodayTrigger>

            <CalendarNextTrigger>
              <ChevronRight size={20} />
              <span className="sr-only">Next</span>
            </CalendarNextTrigger>

            {/* <ModeToggle /> */}
          </div>

          <div className="flex-1 overflow-auto px-6 relative">
            <CalendarDayView />
            <CalendarWeekView />
            <CalendarMonthView />
            <CalendarYearView />
          </div>
        </div>
      </Calendar>
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <Overlay className="fixed inset-0 bg-black/50" />
        <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded">
          <DialogTitle>{selectedEvent?.title}</DialogTitle>
          <DialogDescription>
            Start: {selectedEvent?.start.toLocaleString()}
            <br />
            End: {selectedEvent?.end.toLocaleString()}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}
