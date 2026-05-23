import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
      transition: { stiffness: 100, damping: 15, duration: 1.5 } 
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

  const linkSections = [
    {
      title: 'Kërkoni',
      delay: 0.1,
      links: [
        { label: 'Çerdhet', to: '/cerdhet' },
        { label: 'Shkollat Fillore', to: '/shkollat-fillore' },
        { label: 'Shkollat e Mesme', to: '/shkollat-e-mesme' },
        { label: 'Universitetet', to: '/universitetet' },
      ]
    },
    {
      title: 'Llogaria',
      delay: 0.2,
      links: [
        { label: 'Kyqu', to: '/login' },
        { label: 'Regjistrohu', to: '/signup' },
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Apliko', to: '/apply' },
      ]
    },
    {
      title: 'Ndihme',
      delay: 0.3,
      links: [
        { label: 'Rreth nesh', to: '/about' },
        { label: 'Kryefaqja', to: '/' },
      ]
    }
  ];

  const FooterLink = ({ label, to }: { label: string; to: string }) => (
    <motion.li whileHover="hover" variants={linkHoverVariants}>
      <Link to={to} className="text-gray-600 hover:text-[var(--color-ocean-mist)] transition duration-200 text-sm">
        {label}
      </Link>
    </motion.li>
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
            <Link to="/">
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
            </Link>
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
              <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <FooterLink key={link.label} label={link.label} to={link.to} />
                ))}
              </ul>
            </motion.div>
          ))}
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
