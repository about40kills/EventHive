// API client for EventHive backend
import type {
  AuthResponse,
  LoginForm,
  RegisterForm,
  EventsResponse,
  EventResponse,
  CreateEventForm,
  Event,
  RegistrationsResponse,
  AttendeesResponse,
  EventFilters,
} from "../types/api";

export const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";
const API_BASE_URL = `${SERVER_URL}/api`;

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem("authToken");
  }

  private getHeaders(includeContentType = true): HeadersInit {
    const headers: HeadersInit = {};

    if (includeContentType) {
      headers["Content-Type"] = "application/json";
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;


    const isFormData = options.body instanceof FormData;

    const config: RequestInit = {
      headers: this.getHeaders(!isFormData),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Auth methods
  async login(credentials: LoginForm): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.success && response.token) {
      this.token = response.token;
      localStorage.setItem("authToken", response.token);
    }

    return response;
  }

  async register(userData: RegisterForm): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (response.success && response.token) {
      this.token = response.token;
      localStorage.setItem("authToken", response.token);
    }

    return response;
  }

  async getMe(): Promise<{ success: boolean; user: any }> {
    return this.request("/auth/me");
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem("authToken");
  }

  // Event methods
  async getEvents(filters?: EventFilters): Promise<EventsResponse> {
    const params = new URLSearchParams();

    if (filters?.search) params.append("search", filters.search);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.eventType) params.append("eventType", filters.eventType);
    if (filters?.status) params.append("status", filters.status);

    const queryString = params.toString();
    const endpoint = queryString ? `/events?${queryString}` : "/events";

    return this.request<EventsResponse>(endpoint);
  }

  async getEvent(id: string): Promise<EventResponse> {
    return this.request<EventResponse>(`/events/${id}`);
  }

  async createEvent(eventData: CreateEventForm | FormData): Promise<EventResponse> {
    let body: string | FormData;

    if (eventData instanceof FormData) {
      // If FormData is passed directly, use it
      body = eventData;
    } else {
      // Convert to JSON for regular data
      body = JSON.stringify(eventData);
    }

    return this.request<EventResponse>("/events", {
      method: "POST",
      body,
    });
  }

  async updateEvent(
    id: string,
    eventData: Partial<CreateEventForm>
  ): Promise<EventResponse> {
    return this.request<EventResponse>(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    return this.request(`/events/${id}`, {
      method: "DELETE",
    });
  }

  async getMyEvents(): Promise<EventsResponse> {
    return this.request<EventsResponse>("/events/my-events");
  }

  // Registration methods
  async registerForEvent(
    eventId: string,
    accessCode?: string
  ): Promise<{
    success: boolean;
    message: string;
    registration: any;
  }> {
    const body = accessCode ? JSON.stringify({ accessCode }) : undefined;

    return this.request(`/registrations/${eventId}`, {
      method: "POST",
      body,
    });
  }

  async cancelRegistration(eventId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request(`/registrations/${eventId}`, {
      method: "DELETE",
    });
  }

  async getMyRegistrations(): Promise<RegistrationsResponse> {
    return this.request<RegistrationsResponse>(
      "/registrations/my-registrations"
    );
  }

  async getEventAttendees(eventId: string): Promise<AttendeesResponse> {
    return this.request<AttendeesResponse>(
      `/registrations/event/${eventId}/attendees`
    );
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }
}

export const apiClient = new ApiClient();
