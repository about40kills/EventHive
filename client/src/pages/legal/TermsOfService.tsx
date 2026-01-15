import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TermsOfService() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">Terms of Service</CardTitle>
                    <p className="text-sm text-muted-foreground">Last updated: January 13, 2026</p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <section>
                        <h2 className="text-xl font-semibold mb-2">1. Agreement to Terms</h2>
                        <p className="text-muted-foreground">
                            By accessing or using EventHive, you agree to be bound by these Terms of Service. If you disagree with any part of the terms,
                            then you may not access the service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">2. Use License</h2>
                        <p className="text-muted-foreground mb-2">Permission is granted to temporarily download one copy of the materials (information or software) on EventHive's website for personal, non-commercial transitory viewing only.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">3. User Accounts</h2>
                        <p className="text-muted-foreground">
                            When you create an account with us, you must provide us information that is accurate, complete, and current at all times.
                            Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">4. Content</h2>
                        <p className="text-muted-foreground">
                            Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content").
                            You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">5. Termination</h2>
                        <p className="text-muted-foreground">
                            We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever,
                            including without limitation if you breach the Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">6. Fees and Payments</h2>
                        <div className="text-muted-foreground space-y-4">
                            <p>
                                EventHive charges service fees for the use of our platform to sell tickets or register attendees. These fees are charged to the Event Organizer and may be passed on to the Attendee at the Organizer's discretion.
                            </p>
                            <div>
                                <h3 className="font-medium text-foreground mb-1">Paid Events</h3>
                                <p>
                                    For events where the Organizer charges a ticket price ("Paid Events"), EventHive charges a platform service fee of <strong>5% of the ticket price</strong> plus any applicable payment processing fees. These fees are deducted automatically from the revenue generated.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium text-foreground mb-1">Free Events</h3>
                                <p>
                                    For events where the Organizer does not charge a ticket price ("Free Events"), EventHive charges a platform service fee of <strong>0%</strong>. Creating and hosting listings for free events is currently complimentary.
                                </p>
                            </div>
                            <p className="text-sm">
                                * Fees are subject to change with notice. All financial transactions are processed securely via our third-party payment processor, Paystack.
                            </p>
                        </div>
                    </section>
                </CardContent>
            </Card>
        </div>
    );
}
