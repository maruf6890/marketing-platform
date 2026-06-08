"use client";
import { Calendar, CalendarCurrentDate, CalendarDayView, CalendarEvent, CalendarMonthView, CalendarNextTrigger, CalendarPrevTrigger, CalendarTodayTrigger, CalendarViewTrigger, CalendarWeekView, CalendarYearView } from '@/components/FullCalandar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns/format';
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Globe, ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

import React from 'react'
import { Overlay } from 'vaul';

export default function Events({ events }: { events: CalendarEvent[] }) {
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null);
  const router = useRouter();



  return (
    <div>
      <Calendar
        onEventClick={(event) => setSelectedEvent(event as CalendarEvent)}
        defaultDate={new Date()}
        events={events}
        onChangeView={(view) => {
          router.replace(`/admin/events?view=${view}`);
        }}
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
      <Dialog
        open={!!selectedEvent}
        onOpenChange={() => setSelectedEvent(null)}
      >
        <Overlay className="fixed inset-0 bg-black/50" />

        <DialogContent className="fixed left-1/2 top-1/2 w-[95%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-background p-0 overflow-hidden">
          <DialogHeader className="border-b p-6">
            <DialogTitle className="text-lg font-semibold">
              {selectedEvent?.title}
            </DialogTitle>

            <DialogDescription className="sr-only">
              Post details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 p-6">
            {/* Page */}
            <div className="flex items-start gap-3">
              <Globe className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Facebook Page</p>
                <p className="font-medium">{selectedEvent?.asset_name}</p>
              </div>
            </div>

            {/* Schedule */}
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Published At</p>
                <p className="font-medium">
                  {selectedEvent?.start
                    ? format(
                        new Date(selectedEvent.start),
                        "MMM dd, yyyy • hh:mm a",
                      )
                    : "-"}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-medium capitalize">
                  {selectedEvent?.status}
                </p>
              </div>
            </div>

            {/* Media */}
            <div className="flex items-start gap-3">
              <ImageIcon className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Media Files</p>
                <p className="font-medium">{selectedEvent?.media_count ?? 0}</p>
              </div>
            </div>

            {/* Content */}
            <div className="rounded-lg border p-4">
              <p className="mb-2 text-xs text-muted-foreground">Post Content</p>

              <p className="line-clamp-4 text-sm leading-relaxed">
                {selectedEvent?.content || "No content available"}
              </p>
            </div>
          </div>
          <DialogFooter className="border-t p-4">
            <Button variant="outline" onClick={() => setSelectedEvent(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
