import React from 'react';
import { motion } from 'framer-motion';
import logoImg from '../assets/edukos-green.png';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const sectionVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0, rotate: -180 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      rotate: 0,
      transition: { 
        stiffness: 100, 
        damping: 15,
        duration: 1.5, 
      } 
    },
    hover: {
      rotate: [0, -5, 5, -5, 0],
      scale: 1.1,
      transition: { duration: 1.2}
    }
  };

  const linkHoverVariants = {
    hover: {
      x: 5,
      color: "var(--color-ocean-mist)",
      transition: { duration: 0.2 }
    }
  };

  const socialIcons = ['f', '𝕏', '◉', 'in'];
  const linkSections = [
    {
      title: 'Kërkoni',
      delay: 0.1,
      links: ['Shkollat', 'Programet', 'Universitetet', 'Aftësimet']
    },
    {
      title: 'Lajme',
      delay: 0.2,
      links: ['Rreth nesh', 'Blog', 'Të ardhura', 'Punë']
    },
    {
      title: 'Ndihme',
      delay: 0.3,
      links: ['Privatësia', 'Kushtet', 'FAQ', 'Suporta']
    }
  ];

  const FooterLink = ({ label }: { label: string }) => (
    <motion.li whileHover="hover" variants={linkHoverVariants}>
      <a href="#" className="text-gray-600 hover:text-[var(--color-ocean-mist)] transition duration-200 text-sm">
        {label}
      </a>
    </motion.li>
  );

  const SocialIcon = ({ icon }: { icon: string }) => (
    <motion.a 
      href="#" 
      className="w-9 h-9 rounded-full bg-white/20 hover:bg-[var(--color-ocean-mist)]/20 flex items-center justify-center text-gray-700 hover:text-[var(--color-ocean-mist)] transition duration-200 text-sm font-semibold"
      whileHover={{ scale: 1.2, rotate: 360 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      {icon}
    </motion.a>
  );

  return (
    <footer className="relative bg-gradient-to-b from-[var(--color-emerald)]/60 to-[var(--color-ocean-mist)]/60 backdrop-blur-md border-t border-[var(--color-ocean-mist)]/20 transition-all duration-500 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--color-emerald)]/10 rounded-full blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-[var(--color-ocean-mist)]/10 rounded-full blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          <motion.div 
            className="col-span-1 md:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              variants={logoVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover="hover"
              className="mb-4 cursor-pointer w-fit"
            >
              <img 
                src={logoImg}
                alt="EduKos" 
                className="h-12 w-auto drop-shadow-lg hover:drop-shadow-xl transition-all"
              />
            </motion.div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Gjej rrugën e arsimit ideal për ty.
            </p>
          </motion.div>

          {linkSections.map((section) => (
            <motion.div 
              key={section.title}
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: section.delay }}
            >
              <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-4 uppercase tracking-wide hover:text-[var(--color-ocean-mist)] transition duration-300 cursor-default">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <FooterLink key={link} label={link} />
                ))}
              </ul>
            </motion.div>
          ))}

          <motion.div 
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide hover:text-[var(--color-ocean-mist)] transition duration-300 cursor-default">
              Ndiq
            </h4>
            <div className="flex gap-4">
              {socialIcons.map((icon) => (
                <SocialIcon key={icon} icon={icon} />
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="h-px bg-gradient-to-r from-transparent via-[var(--color-ocean-mist)]/30 to-transparent mb-8"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        />

        <motion.div 
          className="flex justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <p className="text-gray-700 text-xs font-medium">
            © {currentYear} EduKos. Të gjitha të drejtat janë të rezervuara.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
