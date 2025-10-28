import { motion } from "framer-motion";
import {
  FaHandsHelping,
  FaGlobeAfrica,
  FaShieldAlt,
  FaTruck,
  FaChartLine,
  FaPeopleCarry,
} from "react-icons/fa";

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeInOut" } },
};

const About = () => {
  return (
    <div className="bg-light text-gray-800">
      {/* 🟣 Hero Section */}
      <section
        className="relative h-[60vh] bg-cover bg-center flex items-center justify-center text-white"
        style={{
          backgroundImage:
            "url('https://santosintl.com/wp-content/uploads/2023/07/630-July-Santos-International-Social-Thumbnail.png')",
        }}
      >
        <div className="absolute inset-0 bg-linear-to-r from-black/80 to-black/40"></div>
        <motion.div
          className="relative z-10 text-center px-6"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-accent">
            About BongoExpressCargo
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-gray-100">
            Pioneering fast, reliable, and global logistics solutions — connecting businesses to the world.
          </p>
        </motion.div>
      </section>

      {/* 🧭 Who We Are */}
      <section className="py-20 container mx-auto px-6 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-4xl font-bold mb-6 text-primary">Who We Are</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            At <span className="font-semibold text-primary">BongoExpressCargo</span>, we simplify global trade
            through innovation and efficiency. With a dedicated team and cutting-edge tracking
            technology, we ensure every package — big or small — arrives safely and on time.
          </p>

          {/* Highlighted cards */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 mt-10">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white shadow-lg p-8 rounded-2xl w-full sm:w-1/3"
            >
              <FaTruck className="text-5xl text-accent mb-4 mx-auto" />
              <h3 className="font-bold text-xl mb-2">Reliable Delivery</h3>
              <p>Speed and safety are at the core of our logistics operations worldwide.</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white shadow-lg p-8 rounded-2xl w-full sm:w-1/3"
            >
              <FaChartLine className="text-5xl text-accent mb-4 mx-auto" />
              <h3 className="font-bold text-xl mb-2">Continuous Growth</h3>
              <p>We constantly expand our reach and enhance our service quality.</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white shadow-lg p-8 rounded-2xl w-full sm:w-1/3"
            >
              <FaPeopleCarry className="text-5xl text-accent mb-4 mx-auto" />
              <h3 className="font-bold text-xl mb-2">Dedicated Team</h3>
              <p>Our professionals work 24/7 to keep global supply chains moving.</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* 📊 Stats Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <p className="text-6xl font-extrabold text-accent">15+</p>
            <p className="text-lg mt-2">Years of Experience</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <p className="text-6xl font-extrabold text-accent">5K+</p>
            <p className="text-lg mt-2">Satisfied Clients</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <p className="text-6xl font-extrabold text-accent">1M+</p>
            <p className="text-lg mt-2">Successful Deliveries</p>
          </motion.div>
        </div>
      </section>

      {/* 🌍 Mission & Vision */}
      <section className="bg-light py-20">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-4xl font-bold mb-6 text-primary">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              To deliver seamless logistics solutions that empower businesses to grow across borders,
              using innovation, reliability, and sustainability.
            </p>

            <h2 className="text-4xl font-bold mb-6 text-primary">Our Vision</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              To be the most trusted and tech-driven logistics partner globally, shaping the future
              of freight with transparency and excellence.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="flex justify-center"
          >
            <img
              src="https://sinay.ai/wp-content/uploads/2025/03/role-of-a-logistic-manager-scaled.jpg"
              alt="Mission and Vision"
              className="rounded-2xl shadow-2xl w-full md:w-5/6"
            />
          </motion.div>
        </div>
      </section>

      {/* 💎 Why Choose Us */}
      <section className="py-20 bg-linear-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            className="text-4xl font-bold text-primary mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            Why Choose BongoExpressCargo?
          </motion.h2>
          <div className="grid md:grid-cols-4 gap-8">
            <motion.div whileHover={{ y: -10 }} className="p-6 bg-white rounded-2xl shadow-md">
              <FaShieldAlt className="text-5xl text-accent mb-4 mx-auto" />
              <h3 className="font-semibold text-xl mb-2">Secure & Reliable</h3>
              <p>We handle every shipment with utmost care and tracking precision.</p>
            </motion.div>

            <motion.div whileHover={{ y: -10 }} className="p-6 bg-white rounded-2xl shadow-md">
              <FaGlobeAfrica className="text-5xl text-accent mb-4 mx-auto" />
              <h3 className="font-semibold text-xl mb-2">Global Network</h3>
              <p>Connecting continents through an extensive logistics network.</p>
            </motion.div>

            <motion.div whileHover={{ y: -10 }} className="p-6 bg-white rounded-2xl shadow-md">
              <FaHandsHelping className="text-5xl text-accent mb-4 mx-auto" />
              <h3 className="font-semibold text-xl mb-2">Customer First</h3>
              <p>Personalized support and seamless shipment tracking 24/7.</p>
            </motion.div>

            <motion.div whileHover={{ y: -10 }} className="p-6 bg-white rounded-2xl shadow-md">
              <FaTruck className="text-5xl text-accent mb-4 mx-auto" />
              <h3 className="font-semibold text-xl mb-2">Timely Delivery</h3>
              <p>On-time, every time — that’s our delivery promise to you.</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
