/**
 * Email templates for authentication
 * Using React Email components for better email design
 */

import { Html, Head, Body, Container, Section, Text, Button, Link } from '@react-email/components';

interface WelcomeEmailProps {
  userName: string;
  userEmail: string;
  verifyUrl: string;
  platformName?: string;
}

export function WelcomeEmail({
  userName,
  userEmail,
  verifyUrl,
  platformName = 'Mon Toit'
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.logo}>{platformName}</Text>
            <Text style={styles.tagline}>Votre plateforme immobilière de confiance</Text>
          </Section>

          <Section style={styles.content}>
            <Text style={styles.title}>Bienvenue sur {platformName} !</Text>

            <Text style={styles.paragraph}>
              Bonjour {userName},
            </Text>

            <Text style={styles.paragraph}>
              Merci de vous être inscrit sur {platformName} ! Nous sommes ravis de vous accueillir dans notre communauté.
            </Text>

            <Text style={styles.paragraph}>
              Pour finaliser votre inscription et accéder à toutes les fonctionnalités de notre plateforme,
              veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :
            </Text>

            <Button href={verifyUrl} style={styles.button}>
              Vérifier mon adresse email
            </Button>

            <Text style={styles.smallText}>
              Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :
            </Text>

            <Link href={verifyUrl} style={styles.link}>
              {verifyUrl}
            </Link>

            <Text style={styles.importantText}>
              ⚠️ Important : Cette demande provient de l'adresse email {userEmail}.
              Si vous n'êtes pas à l'origine de cette inscription, merci d'ignorer cet email.
            </Text>
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
            </Text>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} {platformName}. Tous droits réservés.
            </Text>
            <Link href="https://mon-toit.com/privacy" style={styles.footerLink}>
              Politique de confidentialité
            </Link>
            {' • '}
            <Link href="https://mon-toit.com/terms" style={styles.footerLink}>
              Conditions d'utilisation
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
  platformName?: string;
}

export function PasswordResetEmail({
  userName,
  resetUrl,
  platformName = 'Mon Toit'
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.logo}>{platformName}</Text>
            <Text style={styles.tagline}>Votre plateforme immobilière de confiance</Text>
          </Section>

          <Section style={styles.content}>
            <Text style={styles.title}>Réinitialisation de votre mot de passe</Text>

            <Text style={styles.paragraph}>
              Bonjour {userName},
            </Text>

            <Text style={styles.paragraph}>
              Vous avez demandé la réinitialisation de votre mot de passe sur {platformName}.
              Pour continuer, veuillez cliquer sur le bouton ci-dessous :
            </Text>

            <Button href={resetUrl} style={styles.button}>
              Réinitialiser mon mot de passe
            </Button>

            <Text style={styles.smallText}>
              Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :
            </Text>

            <Link href={resetUrl} style={styles.link}>
              {resetUrl}
            </Link>

            <Text style={styles.importantText}>
              ⚠️ Important : Ce lien expirera dans 1 heure pour des raisons de sécurité.
            </Text>
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
            </Text>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} {platformName}. Tous droits réservés.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

interface EmailVerificationEmailProps {
  userName: string;
  verifyUrl: string;
  platformName?: string;
}

export function EmailVerificationEmail({
  userName,
  verifyUrl,
  platformName = 'Mon Toit'
}: EmailVerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.logo}>{platformName}</Text>
            <Text style={styles.tagline}>Votre plateforme immobilière de confiance</Text>
          </Section>

          <Section style={styles.content}>
            <Text style={styles.title}>Vérification de votre adresse email</Text>

            <Text style={styles.paragraph}>
              Bonjour {userName},
            </Text>

            <Text style={styles.paragraph}>
              Merci de confirmer votre adresse email pour compléter la configuration de votre compte {platformName}.
            </Text>

            <Button href={verifyUrl} style={styles.button}>
              Confirmer mon email
            </Button>

            <Text style={styles.smallText}>
              Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :
            </Text>

            <Link href={verifyUrl} style={styles.link}>
              {verifyUrl}
            </Link>
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
            </Text>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} {platformName}. Tous droits réservés.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: '#f9fafb',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#1e40af',
    padding: '40px',
    textAlign: 'center' as const,
  },
  logo: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0',
  },
  tagline: {
    fontSize: '16px',
    color: '#93c5fd',
    margin: '8px 0 0',
  },
  content: {
    padding: '40px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 24px',
  },
  paragraph: {
    fontSize: '16px',
    color: '#374151',
    lineHeight: '1.6',
    margin: '0 0 16px',
  },
  button: {
    backgroundColor: '#1e40af',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    padding: '12px 24px',
    borderRadius: '6px',
    textDecoration: 'none',
    display: 'inline-block',
    margin: '24px 0',
  },
  smallText: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '16px 0 8px',
  },
  link: {
    color: '#1e40af',
    fontSize: '14px',
    wordBreak: 'break-word' as const,
  },
  importantText: {
    fontSize: '14px',
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    padding: '12px',
    borderRadius: '6px',
    margin: '24px 0',
  },
  footer: {
    backgroundColor: '#f3f4f6',
    padding: '24px 40px',
    textAlign: 'center' as const,
  },
  footerText: {
    fontSize: '12px',
    color: '#6b7280',
    margin: '0 0 8px',
  },
  footerLink: {
    fontSize: '12px',
    color: '#6b7280',
    textDecoration: 'underline',
  },
};