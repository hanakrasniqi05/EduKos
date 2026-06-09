import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, School, GitCompareArrows, Send, ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    q: "Si funksionon EduKos?",
    a: "EduKos të lejon të regjistrohesh si student, të shikosh shkollat, t’i krahasosh dhe të aplikosh direkt online.",
  },
  {
    q: "A mund të krahasoj shkolla?",
    a: "Po, mund të zgjedhësh dy shkolla dhe t’i krahasosh sipas programeve, kushteve dhe mundësive.",
  },
  {
    q: "Si aplikoj në një shkollë?",
    a: "Pasi të zgjedhësh shkollën, mund të dërgosh aplikimin direkt përmes platformës.",
  },
  {
    q: "A mund të regjistrohen institucionet?",
    a: "Po, shkollat mund të krijojnë profil dhe të menaxhojnë aplikimet e studentëve.",
  },
];

const HomeSections = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="w-full">
      <section className="py-24 px-6 md:px-20 bg-white">
        
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-3xl md:text-4xl font-bold mb-14"
        >
          Si funksionon EduKos?
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-ocean-mist text-white p-6 rounded-2xl shadow-lg flex flex-col gap-4 hover:scale-105 transition"
          >
            <UserPlus size={22} className="bg-white/20 w-10 h-10 p-2 rounded-lg" />
            <h3 className="font-semibold">Krijo llogari</h3>
            <p className="text-sm text-white/80">Regjistrohu si student në disa sekonda.</p>
            <span className="text-xs text-white/60 mt-auto">01</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-emerald text-white p-6 rounded-2xl shadow-lg flex flex-col gap-4 hover:scale-105 transition"
          >
            <School size={22} className="bg-white/20 w-10 h-10 p-2 rounded-lg" />
            <h3 className="font-semibold">Zbulo shkollat</h3>
            <p className="text-sm text-white/80">Shfleto institucionet në platformë.</p>
            <span className="text-xs text-white/60 mt-auto">02</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-green-light text-black p-6 rounded-2xl shadow-lg flex flex-col gap-4 hover:scale-105 transition"
          >
            <GitCompareArrows size={22} className="bg-white/20 w-10 h-10 p-2 rounded-lg" />
            <h3 className="font-semibold">Krahaso</h3>
            <p className="text-sm text-black/90">Krahaso dy shkolla lehtësisht.</p>
            <span className="text-xs text-black/60 mt-auto">03</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-light-green text-black p-6 rounded-2xl shadow-lg flex flex-col gap-4 hover:scale-105 transition"
          >
            <Send size={22} className="bg-white/40 w-10 h-10 p-2 rounded-lg" />
            <h3 className="font-semibold">Apliko</h3>
            <p className="text-sm text-black/70">Dërgo aplikimin direkt online.</p>
            <span className="text-xs text-black/50 mt-auto">04</span>
          </motion.div>

        </div>
      </section>

      <section className="w-full py-24 px-6 md:px-20 bg-white">
        
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm text-gray-500 mb-2">FAQ</p>
            <h2 className="text-4xl font-bold leading-tight">
              Pyetjet më të shpeshta
            </h2>
          </motion.div>
          <div className="space-y-4">

            {faqs.map((item, index) => {
              const isOpen = openIndex === index;

              return (
                <motion.div key={index} className="border-b pb-4">
                  
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex justify-between items-center text-left"
                  >
                    <span className="font-medium text-lg">
                      {item.q}
                    </span>

                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                    >
                      <ChevronDown />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-gray-600 mt-3 text-sm">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </motion.div>
              );
            })}

          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeSections;