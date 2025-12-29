import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

// Common interface for all auth email templates
interface AuthEmailTemplateProps {
  type: 'magic-link' | 'otp';
  link?: string;
  code?: string;
  username: string;
  logoUrl?: string;
  svgLogo?: boolean;
  appName?: string;
}

// Magic Link Template
export function magicLinkTemplate({
  // type,
  link,
  username,
  logoUrl,
  svgLogo,
  appName = 'Zaki',
}: AuthEmailTemplateProps) {
  const logo = logoUrl ?? 'https://via.placeholder.com/40x40/333/fff?text=Z';

  return (
    <Html>
      <Head />
      <Preview>Sign in to your {appName} account</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto my-8 max-w-[600px] bg-white">
            {/* Header */}
            <Section className="bg-white px-6 py-8 text-center">
              {svgLogo ? (
                <div dangerouslySetInnerHTML={{ __html: logo }} />
              ) : (
                <Img
                  src={logo}
                  width="40"
                  height="40"
                  alt={appName}
                  className="mx-auto mb-4"
                />
              )}

              <Heading className="mx-0 my-4 font-normal text-2xl text-gray-900">
                Sign in to {appName}
              </Heading>
            </Section>

            {/* Main Content */}
            <Section className="px-6 py-4">
              <Text className="mb-4 text-base text-gray-800 leading-6">
                Hi {username},
              </Text>

              <Text className="mb-4 text-base text-gray-800 leading-6">
                Click the button below to sign in to your {appName} account.
              </Text>

              {/* CTA */}
              <Section className="text-center my-8">
                <Button
                  className="inline-block rounded bg-blue-600 px-6 py-3 text-center font-medium text-base text-white no-underline"
                  href={link}
                >
                  Sign In
                </Button>
              </Section>

              <Text className="mb-4 text-sm text-gray-600 leading-5">
                If the button doesn't work, you can copy and paste this link
                into your browser:
              </Text>

              <Text className="mb-6 text-sm text-gray-600 leading-5 break-all">
                {link}
              </Text>

              <Text className="mb-4 text-sm text-gray-600 leading-5">
                This link will expire in 15 minutes for security reasons.
              </Text>

              <Text className="mb-4 text-base text-gray-800 leading-6">
                If you didn't request this sign-in link, you can safely ignore
                this email.
              </Text>

              <Text className="mb-4 text-base text-gray-800 leading-6">
                Best regards,
                <br />
                The {appName} Team
              </Text>
            </Section>

            {/* Footer */}
            <Section className="px-6 py-4 border-t border-gray-200">
              <Text className="text-xs text-gray-500 leading-4 text-center mb-0">
                This email was sent to you because you requested to sign in to
                {appName}.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

// Forgot Password Template
export function forgotPasswordTemplate({
  type,
  link,
  code,
  username,
  logoUrl,
  svgLogo,
  appName = 'Zaki',
}: AuthEmailTemplateProps) {
  const logo = logoUrl ?? 'https://via.placeholder.com/40x40/333/fff?text=Z';
  const isOTP = type === 'otp';

  return (
    <Html>
      <Head />
      <Preview>Reset your {appName} password</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto my-8 max-w-[600px] bg-white">
            {/* Header */}
            <Section className="bg-white px-6 py-8 text-center">
              {svgLogo ? (
                <div dangerouslySetInnerHTML={{ __html: logo }} />
              ) : (
                <Img
                  src={logo}
                  width="40"
                  height="40"
                  alt={appName}
                  className="mx-auto mb-4"
                />
              )}

              <Heading className="mx-0 my-4 font-normal text-2xl text-gray-900">
                Password Reset
              </Heading>
            </Section>

            {/* Main Content */}
            <Section className="px-6 py-4">
              <Text className="mb-4 text-base text-gray-800 leading-6">
                Hi {username},
              </Text>

              <Text className="mb-4 text-base text-gray-800 leading-6">
                We received a request to reset your {appName} account password.
              </Text>

              {isOTP ? (
                <>
                  <Text className="mb-4 text-base text-gray-800 leading-6">
                    Use the verification code below to reset your password:
                  </Text>

                  <Section className="text-center my-8">
                    <Text className="text-3xl font-bold text-gray-900 font-mono tracking-wide bg-gray-50 py-4 px-6 rounded border inline-block">
                      {code}
                    </Text>
                  </Section>

                  <Text className="mb-4 text-sm text-gray-600 leading-5">
                    This code will expire in 5 minutes.
                  </Text>
                </>
              ) : (
                <>
                  <Text className="mb-4 text-base text-gray-800 leading-6">
                    Click the button below to create a new password:
                  </Text>

                  <Section className="text-center my-8">
                    <Button
                      className="inline-block rounded bg-blue-600 px-6 py-3 text-center font-medium text-base text-white no-underline"
                      href={link}
                    >
                      Reset Password
                    </Button>
                  </Section>

                  <Text className="mb-4 text-sm text-gray-600 leading-5">
                    If the button doesn't work, you can copy and paste this link
                    into your browser:
                  </Text>

                  <Text className="mb-6 text-sm text-gray-600 leading-5 break-all">
                    {link}
                  </Text>

                  <Text className="mb-4 text-sm text-gray-600 leading-5">
                    This link will expire in 15 minutes for security reasons.
                  </Text>
                </>
              )}

              <Text className="mb-4 text-base text-gray-800 leading-6">
                If you didn't request a password reset, you can safely ignore
                this email. Your password will remain unchanged.
              </Text>

              <Text className="mb-4 text-base text-gray-800 leading-6">
                Best regards,
                <br />
                The {appName} Team
              </Text>
            </Section>

            {/* Footer */}
            <Section className="px-6 py-4 border-t border-gray-200">
              <Text className="text-xs text-gray-500 leading-4 text-center mb-0">
                This email was sent because you requested a password reset for
                your {appName} account.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

// Sign In Template (for OTP sign-in)
export function signInTemplate({
  type,
  link,
  code,
  username,
  logoUrl,
  svgLogo,
  appName = 'Zaki',
}: AuthEmailTemplateProps) {
  const logo = logoUrl ?? 'https://via.placeholder.com/40x40/333/fff?text=Z';
  const isOTP = type === 'otp';

  return (
    <Html>
      <Head />
      <Preview>Your {appName} sign-in code</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto my-8 max-w-[600px] bg-white">
            {/* Header */}
            <Section className="bg-white px-6 py-8 text-center">
              {svgLogo ? (
                <div dangerouslySetInnerHTML={{ __html: logo }} />
              ) : (
                <Img
                  src={logo}
                  width="40"
                  height="40"
                  alt={appName}
                  className="mx-auto mb-4"
                />
              )}

              <Heading className="mx-0 my-4 font-normal text-2xl text-gray-900">
                Sign in to {appName}
              </Heading>
            </Section>

            {/* Main Content */}
            <Section className="px-6 py-4">
              <Text className="mb-4 text-base text-gray-800 leading-6">
                Hi {username},
              </Text>

              {isOTP ? (
                <>
                  <Text className="mb-4 text-base text-gray-800 leading-6">
                    Use the verification code below to sign in to your {appName}
                    account:
                  </Text>

                  <Section className="text-center my-8">
                    <Text className="text-3xl font-bold text-gray-900 font-mono tracking-wide bg-gray-50 py-4 px-6 rounded border inline-block">
                      {code}
                    </Text>
                  </Section>

                  <Text className="mb-4 text-sm text-gray-600 leading-5">
                    This code will expire in 5 minutes.
                  </Text>
                </>
              ) : (
                <>
                  <Text className="mb-4 text-base text-gray-800 leading-6">
                    Click the button below to sign in to your account:
                  </Text>

                  <Section className="text-center my-8">
                    <Button
                      className="inline-block rounded bg-blue-600 px-6 py-3 text-center font-medium text-base text-white no-underline"
                      href={link}
                    >
                      Sign In
                    </Button>
                  </Section>

                  <Text className="mb-4 text-sm text-gray-600 leading-5">
                    If the button doesn't work, you can copy and paste this link
                    into your browser:
                  </Text>

                  <Text className="mb-6 text-sm text-gray-600 leading-5 break-all">
                    {link}
                  </Text>

                  <Text className="mb-4 text-sm text-gray-600 leading-5">
                    This link will expire in 15 minutes for security reasons.
                  </Text>
                </>
              )}

              <Text className="mb-4 text-base text-gray-800 leading-6">
                If you didn't request this sign-in {isOTP ? 'code' : 'link'},
                you can safely ignore this email.
              </Text>

              <Text className="mb-4 text-base text-gray-800 leading-6">
                Best regards,
                <br />
                The {appName} Team
              </Text>
            </Section>

            {/* Footer */}
            <Section className="px-6 py-4 border-t border-gray-200">
              <Text className="text-xs text-gray-500 leading-4 text-center mb-0">
                This email was sent because you requested to sign in to your
                {appName} account.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

// Email Verification Template
export function emailVerificationTemplate({
  type,
  link,
  code,
  username,
  logoUrl,
  svgLogo,
  appName = 'Zaki',
}: AuthEmailTemplateProps) {
  const logo = logoUrl ?? 'https://via.placeholder.com/40x40/333/fff?text=Z';
  const isOTP = type === 'otp';

  return (
    <Html>
      <Head />
      <Preview>Verify your {appName} email address</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto my-8 max-w-[600px] bg-white">
            {/* Header */}
            <Section className="bg-white px-6 py-8 text-center">
              {svgLogo ? (
                <div dangerouslySetInnerHTML={{ __html: logo }} />
              ) : (
                <Img
                  src={logo}
                  width="40"
                  height="40"
                  alt={appName}
                  className="mx-auto mb-4"
                />
              )}

              <Heading className="mx-0 my-4 font-normal text-2xl text-gray-900">
                Verify Your Email
              </Heading>
            </Section>

            {/* Main Content */}
            <Section className="px-6 py-4">
              <Text className="mb-4 text-base text-gray-800 leading-6">
                Hi {username},
              </Text>

              <Text className="mb-4 text-base text-gray-800 leading-6">
                Welcome to {appName}! Please verify your email address to complete
                your registration.
              </Text>

              {isOTP ? (
                <>
                  <Text className="mb-4 text-base text-gray-800 leading-6">
                    Enter the verification code below to verify your email:
                  </Text>

                  <Section className="text-center my-8">
                    <Text className="text-3xl font-bold text-gray-900 font-mono tracking-wide bg-gray-50 py-4 px-6 rounded border inline-block">
                      {code}
                    </Text>
                  </Section>

                  <Text className="mb-4 text-sm text-gray-600 leading-5">
                    This code will expire in 5 minutes.
                  </Text>
                </>
              ) : (
                <>
                  <Text className="mb-4 text-base text-gray-800 leading-6">
                    Click the button below to verify your email address:
                  </Text>

                  <Section className="text-center my-8">
                    <Button
                      className="inline-block rounded bg-blue-600 px-6 py-3 text-center font-medium text-base text-white no-underline"
                      href={link}
                    >
                      Verify Email
                    </Button>
                  </Section>

                  <Text className="mb-4 text-sm text-gray-600 leading-5">
                    If the button doesn't work, you can copy and paste this link
                    into your browser:
                  </Text>

                  <Text className="mb-6 text-sm text-gray-600 leading-5 break-all">
                    {link}
                  </Text>

                  <Text className="mb-4 text-sm text-gray-600 leading-5">
                    This link will expire in 15 minutes.
                  </Text>
                </>
              )}

              <Text className="mb-4 text-base text-gray-800 leading-6">
                If you didn't create a {appName} account, you can safely ignore this
                email.
              </Text>

              <Text className="mb-4 text-base text-gray-800 leading-6">
                Best regards,
                <br />
                The {appName} Team
              </Text>
            </Section>

            {/* Footer */}
            <Section className="px-6 py-4 border-t border-gray-200">
              <Text className="text-xs text-gray-500 leading-4 text-center mb-0">
                This email was sent because you signed up for a {appName} account.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
