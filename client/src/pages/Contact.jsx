import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaEnvelope, FaPhone } from "react-icons/fa";

const Contact = () => {
  return (
    <div
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=2070')" }}
    >
      {/* 🌫️ Overlay for better readability */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

      <motion.div
        className="relative z-10 container mx-auto px-6 py-20 text-center text-white"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* 🏷️ Header */}
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
          Let’s Get in Touch
        </h1>
        <p className="text-gray-200 mb-12 max-w-2xl mx-auto text-lg">
          Whether you’re looking for a shipping quote or have questions about our logistics solutions,
          our team is ready to assist you.
        </p>

        {/* 📞 Contact Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto bg-white/90 backdrop-blur-md text-gray-800 shadow-2xl rounded-3xl overflow-hidden">
          {/* Contact Info */}
          <div className="bg-linear-to-br from-primary to-blue-900 p-8 md:p-10 text-white text-left flex flex-col justify-center rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none">
            <h2 className="text-3xl font-bold mb-6 text-accent">Contact Information</h2>
            <div className="space-y-4 text-lg">
              <p className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-accent" /> 123 Portway Avenue,
                Mombasa, Kenya
              </p>
              <p className="flex items-center gap-3">
                <FaEnvelope className="text-accent" />{" "}
                support@bongoexpresscargo.com
              </p>
              <p className="flex items-center gap-3">
                <FaPhone className="text-accent" /> +254 712 345 678
              </p>
            </div>
            <p className="mt-8 text-gray-300">
              We aim to respond within 24 hours on business days.
            </p>
          </div>

          {/* Form */}
          <form className="p-8 md:p-10 space-y-5 bg-white text-left">
            <h2 className="text-3xl font-bold mb-6 text-primary">Send us a Message</h2>
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Subject
              </label>
              <input
                type="text"
                placeholder="e.g., Shipping Quote"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Message
              </label>
              <textarea
                rows="4"
                placeholder="Write your message..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-yellow-400 text-gray-900 font-bold py-3 rounded-lg hover:bg-yellow-500 transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* 🗺️ Google Map Section */}
        <motion.div
          className="mt-16 max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-lg border border-gray-300"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <iframe
            title="BongoExpressCargo Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.698923947033!2d39.6682060749655!3d-4.043477945667516!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x184012a9d91b3763%3A0x7e2a37b632a7e60c!2sMombasa!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske"
            className="w-full h-[300px] md:h-[400px]"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Contact;
