'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import styled from 'styled-components';
import { Home, User, Users, Bookmark } from 'lucide-react';

const Nav = styled.nav`
  position: absolute;
  left: 20px;
  right: 20px;
  bottom: 20px;
  height: 78px;
  background: #241053;
  border-radius: 25px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.08);

  @media (max-width: 430px) {
    left: 10px;
    right: 10px;
  }
`;

// Type the custom prop and use transient prop ($active)
const NavLink = styled.a<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: ${(props) => (props.$active ? '#9d54ff' : '#fff')};
  font-size: 14px;
  gap: 8px;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    color: #9d54ff;
  }

  svg {
    font-size: 24px;
  }
`;

const navItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/mentor', label: 'Mentors', icon: Users },
  { href: '/saved', label: 'Saved', icon: Bookmark },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    router.push(href);
  };

  return (
    <Nav>
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <NavLink
            key={href}
            href={href}
            $active={active}
            onClick={(e) => handleClick(e, href)}
          >
            <Icon size={24} />
            <span>{label}</span>
          </NavLink>
        );
      })}
    </Nav>
  );
}