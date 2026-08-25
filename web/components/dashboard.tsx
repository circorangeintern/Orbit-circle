"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import styled from "styled-components";
import Image from "next/image";
import { useGetMe, useLogout } from "@/hooks/auth.hook";
import colors from "@/lib/colors";
import { Logo } from "@/components/onboarding/shared";

const Shell = styled.div`
  display: flex;
  min-height: 100dvh;
  background: ${colors.background};
  color: ${colors.otherWhite};
  font-family: Inter, sans-serif;
  width: 100%;
  max-width: 100%;
`;

const Aside = styled.aside`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 264px;
  padding: 28px 24px;
  border-right: 1px solid ${colors.borderAccent};
  background: ${colors.background};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 48px;
  z-index: 10;

  @media (max-width: 860px) {
    display: none;
  }
`;

const MobileHeader = styled.div`
  display: none;

  @media (max-width: 860px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 20px;
  }
`;

const MobileBrand = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 20px;
`;

const BottomNav = styled.nav`
  display: none;

  @media (max-width: 860px) {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 20;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
    gap: 4px;
    padding: 10px 8px 12px;
    background: ${colors.panel};
    border-top: 1px solid ${colors.borderAccent};
  }
`;

const BottomItem = styled.a<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 0;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  text-decoration: none;
  color: ${(p) => (p.$active ? colors.buttonPurple : colors.normalWhite)};
  background: ${(p) => (p.$active ? colors.purpleSoft : "transparent")};
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 24px;
`;

const BrandLogo = styled(Image)`
  width: 44px;
  height: 44px;
  flex-shrink: 0;

  @media (max-width: 860px) {
    width: 30px;
    height: 30px;
  }
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 32px;
`;

const NavItem = styled.a<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 500;
  text-decoration: none;
  color: ${(p) => (p.$active ? colors.buttonPurple : colors.normalWhite)};
  background: ${(p) => (p.$active ? colors.purpleSoft : "transparent")};
  border: 1px solid
    ${(p) => (p.$active ? "rgba(119,59,236,0.5)" : "transparent")};

  &:hover {
    background: rgba(119, 59, 236, 0.12);
  }
`;

const Main = styled.main`
  margin-left: 264px;
  flex: 1;
  width: calc(100% - 264px);
  min-width: 0;
  padding: 28px 40px 64px;
  display: flex;
  flex-direction: column;

  @media (max-width: 860px) {
    margin-left: 0;
    width: 100%;
    padding: 20px 16px 104px;
  }
`;

const TopBar = styled.header`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: 861px) {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
  }
`;

const DesktopHeaderRight = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: 860px) {
    display: none;
  }
`;

const UserActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;

  @media (max-width: 860px) {
    gap: 10px;

    /* Hide full username on mobile so only icon, avatar, logout, or action buttons display */
    .user-name-text {
      display: none;
    }
  }
`;

const Avatar = styled.span`
  width: 52px;
  height: 52px;
  flex: none;
  border-radius: 50%;
  background: ${colors.buttonPurple};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: ${colors.normalWhite};

  @media (max-width: 860px) {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }
`;

export const Card = styled.section`
  background: ${colors.card};
  border: 1px solid ${colors.cardBorder};
  border-radius: 20px;
  padding: 24px;
`;

export const Accent = styled.span`
  color: ${colors.buttonPurple};
`;

export const Muted = styled.p`
  margin: 0;
  color: ${colors.muted};
`;

export const LogoutButton = styled.button`
  width: 100%;
  border: none;
  border-radius: 14px;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.08);
  color: ${colors.otherWhite};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 150ms ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }
`;

const MobileLogoutIconButton = styled.button`
  display: none;

  @media (max-width: 860px) {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 5px;
    font-size: 10px;
    width: 50px;
    height: 30px;
    color: ${colors.normalWhite};
    cursor: pointer;

    &:active {
      background: rgba(255, 255, 255, 0.18);
    }
  }
