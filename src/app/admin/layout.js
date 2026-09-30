'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Sidebar from '@/components/admin/Sidebar';
import styles from './layout.module.css';

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);

  const toggleMenu = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', { method: 'POST' });
      if (response.ok) {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className={styles.mainContainer}>
      {/* NAVBAR */}
      <nav className={styles.nav}>
        <div className={styles.navLeft}>
          <button className={styles.menuToggle} onClick={toggleMenu}>
            ☰
          </button>
          <Link href="/admin" className={styles.logo}  onClick={toggleMenu}>
            <Image src="/logo.png" alt="Logo" width={40} height={40} />
            KANBAN board
          </Link>
        </div>
        <div className={styles.profileContainer}>
          <div className={styles.profileIcon} onClick={toggleProfileMenu}>
            <Image src="/profile-image.webp" alt="Profilo" width={35} height={35} />
          </div>
          {isProfileMenuOpen && (
            <div className={styles.profileMenu}>
              <div className={styles.menuItem}>👤 Profilo</div>
              <div className={styles.menuItem}>⚙️ Impostazioni</div>
              <div className={styles.menuItem}>🔐 Cambia Password</div>
              <hr className={styles.menuDivider} />
              <div className={styles.menuItem} onClick={handleLogout}>
                🚪 Logout
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* SIDEBAR */}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleMenu={toggleMenu} />

      {/* MAIN CONTENT */}
      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
}
