import EventCalendar from '@/components/EventCalendar';
import Link from 'next/link';
import { Button } from "@/components/ui/button"

export default function CalendarPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Link href="/" passHref>
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
      <EventCalendar />
    </div>
  );
}