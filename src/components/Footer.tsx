import { Link } from 'react-router-dom';
import { Phone, MapPin, Leaf } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';

const Footer = () => {
  const { data: popularProducts = [] } = useProducts({ popular: true });
  const footerProducts = popularProducts.slice(0, 4);

  return (
    <footer className="bg-foreground text-background mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Leaf className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">Kishki Halal Supermarket</span>
            </div>
            <p className="text-sm opacity-70">Your neighbourhood Canadian halal grocery store with the freshest produce and meats.</p>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-primary" />
              <a href="tel:5192082025" className="hover:text-primary transition-colors">519-208-2025</a>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-primary mt-0.5" />
              <span>468 Albert St, Waterloo, ON, Canada</span>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider opacity-60">Best Sellers</h4>
            <ul className="flex flex-col gap-2">
              {footerProducts.map(p => (
                <li key={p.id} className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                  {p.name} — <span className="text-primary font-medium">${Number(p.price).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider opacity-60">Find Us</h4>
            <div className="rounded-lg overflow-hidden border border-background/10 aspect-video">
              <iframe
                title="Kishki Halal Supermarket Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2895.5!2d-80.5234!3d43.4643!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882bf3142db8b4c1%3A0x0!2s468+Albert+St%2C+Waterloo%2C+ON!5e0!3m2!1sen!2sca!4v1"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs opacity-50">
          <span>© {new Date().getFullYear()} Kishki Halal Supermarket. All rights reserved.</span>
          <div className="flex gap-4">
            <Link to="/" className="hover:opacity-100">Home</Link>
            <Link to="/flyer" className="hover:opacity-100">Weekly Deals</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
