import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ContactSectionProps {
  className?: string;
  onSubmit?: (formData: FormData) => void;
}

export function ContactSection({ className, onSubmit }: ContactSectionProps) {
  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6" />,
      contact: "hello@hapi.ai"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      contact: "+1 (234) 567-890"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      contact: "San Francisco, California"
    },
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (onSubmit) {
      onSubmit(formData);
    } else {
      // Default behavior - log form data
      console.log('Contact form submitted:', {
        name: formData.get('name'),
        email: formData.get('email'),
        company: formData.get('company'),
        message: formData.get('message'),
      });
      
      // Show success message (you can replace with toast)
      alert('Thank you for reaching out! We\'ll get back to you soon.');
      e.currentTarget.reset();
    }
  };

  return (
    <section id="contact" className={cn("py-20 sm:py-24 bg-white dark:bg-background", className)}>
      <div className="max-w-screen-xl mx-auto px-4 text-foreground md:px-8">
        <div className="max-w-lg mx-auto gap-12 justify-between lg:flex lg:max-w-none">
          <div className="max-w-lg space-y-3">
            <h3 className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent font-semibold">
              Contact
            </h3>
            <p className="text-3xl font-semibold sm:text-4xl">
              Let us know how we can help
            </p>
            <p className="text-muted-foreground">
              We're here to help and answer any question you might have. We look forward to hearing from you! Please fill out the form, or use the contact information below.
            </p>
            <div>
              <ul className="mt-6 flex flex-wrap gap-x-10 gap-y-6 items-center">
                {contactMethods.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-x-3">
                    <div className="flex-none text-sky-600 dark:text-sky-400">
                      {item.icon}
                    </div>
                    <p className="text-sm sm:text-base">{item.contact}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex-1 mt-12 sm:max-w-lg lg:max-w-md">
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label htmlFor="name" className="font-medium text-sm">
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full mt-2 px-3 py-2 text-foreground bg-transparent outline-none border border-border focus:border-sky-500 dark:focus:border-sky-400 shadow-sm rounded-lg transition-colors"
                />
              </div>
              <div>
                <label htmlFor="email" className="font-medium text-sm">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full mt-2 px-3 py-2 text-foreground bg-transparent outline-none border border-border focus:border-sky-500 dark:focus:border-sky-400 shadow-sm rounded-lg transition-colors"
                />
              </div>
              <div>
                <label htmlFor="company" className="font-medium text-sm">
                  School/Institution
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  required
                  className="w-full mt-2 px-3 py-2 text-foreground bg-transparent outline-none border border-border focus:border-sky-500 dark:focus:border-sky-400 shadow-sm rounded-lg transition-colors"
                />
              </div>
              <div>
                <label htmlFor="message" className="font-medium text-sm">
                  Message
                </label>
                <textarea 
                  id="message"
                  name="message"
                  required 
                  className="w-full mt-2 h-36 px-3 py-2 resize-none appearance-none bg-transparent outline-none border border-border focus:border-sky-500 dark:focus:border-sky-400 shadow-sm rounded-lg transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-3 text-white font-medium bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 active:from-sky-700 active:to-blue-800 rounded-lg duration-150 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                Send Message
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

