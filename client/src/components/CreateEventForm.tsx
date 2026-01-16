import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Upload, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateEvent } from "../hooks/useEvents";
import { useToast } from "@/hooks/use-toast";
import type { CreateEventForm as CreateEventFormType } from "../types/api";
import { set } from "date-fns";
import { SERVER_URL } from "@/lib/api";

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
  isFree?: boolean;
  price?: number;
  currency?: string;
  ticketTiers?: Array<{
    name: string;
    price?: number;
    quantity: number;
    description?: string;
  }>;
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


const currencies = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'GHS', name: 'Ghanaian Cedi' },
  { code: 'NGN', name: 'Nigerian Naira' },
  { code: 'ZAR', name: 'South African Rand' },
  { code: 'KES', name: 'Kenyan Shilling' },
  { code: 'UGX', name: 'Ugandan Shilling' },
  { code: 'TZS', name: 'Tanzanian Shilling' },
  { code: 'RWF', name: 'Rwandan Franc' },
  { code: 'XOF', name: 'West African CFA Franc' },
  { code: 'XAF', name: 'Central African CFA Franc' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'SAR', name: 'Saudi Riyal' },
];

export function CreateEventForm({ onSubmit, initialData, isLoading }: CreateEventFormProps) {
  const { user } = useAuth(); // Get user from auth context
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
    isFree: initialData?.isFree ?? true,
    price: initialData?.price || undefined,
    currency: initialData?.currency || 'GHS',
    ticketTiers: initialData?.ticketTiers || [],
  });

  const [isUnlimitedCapacity, setIsUnlimitedCapacity] = useState(false);

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
    const error = validateDescription(value);
    setDescriptionError(error);
  };

  // Check authentication on component mount
  useEffect(() => {
    if (!user && !localStorage.getItem('authToken')) {
      setLocation('/login');
    } else {
      setIsCheckingAuth(false);
    }
  }, [user, setLocation]);

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

    // Check for Payout Account if event is Paid
    if (!(formData.isFree ?? true) && !user?.paystackSubaccountCode) {
      toast({
        title: "Payout Account Required",
        description: "You must set up your bank details in Payout Settings to create paid events.",
        variant: "destructive",
      });
      return;
    }

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
      submitData.append('isFree', (formData.isFree ?? true).toString());
      if (!(formData.isFree ?? true)) {
        if (formData.ticketTiers && formData.ticketTiers.length > 0) {
          // Validate tiers
          const isValidTiers = formData.ticketTiers.every(t => t.name && t.quantity > 0 && t.price !== undefined && t.price >= 0);
          if (!isValidTiers) {
            toast({
              title: "Validation Error",
              description: "Please fill in all ticket tier details correctly (Price and Quantity).",
              variant: "destructive",
            });
            setIsSubmitting(false);
            return;
          }

          // Validate total ticket quantity vs capacity
          const totalTicketQuantity = formData.ticketTiers.reduce((sum, tier) => sum + tier.quantity, 0);
          if (totalTicketQuantity > formData.capacity) {
            setIsSubmitting(false);
            return;
          }

          submitData.append('ticketTiers', JSON.stringify(formData.ticketTiers));
          // Also set price to first tier or average for sorting/display
          submitData.append('price', (formData.ticketTiers[0].price || 0).toString());
        } else {
          submitData.append('price', (formData.price || 0).toString());
        }
        submitData.append('currency', formData.currency || 'USD');
      }

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

      const response = await fetch(`${SERVER_URL}/api/events`, {
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
                    className="w-full"
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
                    className="w-full"
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
                  <div className="space-y-3">
                    <Label htmlFor="capacity">Capacity *</Label>
                    <Input
                      id="capacity"
                      type={isUnlimitedCapacity ? "text" : "number"}
                      min="1"
                      disabled={isUnlimitedCapacity}
                      value={isUnlimitedCapacity ? "Unlimited" : formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                      required={!isUnlimitedCapacity}
                      placeholder="Enter capacity"
                      data-testid="input-capacity"
                      className={(formData.ticketTiers || []).reduce((sum, tier) => sum + tier.quantity, 0) > formData.capacity ? "border-destructive" : ""}
                    />
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="unlimited"
                        checked={isUnlimitedCapacity}
                        onCheckedChange={(checked) => {
                          setIsUnlimitedCapacity(checked as boolean);
                          if (checked) {
                            setFormData({ ...formData, capacity: 1000000 });
                          } else {
                            setFormData({ ...formData, capacity: 50 });
                          }
                        }}
                      />
                      <label
                        htmlFor="unlimited"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Unlimited capacity
                      </label>
                    </div>
                    {!(formData.isFree ?? true) && (formData.ticketTiers || []).reduce((sum, tier) => sum + tier.quantity, 0) > formData.capacity && (
                      <p className="text-sm text-destructive font-medium">
                        Total ticket quantity ({(formData.ticketTiers || []).reduce((sum, tier) => sum + tier.quantity, 0)}) exceeds event capacity ({formData.capacity === 1000000 ? 'Unlimited' : formData.capacity}).
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="isFree" className="cursor-pointer">Free Event</Label>
                    <p className="text-sm text-muted-foreground">This event is free to attend</p>
                  </div>
                  <Switch
                    id="isFree"
                    checked={formData.isFree}
                    onCheckedChange={(checked) => setFormData({ ...formData, isFree: checked })}
                    data-testid="switch-free"
                  />
                </div>

                {!(formData.isFree ?? true) && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <Label>Ticket Categories</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newTiers = [...(formData.ticketTiers || [])];
                            newTiers.push({ name: '', price: undefined, quantity: 10, description: '' });
                            setFormData({ ...formData, ticketTiers: newTiers });
                          }}
                        >
                          + Add Category
                        </Button>
                      </div>

                      {formData.ticketTiers && formData.ticketTiers.length > 0 ? (
                        <div className="space-y-3">
                          {formData.ticketTiers.map((tier, index) => (
                            <div key={index} className="flex gap-2 items-start p-3 border rounded bg-background">
                              <div className="grid grid-cols-12 gap-2 flex-1">
                                <div className="col-span-4">
                                  <Label className="text-xs">Name</Label>
                                  <Input
                                    placeholder="e.g. VIP"
                                    value={tier.name}
                                    onChange={(e) => {
                                      const newTiers = [...(formData.ticketTiers || [])];
                                      newTiers[index].name = e.target.value;
                                      setFormData({ ...formData, ticketTiers: newTiers });
                                    }}
                                    required
                                  />
                                </div>
                                <div className="col-span-3">
                                  <Label className="text-xs">Price</Label>
                                  <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={tier.price ?? ''}
                                    onChange={(e) => {
                                      const newTiers = [...(formData.ticketTiers || [])];
                                      newTiers[index].price = e.target.value === '' ? undefined : parseFloat(e.target.value);
                                      setFormData({ ...formData, ticketTiers: newTiers });
                                    }}
                                    required
                                  />
                                </div>
                                <div className="col-span-3">
                                  <Label className="text-xs">Quantity</Label>
                                  <Input
                                    type="number"
                                    placeholder="Qty"
                                    value={tier.quantity}
                                    onChange={(e) => {
                                      const newTiers = [...(formData.ticketTiers || [])];
                                      newTiers[index].quantity = parseInt(e.target.value);
                                      setFormData({ ...formData, ticketTiers: newTiers });
                                    }}
                                  />
                                </div>
                                <div className="col-span-2 flex items-end">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive"
                                    onClick={() => {
                                      const newTiers = [...(formData.ticketTiers || [])];
                                      newTiers.splice(index, 1);
                                      setFormData({ ...formData, ticketTiers: newTiers });
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">Standard Pricing (Single Category)</p>
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 space-y-2">
                              <Label htmlFor="price">Price *</Label>
                              <Input
                                id="price"
                                type="number"
                                min="0.01"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.price || ''}
                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                required={!formData.ticketTiers?.length}
                                data-testid="input-price"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="w-full md:w-1/3 space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                          value={formData.currency}
                          onValueChange={(value) => setFormData({ ...formData, currency: value })}
                        >
                          <SelectTrigger id="currency">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            {currencies.map((curr) => (
                              <SelectItem key={curr.code} value={curr.code}>
                                {curr.code} ({curr.name})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {(formData.price && formData.price > 0 && (!formData.ticketTiers || formData.ticketTiers.length === 0)) && (
                      <div className="text-sm space-y-1 pt-2 border-t border-dashed border-muted-foreground/50">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Platform Fee (5%)</span>
                          <span>- {new Intl.NumberFormat('en-US', { style: 'currency', currency: formData.currency || 'GHS' }).format((formData.price || 0) * 0.05)}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Estimated Earnings</span>
                          <span className="text-green-600">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: formData.currency || 'GHS' }).format((formData.price || 0) * 0.95)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          * Payment processing fees may also apply. See <a href="/legal/terms" target="_blank" className="underline hover:text-primary">Terms of Service</a>.
                        </p>
                      </div>
                    )}
                  </div>
                )}
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
