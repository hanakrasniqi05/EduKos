import { motion } from "framer-motion";
import Footer from "../sections/Footer";

const team = [
  {
    name: "Florenta Elezi",
    role: "Software Engineer",
    img: ""
  },
  {
    name: "Hana Krasniqi",
    role: "Data Scientist",
    img: ""
  },
  {
    name: "Leon Berisha",
    role: "Backend Developer",
    img: ""
  },
  {
    name: "Albin Aliu",
    role: "Python Developer",
    img: ""
  },
  {
    name: "Blerton Lokaj",
    role: "Software Developer",
    img: ""
  }
];

export default function AboutUs() {
  return (
    <div className="min-h-screen text-gray-800">
      
      {/* HERO */}
      <section className="py-32 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-gray-900">
            Helping students
            <span className="block text-green-600">
              find clarity in their future
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-600">
            EduKos exists to remove confusion and give every student a clear path forward.
          </p>
        </motion.div>
      </section>

      {/* MISSION */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl h-80 w-full shadow-xl flex items-center justify-center">
              <div className="text-white text-center p-8">
                <div className="text-6xl mb-4">🎓</div>
                <p className="text-lg font-semibold">Empowering students since 2024</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-4 py-1 bg-green-100 rounded-full text-green-700 text-sm font-semibold mb-4">
              Our Mission
            </div>
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Making education choices <span className="text-green-600">simple and transparent</span>
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg mb-4">
              We believe every student deserves a clear, confident path to their future. 
              That's why we've built a platform that cuts through the noise and delivers 
              honest, structured information about education options.
            </p>
            <p className="text-gray-600 leading-relaxed text-lg">
              No confusion. No misleading promises. Just real insights to help you make 
              the best decision for your journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* TEAM */}
      <section className="py-20 px-6 bg-gray-50">
        <h2 className="text-center text-4xl font-bold mb-3 text-gray-900">Meet the Team</h2>
        <p className="text-center text-gray-500 mb-14">Class of 2026</p>

        <div className="grid md:grid-cols-5 sm:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {team.map((member, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-2xl shadow-md bg-white">
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-full h-64 object-cover group-hover:scale-110 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end justify-center pb-6">
                  <span className="text-white font-semibold">View Profile →</span>
                </div>
              </div>

              <div className="mt-4 text-center">
                <h3 className="font-semibold text-lg text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* VALUES */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">What We Stand For</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Core values that drive everything we do at EduKos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Clarity",
                desc: "We break down complex education paths into simple, actionable steps. No jargon, no confusion — just clear guidance."
              },
              {
                title: "Access",
                desc: "Information should be free and accessible to everyone. We're leveling the playing field for students everywhere."
              },
              {
                title: "Trust",
                desc: "Honesty is our foundation. We provide verified, transparent insights so you can make decisions with confidence."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      
      <Footer />

    </div>
  );
}