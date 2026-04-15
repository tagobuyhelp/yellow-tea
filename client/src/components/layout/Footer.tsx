import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Leaf, Info, ShoppingBag, MessageCircle, BookOpen, HelpCircle, Truck, RotateCcw, Search, Shield, FileText, RefreshCw, Heart, Award, Truck as TruckIcon, Globe } from 'lucide-react';
const quickLinks = [{
  name: 'About Us',
  href: '/about',
  icon: Info
}, {
  name: 'Shop',
  href: '/shop',
  icon: ShoppingBag
}, {
  name: 'Contact',
  href: '/contact',
  icon: MessageCircle
}, {
  name: 'Blog',
  href: '/blog',
  icon: BookOpen
}];
const supportLinks = [{
  name: 'FAQ',
  href: '/faq',
  icon: HelpCircle
}, {
  name: 'Shipping Info',
  href: '/shipping',
  icon: Truck
}, {
  name: 'Returns',
  href: '/returns',
  icon: RotateCcw
}, {
  name: 'Track Order',
  href: '/track-order',
  icon: Search
}];
const legalLinks = [{
  name: 'Privacy Policy',
  href: '/privacy',
  icon: Shield
}, {
  name: 'Terms of Service',
  href: '/terms',
  icon: FileText
}, {
  name: 'Refund Policy',
  href: '/refund',
  icon: RefreshCw
}];
const socialLinks = [{
  name: 'Facebook',
  href: '#',
  icon: Facebook
}, {
  name: 'Instagram',
  href: '#',
  icon: Instagram
}, {
  name: 'Twitter',
  href: '#',
  icon: Twitter
}, {
  name: 'YouTube',
  href: '#',
  icon: Youtube
}];
const impactStats = [{
  label: "Children Educated",
  value: "1,200+",
  icon: Heart
}, {
  label: "CO₂ Offset (kg)",
  value: "5,000+",
  icon: Leaf
}, {
  label: "Quality Assured",
  value: "10 Days",
  icon: Award
}, {
  label: "Global Shipping",
  value: "50+ Countries",
  icon: Globe
}];
export function Footer() {
  return <footer className="bg-gradient-to-br from-background via-muted/20 to-accent/10 border-t relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,_var(--primary)_0%,_transparent_50%)] animate-pulse"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,_var(--accent)_0%,_transparent_50%)] animate-pulse"></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 relative">
        {/* Newsletter Section */}
        <div className="text-center mb-12 p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <h3 className="text-2xl font-bold text-foreground mb-2">Stay Steeped in Updates</h3>
          <p className="text-muted-foreground mb-6">Get exclusive tea insights, offers, and impact stories delivered to your inbox</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" placeholder="Your email address" className="flex-1 px-4 py-2 rounded-lg border border-border bg-background/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              Subscribe
            </button>
          </div>
        </div>

        {/* Impact Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {impactStats.map((stat, index) => {
          const Icon = stat.icon;
          return <div key={index} className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card/70 transition-all duration-300 hover:scale-105 hover:shadow-md">
                <Icon className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
                <div className="text-lg md:text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
              </div>;
        })}
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-3 group">
              <img 
                src="/uploads/site_logo.jpg" 
                alt="Yellow Tea Logo" 
                className="h-12 w-auto object-contain group-hover:scale-110 transition-transform duration-300"
              />
              <span className="font-bold text-2xl text-foreground">Yellow Tea</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Premium tea from garden to cup in 10 days. Supporting farmers' education and environmental sustainability with every sip.
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full border border-green-200">Organic Certified</span>
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full border border-blue-200">Fair Trade</span>
              <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full border border-amber-200">Carbon Neutral</span>
            </div>
            
            {/* Social Media Links */}
            <div className="flex space-x-3">
              {socialLinks.map(social => {
              const Icon = social.icon;
              return <a key={social.name} href={social.href} className="text-muted-foreground hover:text-primary transition-all duration-300 p-2 hover:bg-accent/50 rounded-lg hover:scale-110 hover:shadow-md group" aria-label={social.name}>
                    <Icon size={20} className="group-hover:animate-pulse" />
                  </a>;
            })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-lg mb-4 flex items-center">
              <div className="h-2 w-2 bg-primary rounded-full mr-3"></div>
              Quick Links
            </h3>
            <nav className="space-y-3">
              {quickLinks.map(link => {
              const Icon = link.icon;
              return <Link key={link.name} to={link.href} className="flex items-center space-x-3 text-sm text-muted-foreground hover:text-primary transition-all duration-300 group hover:translate-x-1">
                    <Icon size={16} className="group-hover:text-primary transition-colors" />
                    <span className="group-hover:font-medium">{link.name}</span>
                  </Link>;
            })}
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-lg mb-4 flex items-center">
              <div className="h-2 w-2 bg-accent rounded-full mr-3"></div>
              Support
            </h3>
            <nav className="space-y-3">
              {supportLinks.map(link => {
              const Icon = link.icon;
              return <Link key={link.name} to={link.href} className="flex items-center space-x-3 text-sm text-muted-foreground hover:text-primary transition-all duration-300 group hover:translate-x-1">
                    <Icon size={16} className="group-hover:text-primary transition-colors" />
                    <span className="group-hover:font-medium">{link.name}</span>
                  </Link>;
            })}
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-lg mb-4 flex items-center">
              <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
              Contact
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 text-sm group">
                <MapPin size={16} className="text-muted-foreground mt-0.5 flex-shrink-0 group-hover:text-primary transition-colors" />
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                  Tea Gardens, Assam<br />
                  Darjeeling, India
                </span>
              </div>
              
              <div className="flex items-center space-x-3 text-sm group cursor-pointer">
                <Phone size={16} className="text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors" />
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">+91 98765 43210</span>
              </div>
              
              <div className="flex items-center space-x-3 text-sm group cursor-pointer">
                <Mail size={16} className="text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors" />
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">hello@yellowtea.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t my-8 border-gradient-to-r from-transparent via-border to-transparent"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground flex items-center space-x-2">
            <Leaf size={14} className="text-green-500" />
            <span>© 2025 Yellow Tea. All rights reserved.
Pure. Fresh. Ethical. That’s Yellow.</span>
          </div>
          
          {/* Legal Links */}
          <nav className="flex flex-wrap justify-center md:justify-end space-x-6">
            {legalLinks.map(link => {
            const Icon = link.icon;
            return <Link key={link.name} to={link.href} className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-primary transition-all duration-300 group">
                  <Icon size={12} className="group-hover:text-primary transition-colors" />
                  <span className="group-hover:font-medium">{link.name}</span>
                </Link>;
          })}
          </nav>
        </div>
      </div>
    </footer>;
}