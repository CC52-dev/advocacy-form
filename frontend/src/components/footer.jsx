import React from 'react';
import { Facebook, Instagram, Youtube, Phone, Mail } from 'lucide-react';

const socialLinks = [
  {
    href: 'https://facebook.com',
    label: 'Facebook',
    icon: <Facebook className="w-6 h-6" />,
  },
  {
    href: 'https://instagram.com',
    label: 'Instagram',
    icon: <Instagram className="w-6 h-6" />,
  },
  {
    href: 'https://youtube.com',
    label: 'YouTube',
    icon: <Youtube className="w-6 h-6" />,
  },
];

const Footer = () => {
  return (
    <footer className="w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-6">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start">
          <span className="font-semibold text-gray-900 dark:text-white text-lg">Satsankalpa Foundation Inc © {new Date().getFullYear()}</span>
          <span className="text-gray-500 dark:text-gray-400 text-sm">All rights reserved.</span>
        </div>
        <div className="flex flex-col items-center md:items-start gap-1">
          <a href="tel:+18604002032" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <Phone className="w-5 h-5" />
            +1-860-400-2032
          </a>
          <a href="mailto:engage@satsankalpa.org" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <Mail className="w-5 h-5" />
            engage@satsankalpa.org
          </a>
        </div>
        <div className="flex items-center gap-4">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="rounded-lg p-2 bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors shadow-sm"
            >
              {link.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;