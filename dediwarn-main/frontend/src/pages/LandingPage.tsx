import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

const LandingPage: React.FC = () => {
  const [currentStatIndex, setCurrentStatIndex] = useState(0);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const stats = [
    { value: '2.4M+', label: 'Lives Protected', icon: '🛡️' },
    { value: '150+', label: 'Countries', icon: '🌍' },
    { value: '99.9%', label: 'Uptime', icon: '⚡' },
    { value: '<3s', label: 'Alert Speed', icon: '🚨' }
  ];

  const features = [
    {
      icon: '🌍',
      title: 'Global Environmental Monitoring',
      description: 'Real-time satellite data and AI-powered analysis of climate patterns, deforestation, and ocean health.',
      gradient: 'from-green-400 to-blue-500'
    },
    {
      icon: '🤝',
      title: 'Multi-Stakeholder Collaboration',
      description: 'Connect governments, NGOs, researchers, and communities for coordinated environmental action.',
      gradient: 'from-purple-400 to-pink-500'
    },
    {
      icon: '🚨',
      title: 'Instant Disaster Alerts',
      description: 'Blockchain-verified emergency warnings with sub-3-second global distribution.',
      gradient: 'from-red-400 to-orange-500'
    },
    {
      icon: '📊',
      title: 'AI-Powered Analytics',
      description: 'Advanced predictive models for climate risks, disaster patterns, and environmental trends.',
      gradient: 'from-blue-400 to-cyan-500'
    },
    {
      icon: '🎓',
      title: 'Educational Gamification',
      description: 'Interactive learning modules and achievement systems to boost climate literacy worldwide.',
      gradient: 'from-yellow-400 to-orange-500'
    },
    {
      icon: '🔗',
      title: 'Open Data Integration',
      description: 'Seamless connection to UNEP, Global Forest Watch, Ocean Health Index, and NASA Climate APIs.',
      gradient: 'from-indigo-400 to-purple-500'
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Chen',
      role: 'Climate Scientist, UN Environment',
      avatar: '👩‍🔬',
      quote: 'ClimaAid has revolutionized how we share and act on environmental data globally.'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Emergency Response Coordinator',
      avatar: '👨‍🚒',
      quote: 'The instant alert system has helped us save thousands of lives during recent disasters.'
    },
    {
      name: 'Priya Sharma',
      role: 'NGO Director, Ocean Conservation',
      avatar: '👩‍🌾',
      quote: 'The collaboration platform has united our efforts like never before.'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatIndex((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [stats.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-green-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      {/* Hero Section */}
      <motion.section 
        className="relative z-10 min-h-screen flex items-center justify-center px-4"
        style={{ y, opacity }}
      >
        <div className="text-center max-w-6xl mx-auto">
          {/* Logo Animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, type: "spring", stiffness: 100 }}
            className="mb-8"
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-4xl font-bold shadow-2xl">
              🛡️
            </div>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6"
          >
            ClimaAid
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl md:text-2xl text-slate-300 mb-8 max-w-4xl mx-auto"
          >
            Climate Aid Platform - Protecting our planet through 
            <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent font-semibold"> AI-powered environmental monitoring</span>, 
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent font-semibold"> blockchain security</span>, and 
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent font-semibold"> global collaboration</span>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link
              to="/enhanced-dashboard"
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden"
            >
              <span className="relative z-10">🌍 Explore Dashboard</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link
              to="/collaboration"
              className="group relative px-8 py-4 bg-gradient-to-r from-green-500 to-teal-600 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden"
            >
              <span className="relative z-10">🤝 Join Collaboration</span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </motion.div>

          {/* Animated Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className={`p-6 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-600 transition-all duration-500 ${
                  index === currentStatIndex ? 'scale-110 border-blue-400 shadow-2xl' : 'scale-100'
                }`}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-slate-400 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-6">
              Revolutionary Features
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Combining cutting-edge technology with environmental science to create the world's most comprehensive disaster prevention platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="group relative p-8 rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-600 hover:border-transparent hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <div className="relative z-10">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-6">
              Trusted Globally
            </h2>
            <p className="text-xl text-slate-300">
              Hear from the experts who rely on ClimaAid every day
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="p-8 rounded-2xl bg-slate-800/70 backdrop-blur-sm border border-slate-600 hover:border-blue-400 hover:shadow-2xl transition-all duration-300"
              >
                <div className="text-6xl mb-4 text-center">{testimonial.avatar}</div>
                <p className="text-slate-300 mb-6 text-center italic">
                  "{testimonial.quote}"
                </p>
                <div className="text-center">
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-slate-400 text-sm">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="p-12 rounded-3xl bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-blue-400">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Ready to Protect Our Planet?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Join millions of users worldwide in building a more resilient and sustainable future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/enhanced-dashboard"
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden"
              >
                <span className="relative z-10">🚀 Get Started Now</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link
                to="/education"
                className="group relative px-8 py-4 bg-gradient-to-r from-green-500 to-teal-600 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden"
              >
                <span className="relative z-10">📚 Learn More</span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
