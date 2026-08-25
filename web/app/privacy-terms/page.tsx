'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import styled from 'styled-components'
import { Logo } from '@/components/onboarding/shared'
import colors from '@/lib/colors'
import { 
  ArrowLeft, 
  Search, 
  ShieldCheck, 
  FileText, 
  Info, 
  Lock, 
  Server, 
  BarChart3, 
  Mail, 
  AlertTriangle, 
  ArrowRight, 
  Check, 
  Loader2 
} from 'lucide-react'

export default function PrivacyTermsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy')
  const [searchQuery, setSearchQuery] = useState('')

  // Lazy state initialization prevents synchronous setState in useEffect / hydration warnings
  const [accepted, setAccepted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('termsAccepted') === 'true'
    }
    return false
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const documentRef = useRef<HTMLDivElement>(null)

  // Handle Tab Switch
  const handleTabChange = (tab: 'privacy' | 'terms') => {
    setActiveTab(tab)
    setSearchQuery('')
  }

  // Save acceptance locally and sync to backend
  const handleContinue = async () => {
    if (!accepted || isSubmitting) return

    setIsSubmitting(true)
    const acceptedAt = new Date().toISOString()

    localStorage.setItem('termsAccepted', 'true')
    localStorage.setItem('termsAcceptedAt', acceptedAt)

    // const token = localStorage.getItem('token')
    // if (token) {
    //   try {
    //     await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/accept-terms`, {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //         Authorization: `Bearer ${token}`,
    //       },
    //       body: JSON.stringify({
    //         accepted: true,
    //         acceptedAt,
    //       }),
    //     })
    //   } catch (error) {
    //     console.warn('Backend connection failed:', error)
    //   }
    // }

    setIsSubmitting(false)
    setIsSuccess(true)

    setTimeout(() => {
      router.push('/signup')
    }, 700)
  }

  // Highlight matches helper
  const renderTextWithHighlight = (text: string) => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return text

    const escapedQuery = searchQuery.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escapedQuery})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? <HighlightMark key={index}>{part}</HighlightMark> : part
    )
  }

  return (
    <PageWrapper>
      <Container>
        {/* Header */}
        <TopHeader>
          <BrandLink>
            <Logo />
          </BrandLink>

          <BackButton onClick={() => router.back()}>
            <ArrowLeft size={16} />
            Back
          </BackButton>
        </TopHeader>

        {/* Page Title */}
        <PageHeader>
          <Eyebrow>CAREERMAP</Eyebrow>
          <MainTitle>Privacy Policy & Terms</MainTitle>
          <Subtitle>
            Learn how CareerMap collects, uses and protects your information, and the terms that govern your use of the platform.
          </Subtitle>
        </PageHeader>

        {/* Controls */}
        <ControlsSection>
          <Tabs>
            <TabButton
              type="button"
              $active={activeTab === 'privacy'}
              onClick={() => handleTabChange('privacy')}
            >
              Privacy Policy
            </TabButton>
            <TabButton
              type="button"
              $active={activeTab === 'terms'}
              onClick={() => handleTabChange('terms')}
            >
              Terms & Conditions
            </TabButton>
          </Tabs>

          <SearchBox>
            <Search size={18} color="rgba(255, 255, 255, 0.4)" />
            <SearchInput
              type="search"
              placeholder="Search policy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
            />
          </SearchBox>
        </ControlsSection>

        {/* ================= PRIVACY POLICY ================= */}
        {activeTab === 'privacy' && (
          <DocumentCard ref={documentRef}>
            <DocumentHeader>
              <DocumentIcon>
                <ShieldCheck size={28} />
              </DocumentIcon>
              <div>
                <h2>Part A — Privacy Policy</h2>
                <p>How CareerMap collects, uses and protects your information.</p>
              </div>
            </DocumentHeader>

            <Section>
              <h3>1. Introduction</h3>
              <p>
                {renderTextWithHighlight(
                  'CareerMap is a career discovery platform operated by ORBIT CIRCLE, helping secondary school and early university students discover suitable career paths through a personality and interests assessment.'
                )}
              </p>
              <p>
                {renderTextWithHighlight(
                  'This Privacy Policy explains what information we collect, how we use it, who we share it with, and the rights you have over your data.'
                )}
              </p>
              <p>
                {renderTextWithHighlight(
                  'This Policy is written to align with the Nigeria Data Protection Act, 2023 (NDPA) and the Nigeria Data Protection Regulation (NDPR).'
                )}
              </p>
              <p>
                {renderTextWithHighlight(
                  'By creating an account or using CareerMap, you agree to the collection and use of information as described here.'
                )}
              </p>

              <NoticeBox>
                <Info size={20} />
                <span>
                  If you are under 18, a parent or guardian should review this Policy with you before you sign up.
                </span>
              </NoticeBox>
            </Section>

            <Section>
              <h3>2. Information We Collect</h3>
              <p>We collect the following categories of information:</p>
              <ul>
                <li>
                  <strong>Account information:</strong> full name, email address, date of birth or age range, school/institution and password.
                </li>
                <li>
                  <strong>Assessment data:</strong> responses to the Interests & Strengths Quiz and career recommendations generated from them.
                </li>
                <li>
                  <strong>Usage data:</strong> careers viewed, saved or searched for, pages visited and general interaction patterns.
                </li>
                <li>
                  <strong>Mentor request data:</strong> questions submitted to professionals and contact details required to route or respond.
                </li>
                <li>
                  <strong>Device & technical data:</strong> IP address, browser type, device type and operating system.
                </li>
                <li>
                  <strong>Authentication data:</strong> information processed by our authentication provider for sign-up, login and session security.
                </li>
              </ul>
            </Section>

            <Section>
              <h3>3. How We Use Your Information</h3>
              <p>We use the information collected to:</p>
              <ul>
                <li>Generate personalized career recommendations.</li>
                <li>Maintain your account and bookmarked careers.</li>
                <li>Route mentor questions to the appropriate professional.</li>
                <li>Monitor and improve platform performance.</li>
                <li>Communicate with you about your account and policy updates.</li>
                <li>Detect, prevent and address technical issues, fraud or misuse.</li>
              </ul>
              <HighlightBox>We do not sell your personal data.</HighlightBox>
            </Section>

            <Section>
              <h3>4. Children and Minors</h3>
              <p>
                CareerMap is intended for secondary school students and early university students. We recognize that some users are minors under the age of 18.
              </p>
              <ul>
                <li>Where required by applicable law, parental or guardian awareness/consent may be required.</li>
                <li>Data collection from minors is limited to what is reasonably necessary.</li>
                <li>We do not knowingly use minors&apos; data for third-party advertising.</li>
                <li>Parents or guardians may contact us to review, correct or request deletion of their child&apos;s data.</li>
              </ul>
            </Section>

            <Section>
              <h3>5. Third-Party Services</h3>
              <p>To operate CareerMap, limited data may be shared with third-party service providers.</p>
              <ServiceGrid>
                <ServiceCard>
                  <Lock size={22} />
                  <h4>Authentication</h4>
                  <p>Handles account sign-up, login and password/session security.</p>
                </ServiceCard>

                <ServiceCard>
                  <Server size={22} />
                  <h4>Hosting</h4>
                  <p>Stores application data and serves the CareerMap platform.</p>
                </ServiceCard>

                <ServiceCard>
                  <BarChart3 size={22} />
                  <h4>Analytics</h4>
                  <p>Helps understand anonymized and aggregated platform engagement.</p>
                </ServiceCard>
              </ServiceGrid>
            </Section>

            <Section>
              <h3>6. Data Storage & Security</h3>
              <ul>
                <li>Data is stored on servers provided by our hosting provider.</li>
                <li>Encryption is used in transit through HTTPS.</li>
                <li>Passwords are never stored in plain text.</li>
                <li>Access to personal data is limited to authorized team members.</li>
              </ul>
            </Section>

            <Section>
              <h3>7. Your Rights</h3>
              <p>Under the NDPA/NDPR, you have the right to:</p>
              <ul>
                <li>Access your personal data.</li>
                <li>Request correction of inaccurate data.</li>
                <li>Request deletion of your data.</li>
                <li>Withdraw consent to processing.</li>
                <li>Object to certain uses of your data.</li>
                <li>Lodge a complaint with the Nigeria Data Protection Commission.</li>
              </ul>
            </Section>

            <Section>
              <h3>8. Data Retention</h3>
              <p>We retain account and assessment data for as long as your account is active or as needed to provide the service.</p>
              <p>
                If you delete your account, we will delete or anonymize your personal data within 30 days, except where retention is required for legal, security or dispute-resolution purposes.
              </p>
            </Section>

            <Section>
              <h3>9. Cookies & Similar Technologies</h3>
              <p>We use cookies or similar local storage technologies to keep you logged in and collect anonymized usage analytics.</p>
            </Section>

            <Section>
              <h3>10. Changes to This Policy</h3>
              <p>We may update this Privacy Policy as the Platform evolves. Material changes will be notified via email or an in-app notice at least 7 days before they take effect.</p>
            </Section>

            <Section>
              <h3>11. Contact Us</h3>
              <ContactCard>
                <Mail size={22} />
                <div>
                  <h4>Questions about your privacy?</h4>
                  <p>eyitayoibiyooye23@gmail.com</p>
                </div>
              </ContactCard>
            </Section>
          </DocumentCard>
        )}

        {/* ================= TERMS & CONDITIONS ================= */}
        {activeTab === 'terms' && (
          <DocumentCard ref={documentRef}>
            <DocumentHeader>
              <DocumentIcon>
                <FileText size={28} />
              </DocumentIcon>
              <div>
                <h2>Part B — Terms and Conditions</h2>
                <p>Terms governing your use of CareerMap.</p>
              </div>
            </DocumentHeader>

            <Section>
              <h3>1. Acceptance of Terms</h3>
              <p>
                By creating an account or using CareerMap, operated by Orbit-Circle, you agree to be bound by these Terms and Conditions.
              </p>
            </Section>

            <Section>
              <h3>2. Eligibility & Accounts</h3>
              <ul>
                <li>CareerMap is intended for secondary school students, early university students and career explorers.</li>
                <li>You must provide accurate information when creating an account.</li>
                <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                <li>You may not create an account on behalf of another person without their knowledge and consent.</li>
              </ul>
            </Section>

            <Section>
              <h3>3. Use of the Platform</h3>
              <p>You agree to use CareerMap only for its intended purpose — career discovery, exploration and learning.</p>
              <p>You agree not to:</p>
              <ul>
                <li>Submit false, misleading or abusive content.</li>
                <li>Attempt to access other users&apos; accounts without authorization.</li>
                <li>Harass, impersonate or misrepresent yourself.</li>
                <li>Reverse-engineer, scrape or attempt to extract the platform&apos;s recommendation logic.</li>
              </ul>
            </Section>

            <Section>
              <h3>4. Career Recommendations Disclaimer</h3>
              <p>
                Career recommendations, salary ranges and learning-resource suggestions provided by CareerMap are generated from a self-reported assessment and are intended as guidance only.
              </p>

              <WarningBox>
                <AlertTriangle size={20} />
                <span>CareerMap recommendations are not professional career, financial or educational advice.</span>
              </WarningBox>
            </Section>

            <Section>
              <h3>5. Mentor Interactions Disclaimer</h3>
              <ul>
                <li>Mentors featured on CareerMap are independent professionals.</li>
                <li>CareerMap does not employ, supervise or guarantee the conduct of any mentor.</li>
                <li>Users should exercise their own judgment regarding advice received.</li>
              </ul>
            </Section>

            <Section>
              <h3>6. Intellectual Property</h3>
              <p>
                All content on CareerMap, including assessment methodology, career descriptions, design and branding, is the property of Orbit-Circle or its licensors.
              </p>
            </Section>

            <Section>
              <h3>7. Limitation of Liability</h3>
              <p>
                To the maximum extent permitted by applicable law, CareerMap shall not be liable for decisions made by users based on career recommendations, salary information or mentor advice.
              </p>
              <p>
                CareerMap is also not responsible for indirect, incidental or consequential damages arising from use of or inability to use the Platform.
              </p>
            </Section>

            <Section>
              <h3>8. Account Termination</h3>
              <p>
                We may suspend or terminate accounts that violate these Terms, including misuse of the mentor-request feature or submission of abusive content.
              </p>
              <p>Users may request account deletion at any time via:</p>
              <p style={{ color: colors.buttonPurple, fontWeight: 600 }}>eyitayoibiyooye23@gmail.com</p>
            </Section>

            <Section>
              <h3>9. Governing Law</h3>
              <p>These Terms are governed by the laws of the Federal Republic of Nigeria.</p>
            </Section>

            <Section>
              <h3>10. Changes to These Terms</h3>
              <p>
                We may revise these Terms from time to time. Continued use of CareerMap after revised Terms are posted constitutes acceptance.
              </p>
            </Section>

            <Section>
              <h3>11. Contact Us</h3>
              <ContactCard>
                <Mail size={22} />
                <div>
                  <h4>Questions about these Terms?</h4>
                  <p>eyitayoibiyooye23@gmail.com</p>
                </div>
              </ContactCard>
            </Section>
          </DocumentCard>
        )}

        {/* Accept Terms Bar */}
        <AcceptSection>
          <AcceptLabel>
            <input
              type="checkbox"
              id="acceptTerms"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <span>I have read and agree to the Privacy Policy and Terms & Conditions.</span>
          </AcceptLabel>

          <ContinueButton onClick={handleContinue} disabled={!accepted || isSubmitting}>
            {isSubmitting ? (
              <>
                Saving...
                <Loader2 size={18} className="animate-spin" />
              </>
            ) : isSuccess ? (
              <>
                Accepted
                <Check size={18} />
              </>
            ) : (
              <>
                Continue
                <ArrowRight size={18} />
              </>
            )}
          </ContinueButton>
        </AcceptSection>
      </Container>
    </PageWrapper>
  )
}

