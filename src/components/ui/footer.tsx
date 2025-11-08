import { Brain, Mail, MapPin, Phone, Twitter, Linkedin, Github, Instagram } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface FooterProps {
  className?: string;
  onNavigate?: (section: string) => void;
}

export function Footer({ className, onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleNavClick = (section: string) => {
    if (onNavigate) {
      onNavigate(section);
    } else {
      const element = document.getElementById(section);
      if (element) {
        const offset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <footer className={cn("relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-200", className)}>
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-sky-400" />
      
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                Hapi
              </span>
            </div>
            <p className="text-slate-400 mb-6 leading-relaxed">
              Transforming education through emotional intelligence and AI-powered insights. 
              Empowering students and educators to thrive.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 hover:bg-sky-500 transition-colors duration-300"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 hover:bg-blue-600 transition-colors duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors duration-300"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 hover:bg-pink-600 transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {/* Product */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => handleNavClick('platform')}
                    className="text-sm text-slate-400 hover:text-sky-400 transition-colors duration-200"
                  >
                    Platform
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavClick('functions')}
                    className="text-sm text-slate-400 hover:text-sky-400 transition-colors duration-200"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavClick('intelligence')}
                    className="text-sm text-slate-400 hover:text-sky-400 transition-colors duration-200"
                  >
                    AI Intelligence
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavClick('security')}
                    className="text-sm text-slate-400 hover:text-sky-400 transition-colors duration-200"
                  >
                    Security
                  </button>
                </li>
              </ul>
            </div>

            {/* Solutions */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Solutions</h3>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => handleNavClick('solutions')}
                    className="text-sm text-slate-400 hover:text-sky-400 transition-colors duration-200"
                  >
                    For Students
                  </button>
                </li>
                <li>
                  <a href="/teacher-features" className="text-sm text-slate-400 hover:text-sky-400 transition-colors duration-200">
                    For Teachers
                  </a>
                </li>
                <li>
                  <a href="/enterprise-features" className="text-sm text-slate-400 hover:text-sky-400 transition-colors duration-200">
                    For Schools
                  </a>
                </li>
                <li>
                  <a href="/enterprise-features" className="text-sm text-slate-400 hover:text-sky-400 transition-colors duration-200">
                    Universities
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <a href="/about" className="text-sm text-slate-400 hover:text-sky-400 transition-colors duration-200">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/careers" className="text-sm text-slate-400 hover:text-sky-400 transition-colors duration-200">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="/blog" className="text-sm text-slate-400 hover:text-sky-400 transition-colors duration-200">
                    Blog
                  </a>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavClick('contact')}
                    className="text-sm text-slate-400 hover:text-sky-400 transition-colors duration-200"
                  >
                    Contact
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <a href="/privacy" className="text-sm text-slate-400 hover:text-sky-400 transition-colors duration-200">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-sm text-slate-400 hover:text-sky-400 transition-colors duration-200">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/ferpa" className="text-sm text-slate-400 hover:text-sky-400 transition-colors duration-200">
                    FERPA Compliance
                  </a>
                </li>
                <li>
                  <a href="/accessibility" className="text-sm text-slate-400 hover:text-sky-400 transition-colors duration-200">
                    Accessibility
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800">
                <Mail className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Email</p>
                <a href="mailto:hello@hapi.ai" className="text-sm text-slate-300 hover:text-sky-400 transition-colors">
                  hello@hapi.ai
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800">
                <Phone className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Phone</p>
                <a href="tel:+1234567890" className="text-sm text-slate-300 hover:text-blue-400 transition-colors">
                  +1 (234) 567-890
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800">
                <MapPin className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Location</p>
                <p className="text-sm text-slate-300">
                  San Francisco, CA
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-slate-800">
            <p className="text-sm text-slate-500">
              © {currentYear} Hapi AI. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-xs text-slate-600">
                Made with ❤️ for educators
              </span>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-slate-400">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

