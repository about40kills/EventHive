import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEvent, useEventAttendees } from "@/hooks/useEvents";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Phone, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Attendee {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  registrationDate: string;
  status?: 'confirmed' | 'pending' | 'cancelled';
  avatar?: string;
}

interface EventAttendeesPageProps {
  params: { id: string };
}

const statusColors = {
  confirmed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
} as const;

export function EventAttendeesPage(props: EventAttendeesPageProps) {
  const { id } = props.params;
  const [, setLocation] = useLocation();
  const { data: eventData, isLoading: eventLoading } = useEvent(id);
  const { data: attendeesData, isLoading: attendeesLoading, error } = useEventAttendees(id);
  const { user } = useAuth();

  // Show loading state while event is loading
  if (eventLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-muted rounded" />
          <div className="h-12 w-96 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!eventData?.success || !eventData?.event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event not found</h1>
          <Button onClick={() => setLocation("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const event = eventData.event;

  // Check if user is the organizer
  if (!user || event.organizer._id !== user.id) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
          <p className="text-muted-foreground mb-4">
            You don't have permission to view attendees for this event.
          </p>
          <Button onClick={() => setLocation("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Show error state if there's an error fetching attendees
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error loading attendees</h1>
          <p className="text-muted-foreground mb-4">
            There was an error loading the attendees for this event.
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const attendees: Attendee[] = attendeesData?.attendees || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
          ← Back to Dashboard
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {format(new Date(event.date), 'MMM dd, yyyy')}
          </div>
          <span>•</span>
          <span>{attendeesData?.totalCount || 0} registered attendees</span>
        </div>
      </div>

      {attendeesLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-lg" />
          ))}
        </div>
      ) : attendees.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground">No attendees registered yet</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attendee</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Registration Date</TableHead>
                {attendees.some(a => a.status) && <TableHead>Status</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendees.map((attendee: Attendee) => (
                <TableRow key={attendee._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={attendee.avatar} alt={attendee.name} />
                        <AvatarFallback>
                          {attendee.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{attendee.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3" />
                        <a 
                          href={`mailto:${attendee.email}`} 
                          className="text-blue-600 hover:underline"
                        >
                          {attendee.email}
                        </a>
                      </div>
                      {attendee.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <a 
                            href={`tel:${attendee.phone}`} 
                            className="hover:underline"
                          >
                            {attendee.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(attendee.registrationDate), 'MMM dd, yyyy')}
                  </TableCell>
                  {attendee.status && (
                    <TableCell>
                      <Badge className={statusColors[attendee.status]}>
                        {attendee.status}
                      </Badge>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default EventAttendeesPage;