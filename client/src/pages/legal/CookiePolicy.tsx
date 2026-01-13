import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CookiePolicy() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">Cookie Policy</CardTitle>
                    <p className="text-sm text-muted-foreground">Last updated: January 13, 2026</p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <section>
                        <h2 className="text-xl font-semibold mb-2">1. What Are Cookies</h2>
                        <p className="text-muted-foreground">
                            As is common practice with almost all professional websites, this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience.
                            This page describes what information they gather, how we use it, and why we sometimes need to store these cookies.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">2. How We Use Cookies</h2>
                        <p className="text-muted-foreground">
                            We use cookies for a variety of reasons detailed below. Unfortunately, in most cases, there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site.
                            It is recommended that you leave on all cookies if you are not sure whether you need them or not in case they are used to provide a service that you use.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">3. The Cookies We Set</h2>
                        <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-2 mt-2">
                            <li>
                                <strong>Account related cookies:</strong> If you create an account with us, we will use cookies for the management of the signup process and general administration.
                            </li>
                            <li>
                                <strong>Login related cookies:</strong> We use cookies when you are logged in so that we can remember this fact. This prevents you from having to log in every single time you visit a new page.
                            </li>
                        </ul>
                    </section>
                </CardContent>
            </Card>
        </div>
    );
}
