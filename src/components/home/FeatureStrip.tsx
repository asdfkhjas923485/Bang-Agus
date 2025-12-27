import { Truck, ShieldCheck, Clock } from 'lucide-react';

const features = [
  { 
    icon: Truck,
    title: 'Pengiriman Cepat', 
    desc: 'Antar dalam 1-2 jam ke lokasi Anda',
    gradient: 'from-primary to-primary-dark',
    iconBg: 'bg-primary'
  },
  { 
    icon: ShieldCheck,
    title: 'Kualitas Terjamin', 
    desc: 'Produk 100% original & berkualitas',
    gradient: 'from-secondary to-secondary-dark',
    iconBg: 'bg-secondary'
  },
  { 
    icon: Clock,
    title: 'Layanan 7 Hari', 
    desc: 'Buka setiap hari 08:00 - 21:00 WIB',
    gradient: 'from-accent to-primary',
    iconBg: 'bg-accent'
  },
];

export default function FeatureStrip() {
  return (
    <section className="py-12 lg:py-16 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background pointer-events-none" />
      
      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={feature.title} 
                className="group relative animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Glassmorphism Card */}
                <div className="relative overflow-hidden rounded-3xl bg-card/60 dark:bg-card/40 backdrop-blur-xl border border-border/50 dark:border-white/10 p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                  {/* Gradient orb behind icon */}
                  <div className={`absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br ${feature.gradient} rounded-full opacity-20 blur-3xl group-hover:opacity-40 transition-opacity duration-500`} />
                  
                  {/* Inner glow effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                  
                  <div className="relative flex flex-col items-center text-center lg:flex-row lg:items-start lg:text-left gap-5">
                    {/* Icon Container with animation */}
                    <div className="relative shrink-0">
                      <div className={`w-16 h-16 lg:w-18 lg:h-18 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                        <IconComponent className="w-8 h-8 lg:w-9 lg:h-9 text-white" strokeWidth={1.5} />
                      </div>
                      {/* Glow ring on hover */}
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500 -z-10`} />
                      {/* Pulse animation */}
                      <div className={`absolute inset-0 rounded-2xl ${feature.iconBg} opacity-0 group-hover:animate-ping`} style={{ animationDuration: '1.5s' }} />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground text-lg lg:text-xl mb-2 group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm lg:text-base leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                  
                  {/* Bottom gradient line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${feature.gradient} scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left`} />
                  
                  {/* Corner accent */}
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl ${feature.gradient} opacity-5 rounded-bl-[100px]`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
