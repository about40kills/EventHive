import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
import { eventKeys } from "./useEvents";

// Query keys
export const registrationKeys = {
  all: ["registrations"] as const,
  myRegistrations: () => [...registrationKeys.all, "my-registrations"] as const,
  eventAttendees: (eventId: string) =>
    [...registrationKeys.all, "attendees", eventId] as const,
};

// Get user's registrations
export function useMyRegistrations() {
  return useQuery({
    queryKey: registrationKeys.myRegistrations(),
    queryFn: () => apiClient.getMyRegistrations(),
  });
}

// Get event attendees (organizer only)
export function useEventAttendees(eventId: string) {
  return useQuery({
    queryKey: registrationKeys.eventAttendees(eventId),
    queryFn: () => apiClient.getEventAttendees(eventId),
    enabled: !!eventId,
  });
}

// Register for event mutation
export function useRegisterForEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      accessCode,
    }: {
      eventId: string;
      accessCode?: string;
    }) => apiClient.registerForEvent(eventId, accessCode),
    onSuccess: (_, { eventId }) => {
      // Invalidate registrations and event details
      queryClient.invalidateQueries({
        queryKey: registrationKeys.myRegistrations(),
      });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}

// Cancel registration mutation
export function useCancelRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => apiClient.cancelRegistration(eventId),
    onSuccess: (_, eventId) => {
      // Invalidate registrations and event details
      queryClient.invalidateQueries({
        queryKey: registrationKeys.myRegistrations(),
      });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}


// Verify payment mutation
export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reference: string) => apiClient.verifyPayment(reference),
    onSuccess: (data) => {
      // Invalidate registrations and event details
      queryClient.invalidateQueries({
        queryKey: registrationKeys.myRegistrations(),
      });
      if (data.registration?.event) {
        queryClient.invalidateQueries({ queryKey: eventKeys.detail(data.registration.event) });
        queryClient.invalidateQueries({ queryKey: eventKeys.attendees(data.registration.event) });
      }
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.myEvents() });
    },
  });
}
