import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import type { EventFilters, CreateEventForm } from "../types/api";

// Query keys
export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (filters?: EventFilters) => [...eventKeys.lists(), filters] as const,
  details: () => [...eventKeys.all, "detail"] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  myEvents: () => [...eventKeys.all, "my-events"] as const,
  attendees: (id: string) => [...eventKeys.detail(id), "attendees"] as const,
};

// Attendee interface
interface Attendee {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  registrationDate: string;
  status?: 'confirmed' | 'pending' | 'cancelled';
  avatar?: string;
}

interface EventAttendeesResponse {
  success: boolean;
  attendees: Attendee[];
  totalCount: number;
}

// Get all events with optional filters
export function useEvents(filters?: EventFilters) {
  return useQuery({
    queryKey: eventKeys.list(filters),
    queryFn: () => apiClient.getEvents(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get single event by ID
export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => apiClient.getEvent(id),
    enabled: !!id,
  });
}

// Get organizer's events
export function useMyEvents() {
  const { user } = useAuth();

  return useQuery({
    queryKey: eventKeys.myEvents(),
    queryFn: () => apiClient.getMyEvents(),
    enabled: user?.role === 'organizer',
  });
}

// Get event attendees
export function useEventAttendees(eventId: string) {
  return useQuery({
    queryKey: eventKeys.attendees(eventId),
    queryFn: async (): Promise<EventAttendeesResponse> => {
      
      try {
        const response = await apiClient.getEventAttendees(eventId);
        const mappedAttendees = response.attendees.map((attendee: any) => ({
          _id: attendee._id ?? attendee.email, 
          name: attendee.name,
          email: attendee.email,
          phone: attendee.phone,
          registrationDate: attendee.registrationDate,
          status: attendee.status,
          avatar: attendee.avatar,
        }));
        return {
          ...response,
          attendees: mappedAttendees,
        };
      } catch (error) {
        throw error;
      }
    },
    enabled: !!eventId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Create event mutation
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventData: CreateEventForm) =>
      apiClient.createEvent(eventData),
    onSuccess: () => {
      // Invalidate and refetch events
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

// Update event mutation
export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateEventForm>;
    }) => apiClient.updateEvent(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate specific event and all events
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(id) });
      // Invalidate all event lists (with any filters)
      queryClient.invalidateQueries({ predicate: (query) =>
        Array.isArray(query.queryKey) && query.queryKey[0] === "events"
      });
      queryClient.invalidateQueries({ queryKey: eventKeys.myEvents() });
    },
  });
}

// Delete event mutation
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteEvent(id),
    onSuccess: () => {
      // Invalidate all event queries
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}
