import { Switch, Route } from "wouter";
import { ArrowRight } from "lucide-react";
import { apiClient } from "@/lib/api";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
// import { Hero } from "./components/Hero";
import { EventCard } from "./components/EventCard";
import { EventFilters } from "./components/EventFilters";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";
import { EventDetailsView } from "./components/EventDetailsView";
import { DashboardStats } from "./components/DashboardStats";
import { EventManagementTable } from "./components/EventManagementTable";
import { CreateEventForm } from "./components/CreateEventForm";
import { ForgotPasswordForm } from "./components/ForgotPasswordForm";
import { ResetPasswordForm } from "./components/ResetPasswordForm";
import { ConfirmationDialog } from "./components/ConfirmationDialog";
import { About } from "./pages/About";
import { PrivacyPolicy } from "./pages/legal/PrivacyPolicy";
import { TermsOfService } from "./pages/legal/TermsOfService";
import { CookiePolicy } from "./pages/legal/CookiePolicy";
import { Support } from "./pages/support/Support";
import { Button } from "./components/ui/button";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "./hooks/use-toast";
import { useEvents, useEvent, useMyEvents, useDeleteEvent } from "./hooks/useEvents";
import { useMyRegistrations, useRegisterForEvent, useCancelRegistration, useVerifyPayment } from "./hooks/useRegistrations";
import type { EventFilters as EventFiltersType } from "./types/api";
import { EditEventForm } from "./components/EditEventForm";
import { EventAttendeesPage } from "./components/EventAttendeesPage";
import { PayoutSettings } from "./components/PayoutSettings";
import { TicketVerifier } from "./components/TicketVerifier";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

// Import event images
import businessEvent from '../../attached_assets/generated_images/Business_conference_presentation_event_e6f329f2.png';
import concertEvent from '../../attached_assets/generated_images/Live_music_concert_event_aacc7e97.png';
import techWorkshop from '../../attached_assets/generated_images/Tech_workshop_training_session_a37358c6.png';
import networkingEvent from '../../attached_assets/generated_images/Corporate_networking_mixer_event_c61b902e.png';
import artEvent from '../../attached_assets/generated_images/Art_gallery_exhibition_event_0dcb9354.png';

// Scroll to top on route change
function ScrollToTop() {
    const [location] = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    return null;
}


import { HeroModern } from "./components/landing/HeroModern";
import { FeaturesGrid } from "./components/landing/FeaturesGrid";

