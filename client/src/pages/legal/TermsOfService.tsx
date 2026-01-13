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
                </CardContent>
            </Card>
        </div>
    );
}
