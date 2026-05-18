import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Cpu, 
  Users, 
  Zap, 
  Target, 
  Eye, 
  Mail, 
  MapPin, 
  Clock, 
  ArrowLeft 
} from 'lucide-react';

const About = () => {
  const navigate = useNavigate();

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'white', minHeight: '100vh', padding: '80px 2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Simple Back button */}
        <button 
          onClick={() => navigate('/')}
          style={{
            background: 'transparent',
            color: 'var(--text-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            marginBottom: '3rem',
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = 'white'}
          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        {/* Hero Header */}
        <section style={{ marginBottom: '5rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>About Us</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            PartSphere is a modern management platform built to streamline inventory, sales, and operations for automotive centers.
          </p>
        </section>

        {/* Simple Key Metrics */}
        <section style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '5rem' 
        }}>
          <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ color: 'var(--accent-secondary)', display: 'inline-flex', marginBottom: '1rem' }}><Cpu size={28} /></div>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>10,000+</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Parts Cataloged</p>
          </div>

          <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ color: 'var(--accent-secondary)', display: 'inline-flex', marginBottom: '1rem' }}><Users size={28} /></div>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>500+</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Active Workshops</p>
          </div>

          <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ color: 'var(--accent-secondary)', display: 'inline-flex', marginBottom: '1rem' }}><Zap size={28} /></div>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>99.9%</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>System Uptime</p>
          </div>
        </section>

        {/* Mission and Vision Grid */}
        <section style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2.5rem',
          marginBottom: '5rem'
        }}>
          <div className="glass-card" style={{ padding: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
              <div style={{ color: 'var(--accent-primary)' }}><Target size={24} /></div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Our Mission</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, fontSize: '0.95rem' }}>
              To replace slow and outdated paper processes in workshops with fast, automated, and easy-to-use digital inventory and tracking tools.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
              <div style={{ color: 'var(--accent-primary)' }}><Eye size={24} /></div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Our Vision</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, fontSize: '0.95rem' }}>
              To create the main software standard for the global automotive aftermarket, connecting suppliers, mechanics, and car owners.
            </p>
          </div>
        </section>

        {/* Simple Team Section */}
        <section style={{ marginBottom: '5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2.5rem', textAlign: 'center' }}>Our Team</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
            gap: '2rem' 
          }}>
            <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 800,
                color: 'white',
                margin: '0 auto 1.25rem'
              }}>
                AM
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Alex Mercer</h3>
              <p style={{ color: 'var(--accent-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>CEO & Co-Founder</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>Former systems engineer focused on supply-chain logistics.</p>
            </div>

            <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 800,
                color: 'white',
                margin: '0 auto 1.25rem'
              }}>
                CC
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Dr. Clara Chen</h3>
              <p style={{ color: 'var(--accent-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>Chief Technology Officer</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>Expert in operational research and automated stock replenishment.</p>
            </div>

            <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 800,
                color: 'white',
                margin: '0 auto 1.25rem'
              }}>
                MV
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Marcus Vance</h3>
              <p style={{ color: 'var(--accent-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>Product Specialist</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>Former workshop owner with 15 years of mechanical experience.</p>
            </div>
          </div>
        </section>

        {/* Contact Info (Clean list style) */}
        <section className="glass-card" style={{ padding: '3rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem', textAlign: 'center' }}>Contact Us</h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ color: 'var(--accent-secondary)' }}><Mail size={20} /></div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email</div>
                <a href="mailto:info@partsphere.com" style={{ fontSize: '0.95rem', color: 'white', fontWeight: 600 }}>info@partsphere.com</a>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ color: 'var(--accent-secondary)' }}><MapPin size={20} /></div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Locations</div>
                <span style={{ fontSize: '0.95rem', color: 'white', fontWeight: 600 }}>Silicon Valley & Munich</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ color: 'var(--accent-secondary)' }}><Clock size={20} /></div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Support Hours</div>
                <span style={{ fontSize: '0.95rem', color: 'white', fontWeight: 600 }}>Mon - Fri, 9 AM - 6 PM</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default About;
