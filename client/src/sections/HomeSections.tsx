import { motion } from "framer-motion";
import eduImage from "../assets/sifunksionon.png";

const HomeSections = () => {
  return (
    <div className="w-full">

     <section className="py-20 px-4 flex flex-col items-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold mb-6"
        >
          Si funksionon EduKos?
        </motion.h1>

        <motion.img
          src={eduImage}
          alt="EduKos explanation"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-[70%] mx-auto"
        />
      </section>

      <section className="py-20 px-6 md:px-20">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-xl text-left"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Nuk po vendos dot?
          </h2>

          <p className="text-lg text-gray-600 mb-6">
            Krahaso shkollat. Vendimet e vështira bëhen më të lehta—
            krahaso dhe zbulo cila shkollë është “perfect match” për ty.
          </p>

          <motion.button
            className="bg-[var(--color-green-light)] text-black font-semibold py-3 px-8 rounded-lg transition duration-300 ease-in-out shadow-lg"
            whileHover={{ 
                scale: 1.08, 
                boxShadow: "0 25px 40px -5px rgba(153, 217, 140, 0.4)",
                backgroundColor: "var(--color-emerald)"
            }}
            whileTap={{ scale: 0.95 }}
            >
            <motion.span
                animate={{ x: [0, 2, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="inline-block"
            >
                Krahaso →
            </motion.span>
            </motion.button>
        </motion.div>
      </section>

    <section className="py-20 px-6 md:px-20 flex justify-end">
    <motion.div
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-xl text-right"
    >
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
        Je një institucion arsimor?
        </h2>

        <p className="text-lg text-gray-600 mb-6">
        Bashkohuni me EduKos për të arritur më shumë studentë dhe
        për të menaxhuar aplikimet në një vend.
        </p>

        <motion.button
            className="bg-[var(--color-green-light)] text-black font-semibold py-3 px-8 rounded-lg transition duration-300 ease-in-out shadow-lg"
            whileHover={{ 
                scale: 1.08, 
                boxShadow: "0 25px 40px -5px rgba(153, 217, 140, 0.4)",
                backgroundColor: "var(--color-emerald)"
            }}
            whileTap={{ scale: 0.95 }}
            >
            <motion.span
                animate={{ x: [0, 2, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="inline-block"
            >
                View more →
            </motion.span>
            </motion.button>
        </motion.div>
    </section>
    </div>
  );
};

export default HomeSections;