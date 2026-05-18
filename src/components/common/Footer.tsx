import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Phone, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      padding: '4rem 2rem 2rem',
      borderTop: '1px solid var(--glass-border)',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '3rem',
        marginBottom: '4rem'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'var(--accent-gradient)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={20} color="white" />
            </div>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Part<span className="text-gradient">Sphere</span></h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '300px' }}>
            Advanced vehicle parts and inventory management system powered by AI. Streamline your operations with PartSphere.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Quick Links</h3>
          <Link to="/about" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'var(--transition)' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>About Us</Link>
          <a href="#" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'var(--transition)' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>Features</a>
          <a href="#" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'var(--transition)' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>Pricing</a>
          <a href="#" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'var(--transition)' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>Documentation</a>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Contact</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <Mail size={16} /> support@partsphere.com
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <Phone size={16} /> +1 (555) 000-0000
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <Globe size={16} /> www.partsphere.com
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        paddingTop: '2rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.8rem'
      }}>
        <p>© 2024 PartSphere AI. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <a href="#" style={{ transition: 'var(--transition)' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>Privacy Policy</a>
          <a href="#" style={{ transition: 'var(--transition)' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
