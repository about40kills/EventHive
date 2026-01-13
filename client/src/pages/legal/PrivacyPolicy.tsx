import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PrivacyPolicy() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">Privacy Policy</CardTitle>
                    <p className="text-sm text-muted-foreground">Last updated: January 13, 2026</p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <section>
                        <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
                        <p className="text-muted-foreground">
                            Welcome to EventHive. We respect your privacy and are committed to protecting your personal data.
                            This privacy policy will inform you as to how we look after your personal data when you visit our website
                            (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">2. Data We Collect</h2>
                        <p className="text-muted-foreground mb-2">We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
                        <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                            <li>Identity Data: Name, username.</li>
                            <li>Contact Data: Email address.</li>
                            <li>Technical Data: IP address, browser type and version, time zone setting and location.</li>
                            <li>Usage Data: Information about how you use our website and services.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">3. How We Use Your Data</h2>
                        <p className="text-muted-foreground">
                            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1 mt-2">
                            <li>To register you as a new customer.</li>
                            <li>To manage our relationship with you.</li>
                            <li>To enable you to create and manage events.</li>
                            <li>To improve our website, products/services, marketing or customer relationships.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">4. Data Security</h2>
                        <p className="text-muted-foreground">
                            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
                        </p>
                    </section>
                </CardContent>
            </Card>
        </div>
    );
}
