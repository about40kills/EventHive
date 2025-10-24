import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar, Upload, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useCreateEvent } from "../hooks/useEvents"; 
import { useToast } from "@/hooks/use-toast";
import type { CreateEventForm as CreateEventFormType } from "../types/api";
import { set } from "date-fns";

interface CreateEventFormProps {
  onSubmit?: (data: EventFormData) => void;
  initialData?: Partial<EventFormData>;
  isLoading?: boolean;
}

export interface EventFormData {
  title: string;
  description: string;
  category: string;
  eventType: 'public' | 'corporate';
  date: string;
  time: string;
  location: string;
  capacity: number;
  isVirtual: boolean;
  isPrivate: boolean;
  accessCode?: string;
  allowedDomains?: string;
  tags?: string;
  image?: File;
}

const categories = [
  'Technology',
  'Business',
  'Arts & Culture',
  'Music',
  'Sports',
  'Education',
  'Networking',
  'Lifestyle',
  'Health & Wellness',
  'Food & Drink',
  'Travel & Adventure',
  'Science & Innovation',
];

export function CreateEventForm({ onSubmit, initialData, isLoading }: CreateEventFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    eventType: initialData?.eventType || 'public',
    date: initialData?.date || '',
    time: initialData?.time || '',
    location: initialData?.location || '',
    capacity: initialData?.capacity || 50,
    isVirtual: initialData?.isVirtual || false,
    isPrivate: initialData?.isPrivate || false,
    accessCode: initialData?.accessCode || '',
    allowedDomains: initialData?.allowedDomains || '',
    tags: initialData?.tags || '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [descriptionError, setDescriptionError] = useState('');
  const createEventMutation = useCreateEvent();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  //validation function for description length
  const validateDescription = (description: string) => {
    if (!description || description.trim() === '') {
      return "Description is required.";
    }

    const wordCount = description.trim().split(/\s+/).length;
    if (wordCount < 5) {
      return "Description must be at least 5 words.";
    }

    return '';
  };

  //handle description change with validation
  const handleDescriptionChange = (value: string) => {
    setFormData({ ...formData, description: value });
    const error= validateDescription(value);
    setDescriptionError(error);
  };

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken'); 
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please log in to create an event.",
          variant: "destructive",
        });
        setLocation('/login');
        return;
      }

      try {
        // Verify token is still valid
        const response = await fetch('http://localhost:3001/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          // Token is invalid
          localStorage.removeItem('authToken'); 
          toast({
            title: "Session expired",
            description: "Please log in again to create an event.",
            variant: "destructive",
          });
          setLocation('/login');
          return;
        }

        // User is authenticated
        setIsCheckingAuth(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('authToken');  
        setLocation('/login');
      }
    };

    checkAuth();
  }, [setLocation, toast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setFormData({ ...formData, image: file });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: undefined });
    setImagePreview(null);
  };

  const handleCancel = () => {
    setLocation('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
// Validate description before submitting
    const descError = validateDescription(formData.description);
    if (descError) {
      setDescriptionError(descError);
      toast({
        title: "Invalid description",
        description: descError,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('authToken'); 
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Create FormData for file upload
      const submitData = new FormData();
      
      // Append all form fields
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('eventType', formData.eventType);
      submitData.append('date', formData.date);
      submitData.append('time', formData.time);
      submitData.append('location', formData.location);
      submitData.append('isVirtual', formData.isVirtual.toString());
      submitData.append('capacity', formData.capacity.toString());
      submitData.append('status', 'published');
      
      // Handle tags
      if (formData.tags) {
        const tags = formData.tags.split(',').map(tag => tag.trim());
        submitData.append('tags', JSON.stringify(tags));
      }

      // Handle access control
      const accessControl = {
        isPrivate: formData.isPrivate,
        accessCode: formData.accessCode || undefined,
        allowedDomains: formData.allowedDomains
          ? formData.allowedDomains.split(',').map(domain => domain.trim())
          : [],
      };
      submitData.append('accessControl', JSON.stringify(accessControl));

      // Append image file if selected
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      const response = await fetch('http://localhost:3001/api/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: submitData,
      });

      const result = await response.json();
      console.log('Event creation response:', result);

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid during request
          localStorage.removeItem('authToken');
          setLocation('/login');
          toast({
            title: "Session expired",
            description: "Please log in again to create an event.",
            variant: "destructive",
          });
          return;
        }
        throw new Error(result.message || 'Failed to create event');
      }

      toast({
        title: "Event created successfully!",
        description: "Your event has been published and is now visible to users.",
      });

      onSubmit?.(formData);
      setLocation('/events');
      
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Failed to create event",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              {initialData ? 'Edit Event' : 'Create New Event'}
            </CardTitle>
            <CardDescription>
              Fill in the details to {initialData ? 'update your' : 'create a new'} event
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    placeholder="Tech Innovation Summit 2024"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    data-testid="input-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (optional)</Label>
                  <Input
                    id="tags"
                    placeholder="AI, Innovation, Networking"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    data-testid="input-tags"
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated tags</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your event..."
                  value={formData.description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  required
                  rows={4}
                  data-testid="input-description"
                  className={descriptionError ? "border-destructive" : ""}
                />
                {descriptionError && (
                  <p className="text-sm text-destructive">{descriptionError}</p>
                )}
              </div>

              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label htmlFor="image">Event Image</Label>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      data-testid="input-image"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image')?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Choose Image
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Max 5MB • JPG, PNG, GIF
                    </span>
                  </div>

                  {imagePreview && (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Event preview"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={removeImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category" data-testid="select-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventType">Event Type *</Label>
                  <Select
                    value={formData.eventType}
                    onValueChange={(value: 'public' | 'corporate') => setFormData({ ...formData, eventType: value })}
                  >
                    <SelectTrigger id="eventType" data-testid="select-event-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    data-testid="input-date"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    placeholder="9:00 AM - 5:00 PM"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                    data-testid="input-time"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="Convention Center, Hall A"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    data-testid="input-location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    required
                    data-testid="input-capacity"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="isVirtual" className="cursor-pointer">Virtual Event</Label>
                    <p className="text-sm text-muted-foreground">Event will be held online</p>
                  </div>
                  <Switch
                    id="isVirtual"
                    checked={formData.isVirtual}
                    onCheckedChange={(checked) => setFormData({ ...formData, isVirtual: checked })}
                    data-testid="switch-virtual"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="isPrivate" className="cursor-pointer">Private Event</Label>
                    <p className="text-sm text-muted-foreground">Require access code or email domain</p>
                  </div>
                  <Switch
                    id="isPrivate"
                    checked={formData.isPrivate}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPrivate: checked })}
                    data-testid="switch-private"
                  />
                </div>
              </div>

              {formData.isPrivate && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <div className="space-y-2">
                    <Label htmlFor="accessCode">Access Code (optional)</Label>
                    <Input
                      id="accessCode"
                      placeholder="Enter access code"
                      value={formData.accessCode}
                      onChange={(e) => setFormData({ ...formData, accessCode: e.target.value })}
                      data-testid="input-access-code"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allowedDomains">Allowed Email Domains (optional)</Label>
                    <Input
                      id="allowedDomains"
                      placeholder="company.com, partner.com"
                      value={formData.allowedDomains}
                      onChange={(e) => setFormData({ ...formData, allowedDomains: e.target.value })}
                      data-testid="input-domains"
                    />
                    <p className="text-xs text-muted-foreground">Comma-separated domains</p>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting || isLoading}
                  data-testid="button-submit"
                >
                  {isSubmitting ? 'Creating Event...' : initialData ? 'Update Event' : 'Create Event'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
