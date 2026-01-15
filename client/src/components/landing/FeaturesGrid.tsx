import { Calendar, Globe, Shield, Users, Zap, BarChart } from "lucide-react";
import { motion } from "framer-motion";

const features = [
    {
        icon: Globe,
        title: "Global Discovery",
        description: "Access a worldwide network of events. From local meetups to international summits.",
        color: "text-blue-500",
        bg: "bg-blue-500/10"
    },
    {
        icon: Zap,
        title: "Instant Booking",
        description: "Secure your spot in seconds with our streamlined one-click registration process.",
        color: "text-amber-500",
        bg: "bg-amber-500/10"
    },
    {
        icon: Shield,
        title: "Verified Events",
        description: "Every event is vetted for quality and authenticity. No spam, just great experiences.",
        color: "text-green-500",
        bg: "bg-green-500/10"
    },
    {
        icon: Users,
        title: "Community First",
        description: "Connect with like-minded individuals before, during, and after the event.",
        color: "text-purple-500",
        bg: "bg-purple-500/10"
    },
    {
        icon: BarChart,
        title: "Live Analytics",
        description: "For organizers: Watch your ticket sales and engagement metrics in real-time.",
        color: "text-pink-500",
        bg: "bg-pink-500/10"
    },
    {
        icon: Calendar,
        title: "Smart Scheduling",
        description: "Sync events directly to your calendar and get timely reminders.",
        color: "text-indigo-500",
        bg: "bg-indigo-500/10"
    }
];

export function FeaturesGrid() {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight mb-4">Why Choose EventHive?</h2>
                    <p className="text-muted-foreground text-lg">
                        We've built the most comprehensive platform for event lovers and creators alike.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
                        >
                            <div className={`w-12 h-12 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
