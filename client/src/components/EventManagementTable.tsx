import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Users, MoreVertical, QrCode } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Event {
  id: string;
  title: string;
  date: Date;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  registeredCount: number;
  capacity: number;
  price?: number;
  currency?: string;
  isFree: boolean;
  ticketTiers?: Array<{
    name: string;
    price: number;
    quantity: number;
    sold?: number;
    description?: string;
  }>;
}

interface EventManagementTableProps {
  events: Event[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onViewAttendees?: (id: string) => void;
  onVerify?: (id: string) => void;
}

const statusColors = {
  draft: 'bg-muted text-muted-foreground',
  published: 'bg-chart-3/10 text-chart-3',
  cancelled: 'bg-destructive/10 text-destructive',
  completed: 'bg-primary/10 text-primary',
};

export function EventManagementTable({ events, onEdit, onDelete, onViewAttendees, onVerify }: EventManagementTableProps) {
  // Use a media query to detect mobile
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  if (isMobile) {
    // Card layout for mobile
    return (
      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No events found</div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="border rounded-lg p-4 flex flex-col gap-2">
              <div className="font-bold">{event.title}</div>
              <div className="text-sm text-muted-foreground">{format(event.date, 'MMM dd, yyyy')}</div>
              <div>
                <Badge className={statusColors[event.status]}>{event.status}</Badge>
              </div>
              <div className="text-sm">Registered: {event.registeredCount}/{event.capacity >= 1000000 ? '∞' : event.capacity}</div>
              <div className="text-sm font-medium text-green-700">
                {!event.isFree &&
                  `Revenue: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: event.currency || 'USD' }).format((event.price || 0) * event.registeredCount)}`
                }
              </div>
              <div className="flex gap-2 justify-end">
                {!event.isFree && (
                  <Button variant="ghost" size="icon" onClick={() => onVerify?.(event.id)} title="Verify Tickets">
                    <QrCode className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => onEdit?.(event.id)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onViewAttendees?.(event.id)}>
                  <Users className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onDelete?.(event.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  // Table layout for desktop
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event Title</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead>Revenue</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No events found
              </TableCell>
            </TableRow>
          ) : (
            events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.title}</TableCell>
                <TableCell>{format(event.date, 'MMM dd, yyyy')}</TableCell>
                <TableCell>
                  <Badge className={statusColors[event.status]}>{event.status}</Badge>
                </TableCell>
                <TableCell>{event.registeredCount}/{event.capacity >= 1000000 ? '∞' : event.capacity}</TableCell>
                <TableCell className="font-medium text-green-700">
                  {!event.isFree ? (
                    new Intl.NumberFormat('en-US', { style: 'currency', currency: event.currency || 'USD' }).format(
                      event.ticketTiers && event.ticketTiers.length > 0
                        ? event.ticketTiers.reduce((acc, tier) => acc + ((tier.sold || 0) * tier.price), 0)
                        : (event.price || 0) * event.registeredCount
                    )
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {!event.isFree && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => onVerify?.(event.id)}>
                            <QrCode className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Verify Tickets</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => onEdit?.(event.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit Event</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => onViewAttendees?.(event.id)}>
                          <Users className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View Attendees</p>
                      </TooltipContent>
                    </Tooltip>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onDelete?.(event.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

