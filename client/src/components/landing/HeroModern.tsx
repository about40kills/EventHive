import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Calendar, Sparkles } from "lucide-react";
import heroBg from "../../../../attached_assets/generated_images/hero_background.png";
import { useRef } from "react";

interface HeroModernProps {
    onSearch?: (query: string) => void;
    onCtaClick?: () => void;
    onSecondaryCtaClick?: () => void;
}

export function HeroModern({ onSearch, onCtaClick, onSecondaryCtaClick }: HeroModernProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    return (
        <div ref={ref} className="relative w-full min-h-screen flex flex-col justify-center overflow-hidden">
            {/* Background with Overlay and Parallax */}
            <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
                <img
                    src={heroBg}
                    alt="Event Atmosphere"
                    className="w-full h-full object-cover"
                />
                {/* Dark overlay to ensure text readability regardless of theme */}
                <div className="absolute inset-0 bg-black/60" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            </motion.div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-20 md:pt-32 md:pb-0">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-3xl space-y-6"
                >
                    <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 rounded-full bg-primary/20 text-white text-sm font-medium backdrop-blur-sm border border-primary/20 flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-primary" />
                            The #1 Event Platform
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight drop-shadow-lg">
                        Where Moments <br />
                        Become <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Memories</span>
                    </h1>

                    <p className="text-xl text-gray-100 max-w-2xl leading-relaxed drop-shadow-md font-medium">
                        Experience the future of event management. From intimate workshops to global conferences, EventHive connects you with the experiences that matter most.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button
                            size="lg"
                            className="text-base h-12 px-8 bg-primary hover:bg-primary/90 transition-all rounded-full border-none"
                            onClick={onCtaClick}
                        >
                            Find an Event
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="text-base h-12 px-8 bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm transition-all rounded-full hover:text-white"
                            onClick={onSecondaryCtaClick}
                        >
                            Host an Event
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </div>

                    <div className="pt-8 flex items-center gap-4 text-sm text-gray-200 font-medium">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white/10 bg-zinc-800 flex items-center justify-center text-xs text-white overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover opacity-80" />
                                </div>
                            ))}
                        </div>
                        <p className="drop-shadow-md">Joined by 10,000+ event enthusiasts</p>
                    </div>
                </motion.div>
            </div>

        </div>
    );
}