`;

function Icon({ d }: { d: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const NAV = [
  { to: "/home", label: "Home", d: "M4 10.5 12 4l8 6.5V20H4z" },
  { to: "/quiz", label: "Quiz", d: "M5 3h14v18H5zM9 8h6M9 12h6M9 16h4" },
  {
    to: "/mentor",
    label: "Mentors",
    d: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 19c0-2.8 2.7-4.5 6-4.5S15 16.2 15 19M16 6.2a3 3 0 0 1 0 5.6M18 19c0-2 -.8-3.3-2-4",
  },
  { to: "/saved", label: "Saved", d: "M7 4h10v16l-5-3.5L7 20z" },
] as const;

type DashboardUserContextValue = {
  user: unknown | null;
  userName: string;
  initials: string;
  isLoading: boolean;
  isError: boolean;
};

const DashboardUserContext = createContext<DashboardUserContextValue>({
  user: null,
  userName: "Explorer",
  initials: "EX",
  isLoading: true,
  isError: false,
});

function normalizeUserName(user: unknown): string {
  if (!user || typeof user !== "object") return "Explorer";

  const record = user as Record<string, unknown>;
  const candidates = [
    record.full_name,
    record.fullName,
    record.name,
    record.username,
    record.first_name,
    record.email,
  ];

  const firstCandidate = candidates.find((value): value is string => typeof value === "string" && value.trim().length > 0);
  if (!firstCandidate) return "Explorer";

  if (firstCandidate.includes("@")) {
    return firstCandidate.split("@")[0];
  }

  return firstCandidate.trim();
}

function getInitials(name: string) {
  const parts = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "EX";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function useDashboardUser() {
  return useContext(DashboardUserContext);
}

export function BellIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6.5 10a5.5 5.5 0 1 1 11 0c0 4 1.5 5.5 1.5 5.5H5S6.5 14 6.5 10ZM10 19a2.2 2.2 0 0 0 4 0"
        stroke={colors.normalWhite}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 12h15M13 6l6 6-6 6"
        stroke={colors.normalWhite}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DashboardShell({
  heading,
  topRight,
  children,
}: {
  heading?: ReactNode;
  topRight?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const logoutMutation = useLogout();
  const { data, isLoading, isError } = useGetMe();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => router.push("/login"),
    });
  };

  const userValue = useMemo<DashboardUserContextValue>(() => {
    const userName = normalizeUserName(data);

    return {
      user: data ?? null,
      userName,
      initials: getInitials(userName),
      isLoading,
      isError,
    };
  }, [data, isError, isLoading]);

  const defaultUserActions = (
    <UserActions>
      <BellIcon />
      <Avatar>{userValue.initials}</Avatar>
      <span className="user-name-text">{userValue.userName}</span>
      <MobileLogoutIconButton type="button" title="Logout" onClick={handleLogout}>
        Log out
      </MobileLogoutIconButton>
    </UserActions>
  );

  return (
    <DashboardUserContext.Provider value={userValue}>
      <Shell>
        <Aside>
          <div>
            <Brand>
              <Logo />
            </Brand>
            <Nav>
              {NAV.map((n) => (
                <NavItem key={n.label} href={n.to} $active={pathname === n.to}>
                  <Icon d={n.d} />
                  {n.label}
                </NavItem>
              ))}
            </Nav>
          </div>
          <LogoutButton type="button" onClick={handleLogout}>
            Logout
          </LogoutButton>
        </Aside>

        <Main>
          {/* Mobile-only header row that combines Logo with Action buttons */}
          <MobileHeader>
            <MobileBrand>
              <BrandLogo src="/image/Logo.png" alt="CareerMap logo" width={30} height={30} priority />
              <span>
                Career<Accent>Map</Accent>
              </span>
            </MobileBrand>

            <div>{topRight ?? defaultUserActions}</div>
          </MobileHeader>

          {/* Title / Welcome Heading in its own block below the header row */}
          <TopBar>
            <div style={{ minWidth: 0 }}>{heading}</div>

            {/* Desktop right action section */}
            <DesktopHeaderRight>
              {topRight ?? defaultUserActions}
            </DesktopHeaderRight>
          </TopBar>

          {children}
        </Main>

        <BottomNav>
          {NAV.map((n) => (
            <BottomItem key={n.label} href={n.to} $active={pathname === n.to}>
              <Icon d={n.d} />
              {n.label}
            </BottomItem>
          ))}
        </BottomNav>
      </Shell>
    </DashboardUserContext.Provider>
  );
}