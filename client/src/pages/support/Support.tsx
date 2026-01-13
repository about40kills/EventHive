import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Mail, MessageCircle, Phone } from "lucide-react";

export function Support() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">

            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">Help Center</h1>
                <p className="text-xl text-muted-foreground">How can we help you today?</p>
            </div>

            {/* FAQ Section */}
            <Card id="faq">
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>Quick answers to common questions</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>How do I create an event?</AccordionTrigger>
                            <AccordionContent>
                                To create an event, sign up for an account and click on the "Create Event" button in the navigation bar or your dashboard.
                                Fill in the details such as title, date, location, and description, then publish your event.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Is EventHive free to use?</AccordionTrigger>
                            <AccordionContent>
                                Yes, EventHive is currently free for both organizers and attendees. We may introduce premium features in the future.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Can I cancel my registration?</AccordionTrigger>
                            <AccordionContent>
                                Yes, you can cancel your registration for any event from your dashboard. Go to "My Registrations", find the event, and click "Cancel".
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>How do I contact an event organizer?</AccordionTrigger>
                            <AccordionContent>
                                On the event details page, you can find the organizer's name and contact information.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>

            {/* Contact Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="contact">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5 text-primary" />
                            Contact Support
                        </CardTitle>
                        <CardDescription>Get in touch with our team</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            Have a question that's not answered in the FAQ? Our support team is here to help.
                        </p>
                        <a href="mailto:support@eventhive.com">
                            <Button className="w-full gap-2">
                                <Mail className="h-4 w-4" />
                                Email Support
                            </Button>
                        </a>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Phone className="h-5 w-5 text-primary" />
                            Urgent Inquiries
                        </CardTitle>
                        <CardDescription>For immediate assistance</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            For urgent matters regarding safety or security, please contact our emergency line.
                        </p>
                        <Button variant="outline" className="w-full gap-2" disabled>
                            <Phone className="h-4 w-4" />
                            +(233) 554486674                        </Button>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