/* ---------------- Styled Components ---------------- */

const PageWrapper = styled.main`
  min-height: 100vh;
  width: 100%;
  background: ${colors.background};
  color: ${colors.normalWhite};
  font-family: 'Inter', sans-serif;
  padding: 30px 24px 80px;
`

const Container = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
`

const TopHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 48px;
`

/* Changed from styled.a to styled.div to avoid nested <a> tags */
const BrandLink = styled.div`
  display: flex;
  align-items: center;
`

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${colors.normalWhite};
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.buttonPurple};
    border-color: ${colors.buttonPurple};
    transform: translateY(-2px);
  }
`

const PageHeader = styled.section`
  margin-bottom: 32px;
`

const Eyebrow = styled.span`
  display: inline-block;
  color: ${colors.buttonPurple};
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  margin-bottom: 8px;
`

const MainTitle = styled.h1`
  font-size: clamp(30px, 4vw, 44px);
  font-weight: 700;
  margin: 0 0 12px 0;
  color: ${colors.normalWhite};
`

const Subtitle = styled.p`
  max-width: 720px;
  font-size: 15px;
  line-height: 1.7;
  color: rgba(248, 250, 252, 0.8);
  margin: 0;
`

const ControlsSection = styled.section`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`

const Tabs = styled.div`
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.04);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
`

const TabButton = styled.button<{ $active: boolean }>`
  background: ${({ $active }) => ($active ? colors.buttonPurple : 'transparent')};
  color: ${colors.normalWhite};
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
`

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0 16px;
  height: 44px;
  border-radius: 12px;
  width: 100%;
  max-width: 300px;
`

