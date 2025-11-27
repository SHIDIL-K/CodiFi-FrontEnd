// src/components/Footer.jsx
import React from "react";
import { motion } from "framer-motion";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Mail,
  GraduationCap,
} from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-16 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-gray-200">
      {/* ✨ Decorative Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent blur-2xl"></div>

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* 🌐 Brand Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center md:items-start text-center md:text-left"
        >
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-8 h-8 text-pink-400" />
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              CodiFi
            </h2>
          </div>
          <p className="text-sm text-gray-300 max-w-xs leading-relaxed">
            Empowering learners to build skills, confidence, and brighter futures
            through interactive and modern e-learning experiences.
          </p>
        </motion.div>

        {/* 🔗 Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center md:text-left"
        >
          <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <a
                href="/courses"
                className="hover:text-pink-400 transition-colors"
              >
                Browse Courses
              </a>
            </li>
            <li>
              <a
                href="/instructors"
                className="hover:text-pink-400 transition-colors"
              >
                Meet Instructors
              </a>
            </li>
            <li>
              <a
                href="/about"
                className="hover:text-pink-400 transition-colors"
              >
                About Us
              </a>
            </li>
            <li>
              <a
                href="/contact"
                className="hover:text-pink-400 transition-colors"
              >
                Contact Support
              </a>
            </li>
          </ul>
        </motion.div>

        {/* 🌐 Social Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center md:text-right"
        >
          <h3 className="text-lg font-semibold text-white mb-3">
            Connect with Us
          </h3>
          <div className="flex justify-center md:justify-end gap-4 mb-4">
            {[Facebook, Twitter, Instagram, Linkedin, Github, Mail].map(
              (Icon, index) => (
                <motion.a
                  key={index}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  href="#"
                  className="p-2 rounded-full bg-white/10 hover:bg-pink-600 transition-colors"
                >
                  <Icon className="w-5 h-5 text-gray-200 hover:text-white" />
                </motion.a>
              )
            )}
          </div>
          <p className="text-sm text-gray-400">
            📧 support@codifi.com <br />
            📍 Calicut, Kerala, India
          </p>
        </motion.div>
      </div>

      {/* Divider Line */}
      <div className="border-t border-gray-700/60"></div>

      {/* © Copyright Bar */}
      <div className="py-5 text-center text-sm text-gray-400">
        © {year} <span className="text-pink-400 font-semibold">CodiFi</span> — Learn,
        Build, Grow. All rights reserved.
      </div>
    </footer>
  );
}
