import { useState } from "react";
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
    ticketTiers?: Array<{
      name: string;
      price: number;
      quantity: number;
      sold?: number;
      description?: string;
    }>;
    organizer: {
      name: string;
      email: string;
    };
  };
  isRegistered?: boolean;
  canRegister?: boolean;
  eventAction: EventAction;
  onRegister?: (tickets?: Array<{ name: string; price: number; quantity: number }>) => void;
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
  const [selectedTickets, setSelectedTickets] = useState<{ [key: string]: number }>({});

  const spotsLeft = event.capacity - event.registeredCount;
  const isFull = spotsLeft === 0;

  const handleTicketChange = (tierName: string, quantity: number, max: number) => {
    if (quantity < 0) quantity = 0;
    if (quantity > max) quantity = max;
    setSelectedTickets(prev => ({ ...prev, [tierName]: quantity }));
  };

  const totalSelected = Object.values(selectedTickets).reduce((a, b) => a + b, 0);
  const totalPrice = event.ticketTiers?.reduce((acc, tier) => {
    return acc + (tier.price * (selectedTickets[tier.name] || 0));
  }, 0) || 0;

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
        const hasTiers = event.ticketTiers && event.ticketTiers.length > 0;
        const isDisabled = hasTiers && totalSelected === 0;

        return (
          <Button
            className="w-full"
            onClick={() => {
              const tickets = hasTiers
                ? event.ticketTiers!.map(t => ({
                  name: t.name,
                  price: t.price,
                  quantity: selectedTickets[t.name] || 0
                })).filter(t => t.quantity > 0)
                : undefined;
              onRegister?.(tickets);
            }}
            disabled={isDisabled}
            data-testid="button-register"
          >
            {event.isFree
              ? 'Register for Event'
              : hasTiers
                ? `Buy Tickets ${totalPrice > 0 ? `(${new Intl.NumberFormat('en-US', { style: 'currency', currency: event.currency || 'USD' }).format(totalPrice)})` : ''}`
                : `Buy Ticket (${new Intl.NumberFormat('en-US', { style: 'currency', currency: event.currency || 'USD' }).format(event.price || 0)})`
            }
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
                      {event.registeredCount} / {event.capacity >= 1000000 ? '∞' : event.capacity} registered
                    </p>
                    <p className={`text-sm ${spotsLeft < 10 && event.capacity < 1000000 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {event.capacity >= 1000000 ? 'Unlimited spots available' : `${spotsLeft} spots remaining`}
                    </p>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full ${(event.registeredCount / event.capacity) >= 0.9 && event.capacity < 1000000
                          ? 'bg-destructive'
                          : (event.registeredCount / event.capacity) >= 0.7 && event.capacity < 1000000
                            ? 'bg-chart-4'
                            : 'bg-primary'
                          }`}
                        style={{ width: `${Math.min((event.registeredCount / event.capacity) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Price Display */}
                <div className="pt-4 border-t">
                  {event.ticketTiers && event.ticketTiers.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Select Tickets</h3>
                      {event.ticketTiers.map((tier) => (
                        <div key={tier.name} className="flex flex-col space-y-2 p-3 border rounded-lg bg-background/50">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{tier.name}</p>
                              <p className="text-sm text-muted-foreground">{tier.description}</p>
                            </div>
                            <p className="font-bold">
                              {new Intl.NumberFormat('en-US', { style: 'currency', currency: event.currency || 'USD' }).format(tier.price)}
                            </p>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">
                              {(tier.quantity - (tier.sold || 0))} remain
                            </span>
                            {canRegister && eventAction === 'register' && (
                              <div className="flex items-center gap-3">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleTicketChange(tier.name, (selectedTickets[tier.name] || 0) - 1, (tier.quantity - (tier.sold || 0)))}
                                  disabled={(selectedTickets[tier.name] || 0) <= 0}
                                >
                                  -
                                </Button>
                                <span className="w-4 text-center">{selectedTickets[tier.name] || 0}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleTicketChange(tier.name, (selectedTickets[tier.name] || 0) + 1, (tier.quantity - (tier.sold || 0)))}
                                  disabled={(selectedTickets[tier.name] || 0) >= (tier.quantity - (tier.sold || 0))}
                                >
                                  +
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="flex-1 flex justify-between items-center">
                        <span className="font-medium text-lg">Price</span>
                        <span className="text-2xl font-bold text-primary">
                          {event.isFree ? 'Free' : `${new Intl.NumberFormat('en-US', { style: 'currency', currency: event.currency || 'USD' }).format(event.price || 0)}`}
                        </span>
                      </div>
                    </div>
                  )}
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
