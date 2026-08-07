import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, HardDrive, Key, ChevronRight, Github } from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border-subtle">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
            <Lock className="w-4 h-4 text-accent" />
          </div>
          <span className="font-bold text-lg tracking-tight">Vaultic</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#features" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Features</a>
          <a href="#security" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Security</a>
          <a href="https://github.com/your-org/vaultic" target="_blank" rel="noreferrer" className="text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2">
            <Github className="w-4 h-4" />
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="pt-40 pb-20 px-6 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeIn} className="inline-block mb-4 px-3 py-1 rounded-full bg-border-subtle/50 border border-border-subtle text-xs text-text-secondary font-mono">
            Vaultic v0.1.0 is now available
          </motion.div>
          
          <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Encrypted API key vault <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent/60">
              for developers.
            </span>
          </motion.h1>
          
          <motion.p variants={fadeIn} className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
            Store and manage your API keys with military-grade AES-256-GCM encryption. 
            Everything is local. No accounts, no cloud, no telemetry.
          </motion.p>
          
          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="h-12 px-6 rounded-xl bg-accent hover:bg-accent-hover text-app font-medium flex items-center gap-2 transition-colors glow-accent">
              Download for macOS
              <ChevronRight className="w-4 h-4" />
            </button>
            <button className="h-12 px-6 rounded-xl bg-card hover:bg-card-hover border border-border-subtle text-text-primary font-medium flex items-center gap-2 transition-colors">
              Other platforms
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: <Shield className="w-6 h-6 text-accent" />,
      title: "AES-256-GCM Encryption",
      description: "Every key is encrypted with industry-standard authenticated encryption. Your keys are mathematically secure."
    },
    {
      icon: <Lock className="w-6 h-6 text-accent" />,
      title: "Zero-Knowledge Architecture",
      description: "Your master password is never stored. A verification hash ensures only you can decrypt your vault."
    },
    {
      icon: <HardDrive className="w-6 h-6 text-accent" />,
      title: "100% Local Storage",
      description: "Vaultic is an offline-first desktop app. Your data never leaves your device. No cloud sync, no tracking."
    },
    {
      icon: <Key className="w-6 h-6 text-accent" />,
      title: "Smart Management",
      description: "Group by projects, track expirations, and import from .env files seamlessly."
    }
  ];

  return (
    <section id="features" className="py-24 px-6 border-t border-border-subtle bg-sidebar/30">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Security without compromise.</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            We built Vaultic because we were tired of storing production API keys in plain text .env files or trusting them to cloud services.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { delay: idx * 0.1, duration: 0.5 } }
              }}
              className="p-8 rounded-2xl bg-card border border-border-subtle hover:border-accent/30 transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-text-secondary leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Security() {
  return (
    <section id="security" className="py-24 px-6 border-t border-border-subtle">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="flex-1 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
            <Lock className="w-4 h-4" />
            Built with Rust & Tauri
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">Native performance.<br/>Bulletproof security.</h2>
          <p className="text-text-secondary text-lg leading-relaxed">
            The core encryption engine is built using the Web Crypto API, backed by a lightweight and secure Rust backend. 
          </p>
          <ul className="space-y-4 pt-4">
            {[
              "PBKDF2-HMAC-SHA-256 with 600,000 iterations",
              "AES-KW (Key Wrap) for master password protection",
              "Exponential backoff on failed unlock attempts",
              "Strict Content Security Policy (CSP)"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-text-primary">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
        
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, scale: 0.95 },
            visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } }
          }}
          className="flex-1 w-full"
        >
          <div className="rounded-2xl border border-border-subtle bg-sidebar p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-transparent" />
            <div className="font-mono text-sm text-text-secondary space-y-2">
              <p><span className="text-accent">const</span> iv = crypto.getRandomValues(<span className="text-[#8b5cf6]">new</span> Uint8Array(12));</p>
              <p><span className="text-accent">const</span> encrypted = <span className="text-[#8b5cf6]">await</span> crypto.subtle.encrypt(</p>
              <p className="pl-4">{'{'} name: <span className="text-amber-400">"AES-GCM"</span>, iv {'}'},</p>
              <p className="pl-4">key,</p>
              <p className="pl-4">new TextEncoder().encode(apiKey)</p>
              <p>);</p>
              <p className="pt-4 text-text-muted">// Your keys are safe here.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border-subtle py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-text-muted" />
          <span className="font-semibold text-text-muted">Vaultic</span>
        </div>
        <p className="text-sm text-text-muted">
          Open source under the MIT License.
        </p>
        <div className="flex gap-4">
          <a href="#" className="text-sm text-text-muted hover:text-text-primary transition-colors">GitHub</a>
          <a href="#" className="text-sm text-text-muted hover:text-text-primary transition-colors">Releases</a>
          <a href="#" className="text-sm text-text-muted hover:text-text-primary transition-colors">Docs</a>
        </div>
      </div>
    </footer>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-app text-text-primary font-sans selection:bg-accent/30 selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Security />
      </main>
      <Footer />
    </div>
  );
}

export default App;
