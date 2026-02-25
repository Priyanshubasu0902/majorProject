import React from "react";
import {
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-slate-900 to-black text-slate-300">
      <div className="max-w-7xl mx-auto px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Med<span className="text-emerald-500">Lux</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Premium digital healthcare platform connecting patients,
              doctors, labs, and pharmacies with trust and elegance.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-medium mb-4">Services</h3>
            <ul className="space-y-3 text-sm">
              {[
                "Lab Tests",
                "Order Medicines",
                "Scan Reports",
                "Doctor Consultation",
              ].map((item) => (
                <li
                  key={item}
                  className="hover:text-emerald-400 transition cursor-pointer"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-medium mb-4">Company</h3>
            <ul className="space-y-3 text-sm">
              {[
                "About Us",
                "Careers",
                "Privacy Policy",
                "Terms & Conditions",
              ].map((item) => (
                <li
                  key={item}
                  className="hover:text-emerald-400 transition cursor-pointer"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-medium mb-4">Contact</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <Mail size={16} />
                support@medlux.health
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} />
                +91 90000 00000
              </li>
              <li className="flex items-center gap-3">
                <MapPin size={16} />
                India
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 mt-14 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>© 2026 MedLux Health. All rights reserved.</p>
          <p className="mt-2 md:mt-0">
            Built with care & compliance
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