const SearchInput = styled.input`
  background: transparent;
  border: none;
  outline: none;
  color: ${colors.normalWhite};
  font-size: 14px;
  width: 100%;

  &::placeholder {
    color: rgba(248, 250, 252, 0.4);
  }
`

const DocumentCard = styled.article`
  background: rgba(22, 6, 68, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 36px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    padding: 24px;
  }
`

const DocumentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  h2 {
    margin: 0 0 4px 0;
    font-size: 22px;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: rgba(248, 250, 252, 0.6);
  }
`

const DocumentIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(119, 59, 236, 0.2);
  color: ${colors.buttonPurple};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;

  h3 {
    font-size: 18px;
    color: ${colors.normalWhite};
    margin: 0 0 4px 0;
  }

  p {
    font-size: 14.5px;
    line-height: 1.7;
    color: rgba(248, 250, 252, 0.8);
    margin: 0;
  }

  ul {
    margin: 0;
    padding-left: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    li {
      font-size: 14.5px;
      line-height: 1.6;
      color: rgba(248, 250, 252, 0.8);
    }
  }
`

const NoticeBox = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(119, 59, 236, 0.12);
  border-left: 4px solid ${colors.buttonPurple};
  padding: 14px 18px;
  border-radius: 8px;
  color: ${colors.normalWhite};
  font-size: 14px;
  margin-top: 8px;
