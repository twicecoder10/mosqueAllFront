import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <img src="/src/assets/mosque-logo.png" alt="Assalatur Rahman Logo" className="h-6 w-6 object-contain" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Assalatur Rahman</h3>
                <p className="text-sm text-primary-foreground/80">Islamic Association</p>
              </div>
            </div>
            <p className="text-primary-foreground/80 mb-4 max-w-md">
              Building a stronger Muslim community in London through faith, education, and fellowship. 
              Join us for prayers, events, and community activities.
            </p>
            <div className="flex items-center space-x-2 text-sm text-primary-foreground/80">
              <MapPin className="h-4 w-4" />
              <span>London, United Kingdom</span>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3 text-sm text-primary-foreground/80">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+44 (0) 20 1234 5678</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>info@assalaturrahman.org</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Open daily for prayers</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <Link to="/events" className="block text-primary-foreground/80 hover:text-white transition-colors">
                Events
              </Link>
              <Link to="/community" className="block text-primary-foreground/80 hover:text-white transition-colors">
                Community
              </Link>
              <Link to="/prayer-times" className="block text-primary-foreground/80 hover:text-white transition-colors">
                Prayer Times
              </Link>
              <Link to="/donations" className="block text-primary-foreground/80 hover:text-white transition-colors">
                Donations
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
          <p>&copy; 2024 Assalatur Rahman Islamic Association. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;