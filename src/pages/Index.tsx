import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  CalendarDays, 
  Users, 
  Heart, 
  Clock, 
  MapPin, 
  Star,
  BookOpen,
  Handshake
} from 'lucide-react';
import { Link } from 'react-router-dom';
import mosqueHero from '@/assets/mosque-hero.jpg';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${mosqueHero})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-gold/80" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-full animate-islamic-glow">
                <img src="/src/assets/mosque-logo.png" alt="Assalatur Rahman Logo" className="h-16 w-16 object-contain" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Welcome to<br />
              <span className="text-gold">Assalatur Rahman</span><br />
              <span className="text-2xl md:text-3xl font-medium">Islamic Association</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              Building a stronger Muslim community in London through faith, education, and fellowship
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" className="text-lg px-8 py-4" asChild>
                <Link to="/register">Join Our Community</Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-primary" asChild>
                <Link to="/events">View Events</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Your Islamic Community Hub
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect, learn, and grow together in faith with our comprehensive event management platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-islamic transition-all duration-300 hover:-translate-y-2 border-border/50">
              <CardHeader className="text-center">
                <div className="mx-auto p-3 bg-gradient-islamic rounded-full w-fit mb-4 group-hover:animate-islamic-glow">
                  <CalendarDays className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-primary">Event Management</CardTitle>
                <CardDescription>
                  Easily discover and register for mosque events, lectures, and community gatherings
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-islamic transition-all duration-300 hover:-translate-y-2 border-border/50">
              <CardHeader className="text-center">
                <div className="mx-auto p-3 bg-gradient-gold rounded-full w-fit mb-4 group-hover:animate-islamic-glow">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-primary">Community Building</CardTitle>
                <CardDescription>
                  Connect with fellow Muslims and build lasting relationships within our community
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-islamic transition-all duration-300 hover:-translate-y-2 border-border/50">
              <CardHeader className="text-center">
                <div className="mx-auto p-3 bg-gradient-islamic rounded-full w-fit mb-4 group-hover:animate-islamic-glow">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-primary">Islamic Education</CardTitle>
                <CardDescription>
                  Attend educational programs, Quran studies, and Islamic learning sessions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-islamic transition-all duration-300 hover:-translate-y-2 border-border/50">
              <CardHeader className="text-center">
                <div className="mx-auto p-3 bg-gradient-gold rounded-full w-fit mb-4 group-hover:animate-islamic-glow">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-primary">Prayer Times</CardTitle>
                <CardDescription>
                  Stay updated with daily prayer times and special congregational prayers
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-islamic transition-all duration-300 hover:-translate-y-2 border-border/50">
              <CardHeader className="text-center">
                <div className="mx-auto p-3 bg-gradient-islamic rounded-full w-fit mb-4 group-hover:animate-islamic-glow">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-primary">Community Support</CardTitle>
                <CardDescription>
                  Participate in charity drives and community support initiatives
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-islamic transition-all duration-300 hover:-translate-y-2 border-border/50">
              <CardHeader className="text-center">
                <div className="mx-auto p-3 bg-gradient-gold rounded-full w-fit mb-4 group-hover:animate-islamic-glow">
                  <Handshake className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-primary">Fellowship</CardTitle>
                <CardDescription>
                  Join social gatherings and strengthen bonds within our Muslim community
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-islamic">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Start your journey with Assalatur Rahman Islamic Association today
          </p>
          <Button variant="gold" size="lg" className="text-lg px-8 py-4" asChild>
            <Link to="/register">Create Your Account</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