`

const WarningBox = styled(NoticeBox)`
  background: rgba(245, 158, 11, 0.12);
  border-left-color: #f59e0b;
  color: #fef3c7;
`

const HighlightBox = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 18px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  color: ${colors.normalWhite};
  width: fit-content;
  margin-top: 8px;
`

const ServiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-top: 8px;
`

const ServiceCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  svg {
    color: ${colors.buttonPurple};
  }

  h4 {
    margin: 0;
    font-size: 16px;
  }

  p {
    font-size: 13px;
    color: rgba(248, 250, 252, 0.6);
  }
`

const ContactCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 18px 24px;
  width: fit-content;

  svg {
    color: ${colors.buttonPurple};
  }

  h4 {
    margin: 0 0 2px 0;
    font-size: 15px;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: ${colors.buttonPurple};
    font-weight: 500;
  }
`

const AcceptSection = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: rgba(22, 6, 68, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px 28px;
  border-radius: 16px;
  flex-wrap: wrap;
`

const AcceptLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 14.5px;
  color: ${colors.normalWhite};
  user-select: none;

  input[type='checkbox'] {
    width: 18px;
    height: 18px;
    accent-color: ${colors.buttonPurple};
    cursor: pointer;
  }
`

const ContinueButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${colors.buttonPurple};
  color: ${colors.normalWhite};
  border: none;
  padding: 12px 28px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background: #6d28d9;
    transform: translateY(-1px);
  }
`

const HighlightMark = styled.mark`
  background: #f59e0b;
  color: #000;
  border-radius: 2px;
  padding: 0 2px;
`