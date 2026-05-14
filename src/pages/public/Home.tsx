import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Package, 
  BarChart3, 
  Users, 
  ArrowRight,
  Settings,
  Truck,
  CheckCircle2,
  Wrench
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Package className="text-indigo-500" size={24} />,
      title: "Inventory Mastery",
      desc: "Real-time tracking of parts with automated low-stock alerts and smart categorization."
    },
    {
      icon: <BarChart3 className="text-purple-500" size={24} />,
      title: "Financial Intelligence",
      desc: "Deep insights into sales performance, revenue trends, and vendor ledger management."
    },
    {
      icon: <Users className="text-blue-500" size={24} />,
      title: "Customer CRM",
      desc: "Maintain detailed vehicle histories and customer profiles with integrated loyalty rewards."
    }
  ];

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'white', overflowX: 'hidden' }}>
      {/* Hero Section */}
      <section style={{ 
        padding: '100px 2rem', 
        textAlign: 'center', 
        position: 'relative',
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ maxWidth: '900px', zIndex: 2 }}
        >
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(99, 102, 241, 0.1)', 
            padding: '8px 20px', 
            borderRadius: '100px',
            color: 'var(--accent-secondary)',
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '2rem',
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}>
            <Settings size={16} className="animate-spin-slow" />
            Next-Gen Inventory Management
          </div>
          <h1 style={{ 
            fontSize: 'clamp(3rem, 8vw, 5rem)', 
            lineHeight: 1.1, 
            marginBottom: '1.5rem',
            fontWeight: 800
          }}>
            The Ultimate <span className="text-gradient">Engine</span> <br/> 
            for Your Parts Business
          </h1>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '1.25rem', 
            maxWidth: '700px', 
            margin: '0 auto 3rem',
            lineHeight: 1.6
          }}>
            PartSphere streamlines inventory, sales, and service appointments into one high-performance dashboard. Built for retailers, workshops, and suppliers.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <button 
              onClick={() => navigate('/login')}
              style={{
                background: 'var(--accent-gradient)',
                padding: '16px 32px',
                borderRadius: 'var(--radius-md)',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '1.1rem',
                boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)'
              }}
            >
              Get Started <ArrowRight size={20} />
            </button>
            <button 
              style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '16px 32px',
                borderRadius: 'var(--radius-md)',
                fontWeight: '600',
                fontSize: '1.1rem',
                border: '1px solid var(--glass-border)'
              }}
            >
              View Demo
            </button>
          </div>
        </motion.div>

        {/* Decorative Background */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80vw',
          height: '80vw',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)',
          zIndex: 1
        }}></div>
      </section>

      <section style={{ padding: '80px 2rem', background: 'rgba(99, 102, 241, 0.04)', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.15)', marginBottom: '1.5rem' }}>
            <Wrench size={28} className="text-indigo-400" />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 800 }}>PartSphere Vehicle Service Center</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Our workshop combines certified technicians with a live parts warehouse so repairs are not delayed waiting on components. Customers can book service online, track history, request hard-to-find parts, and receive maintenance guidance based on mileage and prior work performed here.
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
            Create a free customer account to book appointments, manage vehicles, and browse the catalog from anywhere.
          </p>
          <button
            type="button"
            onClick={() => navigate('/signup')}
            style={{
              marginTop: '1.75rem',
              background: 'rgba(99, 102, 241, 0.2)',
              color: 'white',
              padding: '12px 28px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              border: '1px solid rgba(99, 102, 241, 0.35)'
            }}
          >
            Customer sign up
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '100px 2rem', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Built for <span className="text-gradient">Scale</span></h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Everything you need to run a modern workshop or retail store.</p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2.5rem' 
          }}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="glass-card"
                style={{ padding: '3rem' }}
              >
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  background: 'rgba(255,255,255,0.05)', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem'
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '100px 2rem' }}>
        <div className="glass" style={{ 
          maxWidth: '1000px', 
          margin: '0 auto', 
          padding: '5rem', 
          borderRadius: 'var(--radius-xl)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Ready to optimize your <br/> <span className="text-gradient">Inventory?</span></h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '3rem' }}>
            Join hundreds of workshops that trust PartSphere for their daily operations.
          </p>
          <button 
            onClick={() => navigate('/signup')}
            style={{
              background: 'white',
              color: 'black',
              padding: '16px 40px',
              borderRadius: 'var(--radius-md)',
              fontWeight: '800',
              fontSize: '1.1rem'
            }}
          >
            Start Free Trial
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
