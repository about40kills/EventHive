// API Types matching the backend models and responses

export interface User {
  id: string;
  name: string;
  email: string;
  role: "attendee" | "organizer";
  organizationType?: "individual" | "corporate";
  createdAt: string;
  paystackSubaccountCode?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    bankCode: string;
  };
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  category: string;
  eventType: "public" | "corporate";
  organizer: {
    _id: string;
    name: string;
    email: string;
  };
  date: string;
  time: string;
  location: string;
  isVirtual: boolean;
  capacity: number;
  registeredCount: number;
  image?: string;
  tags: string[];
  status: "draft" | "published" | "cancelled" | "completed";
  accessControl: {
    isPrivate: boolean;
    accessCode?: string;
    allowedDomains: string[];
  };
  isFree: boolean;
  price: number;
  currency: string;
  createdAt: string;
}

export interface Registration {
  _id: string;
  user: string;
  event: Event;
  status: "confirmed" | "cancelled" | "waitlist";
  paymentStatus: "pending" | "completed" | "failed" | "refunded" | "free";
  amountPaid: number;
  registrationDate: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ msg: string; param: string }>;
}

export interface EventsResponse {
  success: boolean;
  events: Event[];
}

export interface EventResponse {
  success: boolean;
  event: Event;
}

export interface RegistrationsResponse {
  success: boolean;
  registrations: Registration[];
}

export interface AttendeesResponse {
  success: boolean;
  attendees: Array<{
    name: string;
    email: string;
    registrationDate: string;
  }>;
  totalCount: number;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  role: "attendee" | "organizer";
  organizationType?: "individual" | "corporate";
}

export interface CreateEventForm {
  title: string;
  description: string;
  category: string;
  eventType: "public" | "corporate";
  date: string;
  time: string;
  location: string;
  isVirtual: boolean;
  capacity: number;
  isFree: boolean;
  price: number;
  currency: string;
  image?: string;
  tags: string[];
  status: "draft" | "published";
  accessControl: {
    isPrivate: boolean;
    accessCode?: string;
    allowedDomains: string[];
  };
}

export interface EventFilters {
  search?: string;
  category?: string;
  eventType?: string;
  status?: string;
}
