import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import heroImg from "../assets/heroheaderimage.png";

const HeroHeader: React.FC = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  const imageVariants: Variants = {
    hidden: { opacity: 0, scale: 0.6, x: 100, rotate: 10 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      x: 0, 
      rotate: 0,
      transition: { duration: 0.8, ease: "easeOut", type: "spring", stiffness: 80 } 
    },
  };

  const titleText = "Gjej rrugën tënde të arsimit në Kosovë";
  const titleVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.2,
      },
    },
  };

  const charVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="relative w-full h-full py-16 lg:py-24 px-6 md:px-12 lg:px-20 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-10 w-64 h-64 bg-[var(--color-light-green)]/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, 50, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--color-ocean-mist)]/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, -50, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 relative z-10">
        <motion.div 
          className="w-full lg:w-[60%] flex flex-col items-start space-y-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div
            variants={titleVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight overflow-hidden"
          >
            {titleText.split(" ").map((word, index) => (
              <motion.span
                key={index}
                variants={charVariants}
                className="inline-block whitespace-nowrap mr-2"
              >
                {word}
              </motion.span>
            ))}
          </motion.div>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed"
            variants={itemVariants}
          >
            Krahaso shkollat, zbulo programet dhe gjej përshtatjen më të mirë për ty — 
            nga parashkollori deri në universitet, në një vend të vetëm.
          </motion.p>
          
          <Link to="/explore/3">
            <motion.span
              className="inline-block bg-[var(--color-green-light)] hover:bg-[var(--color-emerald)] text-black font-semibold py-3 px-8 rounded-lg transition duration-300 ease-in-out shadow-lg"
              variants={itemVariants}
              whileHover={{ 
                scale: 1.08, 
                boxShadow: "0 25px 40px -5px rgba(153, 217, 140, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span
                animate={{ x: [0, 2, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="inline-block"
              >
                Fillo kërkimin →
              </motion.span>
            </motion.span>
          </Link>
        </motion.div>

        <motion.div 
          className="w-full lg:w-[30%] flex justify-center items-center"
          variants={imageVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div
            animate={{ 
              y: [0, -15, 0],
              rotateZ: [-1, 1, -1]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ scale: 1.1, y: -20 }}
            className="relative"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[var(--color-green-light)] to-[var(--color-ocean-mist)] rounded-3xl blur-2xl opacity-30"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <img 
              src={heroImg}
              alt="Arsimi në Kosovë" 
              className="w-full h-full drop-shadow-2xl rounded-2xl relative z-10"
            />
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
};

export default HeroHeader;