function HomePage() {
    const { isAuthenticated, user } = useAuth();
    const [, setLocation] = useLocation();
    const { data: eventsData, isLoading } = useEvents({ status: 'published' });
    const featuredEvents = eventsData?.events?.slice(0, 3) || [];

    useEffect(() => {
        if (isAuthenticated) {
            setLocation('/dashboard');
        }
    }, [isAuthenticated, setLocation]);

    if (isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <HeroModern
                onCtaClick={() => setLocation('/events')}
                onSecondaryCtaClick={() => setLocation('/login?tab=register_organizer')}
            />

            <FeaturesGrid />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Trending Now</h2>
                        <p className="text-muted-foreground">Don't miss the hottest events of the week.</p>
                    </div>
                    <Button variant="ghost" onClick={() => setLocation('/events')} className="group">
                        View All Events <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-[400px] bg-muted animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuredEvents.map((event) => (
                            <EventCard
                                key={event._id}
                                id={event._id}
                                title={event.title}
                                description={event.description}
                                category={event.category}
                                eventType={event.eventType}
                                date={new Date(event.date)}
                                time={event.time}
                                location={event.location}
                                capacity={event.capacity}
                                registeredCount={event.registeredCount}
                                imageUrl={event.image || businessEvent}
                                isVirtual={event.isVirtual}
                                isFree={event.isFree}
                                price={event.price}
                                currency={event.currency}
                                organizerName={event.organizer.name}
                                organizerId={event.organizer._id}
                                currentUserId={user?.id}
                                onRegister={() => setLocation(`/events/${event._id}`)}
                                onViewDetails={() => setLocation(`/events/${event._id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <section className="bg-muted py-24 mb-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Create Your Own Experience?</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
                        Join thousands of organizers who use EventHive to run successful events.
                        From ticketing to check-in, we've got you covered.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="px-8" onClick={() => setLocation('/register')}>
                            Start for Free
                        </Button>
                        <Button size="lg" variant="outline" onClick={() => setLocation('/about')}>
                            Learn More
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}

function EventsPage() {
    const { user } = useAuth();
    const [filters, setFilters] = useState<EventFiltersType>({});
    const [, setLocation] = useLocation();

    // For organizers, use useMyEvents to get only their events
    // For attendees, use useEvents to get all available events
    const { data: allEventsData, isLoading: allEventsLoading } = useEvents(filters);
    const { data: myEventsData, isLoading: myEventsLoading } = useMyEvents();

    const isLoading = user?.role === 'organizer' ? myEventsLoading : allEventsLoading;
    const eventsData = user?.role === 'organizer' ? myEventsData : allEventsData;
    const events = eventsData?.events || [];

    const handleFilterChange = (newFilters: Partial<EventFiltersType>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">
                    {user?.role === 'organizer' ? 'My Events' : 'Discover Events'}
                </h1>
                <p className="text-muted-foreground">
                    {user?.role === 'organizer'
                        ? 'Manage and view your created events'
                        : 'Find amazing events happening around you'
                    }
                </p>
            </div>

            {user?.role !== 'organizer' && (
                <EventFilters onFilterChange={handleFilterChange} />
            )}

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <EventCard
                            key={event._id}
                            id={event._id}
                            title={event.title}
                            description={event.description}
                            category={event.category}
                            eventType={event.eventType}
                            date={new Date(event.date)}
                            time={event.time}
                            location={event.location}
                            capacity={event.capacity}
                            registeredCount={event.registeredCount}
                            imageUrl={event.image || businessEvent}
                            isVirtual={event.isVirtual}
                            isFree={event.isFree}
                            price={event.price}
                            currency={event.currency}
                            organizerName={event.organizer.name}
                            organizerId={event.organizer._id}
                            currentUserId={user?.id}
                            onRegister={() => setLocation(`/events/${event._id}`)}
                            onViewDetails={() => setLocation(`/events/${event._id}`)}
                        />
                    ))}
                </div>
            )}

            {!isLoading && events.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">
                        {user?.role === 'organizer'
                            ? 'You haven\'t created any events yet'
                            : 'No events found matching your filters'
                        }
                    </p>
                    {user?.role === 'organizer' && (
                        <Button
                            className="mt-4"
                            onClick={() => setLocation('/create-event')}
                        >
                            Create Your First Event
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

function EventDetailsPage({ params }: { params: { id: string } }) {
    const { user } = useAuth();
    const [, setLocation] = useLocation();
    const { data: eventData, isLoading } = useEvent(params.id);
    const { data: registrationsData } = useMyRegistrations();
    const registerMutation = useRegisterForEvent();
    const cancelMutation = useCancelRegistration();
    const verifyPaymentMutation = useVerifyPayment();
    const deleteMutation = useDeleteEvent();
    const { toast } = useToast();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const success = searchParams.get('success');
        const reference = searchParams.get('reference');

        if (success === 'true' && reference) {
            verifyPaymentMutation.mutate(reference, {
                onSuccess: () => {
                    toast({
                        title: "Payment Successful",
                        description: "Your registration has been confirmed!",
                    });
                    // Clean URL
                    window.history.replaceState({}, '', `/events/${params.id}`);
                },
                onError: (error: any) => {
                    toast({
                        title: "Verification Failed",
                        description: error.message || "Could not verify payment.",
                        variant: "destructive",
                    });
                }
            });
        }
    }, [params.id]);

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-64 bg-muted rounded-lg" />
                    <div className="h-8 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                </div>
            </div>
        );
    }

    if (!eventData?.success || !eventData.event) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Event not found</h1>
                    <p className="text-muted-foreground">The event you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    const event = eventData.event;
    const isEventOrganizer = user && event.organizer._id === user.id;
    const isRegistered = registrationsData?.registrations?.some(
        reg => reg.event._id === event._id
    ) || false;

    const handleRegister = async (selectedTickets?: any[]) => {
        if (!user) {
            setLocation('/login');
            return;
        }

        // Prevent organizers from registering for any events
        if (user.role === 'organizer') {
            toast({
                title: "Action not allowed",
                description: "Organizers cannot register for events. You can only manage your own events.",
                variant: "destructive",
            });
            return;
        }

        try {
            if (event.isFree) {
                await registerMutation.mutateAsync({ eventId: event._id });
                toast({
                    title: "Registration successful!",
                    description: "You have been registered for this event.",
                });
            } else {
                // Handle payment for paid events
                const { url } = await apiClient.createCheckoutSession(event._id, selectedTickets);
                if (url) {
                    window.location.href = url;
                } else {
                    throw new Error("Failed to initiate payment");
                }
            }
        } catch (error) {
            console.error('Registration/Payment failed:', error);
            toast({
                title: "Registration failed",
                description: "Could not complete registration. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleCancelRegistration = async () => {
        try {
            await cancelMutation.mutateAsync(event._id);
            toast({
                title: "Registration cancelled",
                description: "Your registration has been cancelled.",
            });
        } catch (error) {
            console.error('Cancellation failed:', error);
        }
    };

    const handleDeleteEvent = async () => {
        try {
            await deleteMutation.mutateAsync(event._id);
            toast({
                title: "Event deleted",
                description: "Your event has been successfully deleted.",
            });
            setLocation('/events');
        } catch (error) {
            console.error('Delete failed:', error);
            toast({
                title: "Delete failed",
                description: "Failed to delete the event. Please try again.",
                variant: "destructive",
            });
        } finally {
            setShowDeleteDialog(false);
        }
    };

    // Determine which action to show based on user role and relationship to event
    const getEventAction = () => {
        if (!user) {
            return 'login-required';
        }

        if (isEventOrganizer) {
            return 'delete';
        }

        if (user.role === 'organizer') {
            return 'organizer-no-register';
        }

        if (isRegistered) {
            return 'cancel-registration';
        }

        if (event.registeredCount >= event.capacity) {
            return 'waitlist';
        }

        return 'register';
    };

    const eventAction = getEventAction();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <EventDetailsView
                event={{
                    id: event._id,
                    title: event.title,
                    description: event.description,
                    category: event.category,
                    eventType: event.eventType,
                    date: new Date(event.date),
                    time: event.time,
                    location: event.location,
                    capacity: event.capacity,
                    registeredCount: event.registeredCount,
                    imageUrl: event.image || businessEvent,
                    isVirtual: event.isVirtual,
                    isPrivate: event.accessControl.isPrivate,
                    tags: event.tags,
                    organizer: {
                        name: event.organizer.name,
                        email: event.organizer.email,
                    },
                    isFree: event.isFree,
                    price: event.price,
                    currency: event.currency,
                    ticketTiers: event.ticketTiers,
                }}
                isRegistered={isRegistered}
                canRegister={eventAction === 'register'}
                eventAction={eventAction}
                onRegister={handleRegister}
                onCancelRegistration={handleCancelRegistration}
                onDeleteEvent={() => setShowDeleteDialog(true)}
            />

            <ConfirmationDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                title="Delete Event"
                description="Are you sure you want to delete this event? This action cannot be undone and all registrations will be lost."
                confirmText="Delete Event"
                onConfirm={handleDeleteEvent}
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}

function AttendeeDashboard() {
    const { user } = useAuth();
    const { data: registrationsData, isLoading } = useMyRegistrations();
    const registrations = registrationsData?.registrations || [];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
                <p className="text-muted-foreground">Manage your event registrations</p>
            </div>

            <DashboardStats
                role="attendee"
                stats={{
                    registeredEvents: registrations.length,
                    upcomingEvents: registrations.filter(r => new Date(r.event.date) > new Date()).length,
                    totalEvents: registrations.filter(r => new Date(r.event.date) <= new Date()).length,
                }}
            />

            <div>
                <h2 className="text-xl font-semibold mb-4">My Registered Events</h2>
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {registrations.map((registration) => (
                            <EventCard
                                key={registration._id}
                                id={registration.event._id}
                                title={registration.event.title}
                                description={registration.event.description}
                                category={registration.event.category}
                                eventType={registration.event.eventType}
                                date={new Date(registration.event.date)}
                                time={registration.event.time}
                                location={registration.event.location}
                                capacity={registration.event.capacity}
                                registeredCount={registration.event.registeredCount}
                                imageUrl={registration.event.image || businessEvent}
                                isVirtual={registration.event.isVirtual}
                                isFree={registration.event.isFree}
                                price={registration.event.price}
                                currency={registration.event.currency}
                                organizerName={registration.event.organizer.name}
                                organizerId={registration.event.organizer._id}
                                currentUserId={user?.id}
                                onRegister={() => { }}
                                onViewDetails={() => window.location.href = `/events/${registration.event._id}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function OrganizerDashboard() {
    const [, setLocation] = useLocation();
    const { data: eventsData, isLoading } = useMyEvents();
    const deleteMutation = useDeleteEvent();
    const { toast } = useToast();
    const events = eventsData?.events || [];
    const [deleteEventId, setDeleteEventId] = useState<string | null>(null);

    const organizerEvents = events.map(e => ({
        id: e._id,
        title: e.title,
        date: new Date(e.date),
        status: e.status as 'draft' | 'published' | 'cancelled' | 'completed',
        registeredCount: e.registeredCount,
        capacity: e.capacity,
        price: e.price,
        currency: e.currency,
        isFree: e.isFree,
    }));

    const handleEdit = (eventId: string) => {
        setLocation(`/events/edit/${eventId}`);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteEventId) return;

        try {
            await deleteMutation.mutateAsync(deleteEventId);
            toast({
                title: "Event deleted",
                description: "Your event has been successfully deleted.",
            });
        } catch (error) {
            console.error('Delete failed:', error);
            toast({
                title: "Delete failed",
                description: "Failed to delete the event. Please try again.",
                variant: "destructive",
            });
        } finally {
            setDeleteEventId(null);
        }
    };

    const handleDelete = (eventId: string) => {
        setDeleteEventId(eventId);
    };

    const handleViewAttendees = (eventId: string) => {
        setLocation(`/events/${eventId}/attendees`);
    };

    const handleVerify = (eventId: string) => {
        setLocation(`/events/verify`);
    };

    const selectedEvent = events.find(e => e._id === deleteEventId);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Organizer Dashboard</h1>
                    <p className="text-muted-foreground">Manage your events and attendees</p>
                </div>
                <Button onClick={() => setLocation('/create-event')} data-testid="button-create-event">
                    Create Event
                </Button>
            </div>

            <Tabs defaultValue="events" className="w-full">
                <TabsList>
                    <TabsTrigger value="events">My Events</TabsTrigger>
                    <TabsTrigger value="payouts">Payout Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="events" className="space-y-8 mt-4 animate-in fade-in slide-in-from-left-4 duration-300">
                    <DashboardStats
                        role="organizer"
                        stats={{
                            totalEvents: events.length,
                            totalAttendees: events.reduce((sum, e) => sum + e.registeredCount, 0),
                            activeEvents: events.filter(e => e.status === 'published').length,
                            upcomingEvents: events.filter(e => new Date(e.date) > new Date()).length,
                        }}
                    />

                    <div>
                        <h2 className="text-xl font-semibold mb-4">My Events</h2>
                        {isLoading ? (
                            <div className="animate-pulse space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-16 bg-muted rounded-lg" />
                                ))}
                            </div>
                        ) : (
                            <EventManagementTable
                                events={organizerEvents}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onViewAttendees={handleViewAttendees}
                                onVerify={handleVerify}
                            />
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="payouts" className="mt-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <PayoutSettings />
                </TabsContent>
            </Tabs>

            <ConfirmationDialog
                open={!!deleteEventId}
                onOpenChange={(open) => !open && setDeleteEventId(null)}
                title="Delete Event"
                description={`Are you sure you want to delete "${selectedEvent?.title}"? This action cannot be undone!`}
                confirmText="Delete Event"
                onConfirm={handleDeleteConfirm}
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}

function CreateEventPage() {
    const [, setLocation] = useLocation();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <CreateEventForm
                onSubmit={(data) => {
                    console.log('Event created:', data);
                    setLocation('/dashboard');
                }}
            />
        </div>
    );
}

function Router() {
    const { user, isAuthenticated, logout } = useAuth();
    const [location] = useLocation();
    const isHome = location === '/';

    return (
        <div className="min-h-screen flex flex-col">
            <Header
                isAuthenticated={isAuthenticated}
                userRole={user?.role || 'attendee'}
                userName={user?.name || ''}
                onLogout={logout}
            />
            <main className={`flex-1 flex flex-col ${!isHome ? 'pt-16' : ''}`}>
                <ScrollToTop />
                <Switch>
                    <Route path="/" component={HomePage} />
                    <Route path="/events" component={EventsPage} />
                    <Route
                        path="/events/:id/edit"
                        component={(props: { params: { id: string } }) => (
                            <EditEventForm eventId={props.params.id} />
                        )}
                    />
                    <Route path="/events/:id/attendees" component={EventAttendeesPage} />
                    <Route path="/events/verify" component={TicketVerifier} />
                    <Route path="/events/:id" component={EventDetailsPage} />
                    <Route path="/about" component={About} />
                    <Route path="/legal/privacy" component={PrivacyPolicy} />
                    <Route path="/legal/terms" component={TermsOfService} />
                    <Route path="/legal/cookies" component={CookiePolicy} />
                    <Route path="/support" component={Support} />
                    <Route path="/login">
                        <LoginForm />
                    </Route>
                    <Route path="/register">
                        <RegisterForm />
                    </Route>
                    <Route path="/dashboard">
                        {user?.role === 'organizer' ? <OrganizerDashboard /> : <AttendeeDashboard />}
                    </Route>
                    <Route path="/create-event" component={CreateEventPage} />
                    <Route path="/forgot-password" component={ForgotPasswordForm} />
                    <Route path="/reset-password/:token">
                        {(params) => <ResetPasswordForm token={params.token} />}
                    </Route>
                    <Route
                        path="/events/edit/:id"
                        component={(props: any) => <EditEventForm eventId={props.params.id} />}
                    />
                    <Route>
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <h1 className="text-4xl font-bold mb-4">404</h1>
                                <p className="text-muted-foreground">Page not found</p>
                            </div>
                        </div>
                    </Route>
                </Switch>
            </main>
            <Footer />
            <Toaster />
        </div>
    );
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <AuthProvider>
                    <Router />
                </AuthProvider>
            </TooltipProvider>
        </QueryClientProvider>
    );
}

export default App;