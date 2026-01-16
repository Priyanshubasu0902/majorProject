import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import pharmalog from "./lab/businessType";
import { NavLink } from "react-router-dom";

import {
  Stethoscope,
  TestTube,
  Pill,
  ScanLine,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

import { motion } from "framer-motion";

export default function MedLuxHome() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between px-10 py-6">
        <h1 className="text-2xl font-semibold tracking-wide">
          Med<span className="text-emerald-600">Lux</span>
        </h1>
        <nav className="space-x-8 text-sm font-medium text-slate-600">
          <a href="#" className="hover:text-slate-900">
            Services
          </a>
          <a href="#" className="hover:text-slate-900">
            Doctors
          </a>
          <a href="#" className="hover:text-slate-900">
            Lab Tests
          </a>
          <a href="#" className="hover:text-slate-900">
            Contact
          </a>
        </nav>
        <Button className="rounded-full px-6">Log In / Sign Up</Button>
      </header>

      {/* Hero */}
      <section className="px-10 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl font-light leading-tight">
            Premium Digital Healthcare,
            <span className="font-medium block">Designed for You</span>
          </h2>
          <p className="mt-6 text-slate-600 max-w-lg">
            Book lab tests, order medicines, scan reports, and consult trusted
            doctors — all in one seamless, secure platform.
          </p>
          <div className="mt-8 flex gap-4">
            <Button className="rounded-full px-8">Get Started</Button>
            <Button variant="outline" className="rounded-full px-8">
              Explore Services
            </Button>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <img
            src="https://images.unsplash.com/photo-1580281658629-97f5a2d2e40b"
            alt="Healthcare"
            className="rounded-3xl shadow-xl"
          />
        </motion.div>
      </section>

      {/* Services */}
      <section className="px-10 py-16">
        <h3 className="text-3xl font-light text-center mb-12">
          Our Core Services
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {services.map((service, i) => (
            <Card
              key={i}
              className="rounded-2xl border-slate-100 shadow-sm hover:shadow-md transition"
            >
              <CardContent className="p-6 text-center">
                <service.icon className="mx-auto h-8 w-8 text-emerald-600" />
                <h4 className="mt-4 font-medium">{service.title}</h4>
                <p className="mt-2 text-sm text-slate-500">{service.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-10 py-20">
        <div className="bg-slate-900 text-white rounded-3xl p-12 flex flex-col md:flex-row items-center justify-between">
          <div>
            <h3 className="text-3xl font-light">Healthcare, Reimagined</h3>
            <p className="mt-2 text-slate-300 max-w-md">
              Experience medical services with elegance, trust, and cutting-edge
              technology.
            </p>
          </div>
          <Button className="mt-6 md:mt-0 rounded-full px-10">Book Now</Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-300 mt-20">
        {/* Partner CTA */}
        <section className="px-10 py-16 border-b border-slate-800">
          <Card className="bg-slate-900 border-slate-800 rounded-3xl">
            <CardContent className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <h3 className="text-3xl font-light text-white">
                  Partner with <span className="font-medium">MedLux</span>
                </h3>
                <p className="mt-3 text-slate-400 max-w-md">
                  Are you a diagnostic lab or pharmaceutical provider? Join our
                  trusted network and reach thousands of patients seamlessly.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <TestTube className="h-4 w-4" /> Diagnostic Labs
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Pill className="h-4 w-4" /> Pharmacies
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Stethoscope className="h-4 w-4" /> Clinics
                  </div>
                </div>
              </div>

              <div className="space-y-5 text-center">
                <Button
                  className="w-full rounded-full px-8 py-6 text-base font-medium"
                  onClick={() => navigate("/partner/apply")}
                >
                  Apply to Partner
                </Button>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Our onboarding team will review your application and contact
                  you within
                  <span className="font-medium text-slate-300"> 24 hours</span>.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer Links */}
        <section className="px-10 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h4 className="text-xl font-medium text-white">MedLux</h4>
            <p className="mt-3 text-sm text-slate-400 max-w-xs">
              Premium digital healthcare platform connecting patients, doctors,
              labs, and pharmacies with trust and elegance.
            </p>
          </div>

          <div>
            <h5 className="text-sm font-medium text-white mb-4">Services</h5>
            <ul className="space-y-2 text-sm">
              <li>Lab Tests</li>
              <li>Order Medicines</li>
              <li>
                <NavLink
                  to="/scanreport"
                  className="text-slate-300 hover:text-white transition"
                >
                  Scan Reports
                </NavLink>
              </li>
              <li>Doctor Consultation</li>
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-medium text-white mb-4">Company</h5>
            <ul className="space-y-2 text-sm">
              <li>About Us</li>
              <li>Careers</li>
              <li>Privacy Policy</li>
              <li>Terms & Conditions</li>
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-medium text-white mb-4">Contact</h5>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> support@medlux.health
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> +91 90000 00000
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> India
              </li>
            </ul>
          </div>
        </section>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 px-10 py-6 text-sm flex flex-col md:flex-row justify-between items-center text-slate-500">
          <p>© 2026 MedLux Health. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Built with care & compliance</p>
        </div>
      </footer>
    </div>
  );
}

const services = [
  { title: "Lab Tests", desc: "Home sample collection", icon: TestTube },
  { title: "Order Medicines", desc: "Fast & authentic delivery", icon: Pill },
  { title: "Scan Reports", desc: "AI-powered insights", icon: ScanLine },
  { title: "Consult Doctors", desc: "Verified specialists", icon: Stethoscope },
  { title: "Contact Care", desc: "24/7 assistance", icon: Phone },
];
