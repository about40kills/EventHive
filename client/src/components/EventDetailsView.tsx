import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, MapPin, Users, Clock, Globe, Shield, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { SERVER_URL } from "@/lib/api";
import { getOptimizedImageUrl } from "@/lib/utils";

type EventAction = 'register' | 'cancel-registration' | 'delete' | 'waitlist' | 'login-required' | 'organizer-no-register';

interface EventDetailsViewProps {
  event: {
    id: string;
    title: string;
    description: string;
    category: string;
    eventType: 'public' | 'corporate';
    date: Date;
    time: string;
    location: string;
    capacity: number;
    registeredCount: number;
    imageUrl?: string;
    isVirtual?: boolean;
    isPrivate?: boolean;
    tags?: string[];
    isFree?: boolean;
    price?: number;
    currency?: string;
    organizer: {
      name: string;
      email: string;
    };
  };
  isRegistered?: boolean;
  canRegister?: boolean;
  eventAction: EventAction;
  onRegister?: () => void;
  onCancelRegistration?: () => void;
  onDeleteEvent?: () => void;
}

export function EventDetailsView({
  event,
  isRegistered = false,
  canRegister = true,
  eventAction,
  onRegister,
  onCancelRegistration,
  onDeleteEvent,
}: EventDetailsViewProps) {
  const spotsLeft = event.capacity - event.registeredCount;
  const isFull = spotsLeft === 0;

  const renderActionButton = () => {
    switch (eventAction) {
      case 'delete':
        return (
          <Button
            variant="destructive"
            className="w-full"
            onClick={onDeleteEvent}
            data-testid="button-delete-event"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete This Event
          </Button>
        );

      case 'cancel-registration':
        return (
          <Button
            variant="outline"
            className="w-full"
            onClick={onCancelRegistration}
            data-testid="button-cancel-registration"
          >
            Cancel Registration
          </Button>
        );

      case 'waitlist':
        return (
          <Button className="w-full" disabled data-testid="button-join-waitlist">
            Join Waitlist
          </Button>
        );

      case 'register':
        return (
          <Button className="w-full" onClick={onRegister} data-testid="button-register">
            {event.isFree ? 'Register for Event' : `Buy Ticket (${new Intl.NumberFormat('en-US', { style: 'currency', currency: event.currency || 'USD' }).format(event.price || 0)})`}
          </Button>
        );

      case 'login-required':
        return (
          <Button className="w-full" disabled>
            Login to Register
          </Button>
        );

      case 'organizer-no-register':
        return (
          <div className="w-full text-center p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              As an organizer, you can only manage your own events
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {event.imageUrl && (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden">
          <img
            src={getOptimizedImageUrl(
              event.imageUrl?.startsWith("http")
                ? event.imageUrl
                : `${SERVER_URL}${event.imageUrl}`,
              1200
            )}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-primary text-primary-foreground">{event.category}</Badge>
              {event.isVirtual && <Badge variant="secondary">Virtual</Badge>}
              {event.isPrivate && (
                <Badge variant="secondary">
                  <Shield className="h-3 w-3 mr-1" />
                  Private
                </Badge>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white" data-testid="text-event-title">
              {event.title}
            </h1>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">About This Event</h2>
            <p className="text-muted-foreground leading-relaxed" data-testid="text-description">
              {event.description}
            </p>
          </div>

          {event.tags && event.tags.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-3">Organizer</h3>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {event.organizer.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium" data-testid="text-organizer-name">{event.organizer.name}</p>
                <p className="text-sm text-muted-foreground">{event.organizer.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{format(event.date, 'EEEE, MMMM dd, yyyy')}</p>
                    <p className="text-sm text-muted-foreground">{event.time}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{event.location}</p>
                    {event.isVirtual && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Globe className="h-3 w-3" />
                        Virtual Event
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="font-medium" data-testid="text-capacity">
                      {event.registeredCount} / {event.capacity} registered
                    </p>
                    <p className={`text-sm ${spotsLeft < 10 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {spotsLeft} spots remaining
                    </p>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full ${(event.registeredCount / event.capacity) >= 0.9
                          ? 'bg-destructive'
                          : (event.registeredCount / event.capacity) >= 0.7
                            ? 'bg-chart-4'
                            : 'bg-primary'
                          }`}
                        style={{ width: `${(event.registeredCount / event.capacity) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Price Display */}
                <div className="flex items-start gap-3 pt-4 border-t">
                  <div className="flex-1 flex justify-between items-center">
                    <span className="font-medium text-lg">Price</span>
                    <span className="text-2xl font-bold text-primary">
                      {event.isFree ? 'Free' : `${new Intl.NumberFormat('en-US', { style: 'currency', currency: event.currency || 'USD' }).format(event.price || 0)}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                {renderActionButton()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
