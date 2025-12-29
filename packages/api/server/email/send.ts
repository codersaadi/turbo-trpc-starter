import {
  SESv2Client,
  SendEmailCommand,
  type SendEmailCommandInput,
} from '@aws-sdk/client-sesv2'; // AWS SDK v3
import { render } from '@react-email/render';
// packages/email/index.ts
import type { ReactElement } from 'react';
import { Resend } from 'resend';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react?: ReactElement;
  html?: string; // For simple HTML content
  from?: string; // Optional: overrides mailEnv.EMAIL_FROM if provided. Must be verified.
}

const getFromAddress = (optionsFrom?: string): string => {
  const from = optionsFrom ?? process.env.EMAIL_FROM;
  if (!from) {
    throw new Error(
      "EMAIL_FROM environment variable is not set, and no 'from' address was provided in options. It must be a verified sender identity."
    );
  }
  return from;
};

// --- Resend Implementation ---
const sendWithResend = async ({
  to,
  subject,
  react,
  html: htmlContent,
  from,
}: SendEmailOptions) => {
  if (!process.env.RESEND_KEY) {
    // This check is also in mailEnv refine, but good for direct function call safety
    throw new Error('Resend API key (RESEND_KEY) is not configured.');
  }
  const resend = new Resend(process.env.RESEND_KEY);
  
  let html: string;
  let text: string;
  
  if (react) {
    html = await render(react);
    text = await render(react, { plainText: true });
  } else if (htmlContent) {
    html = htmlContent;
    text = htmlContent.replace(/<[^>]*>/g, ''); // Basic HTML strip for text version
  } else {
    throw new Error('Either react or html content must be provided');
  }

  try {
    const { data, error } = await resend.emails.send({
      from: getFromAddress(from),
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Resend Error:', error);
      throw new Error(`Failed to send email via Resend: ${error.message}`);
    }
    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.log('Email sent successfully via Resend:', data?.id);
    return {
      provider: 'resend',
      id: data?.id,
      message: 'Email sent via Resend.',
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.error('sendWithResend Error:', errorMessage);
    throw new Error(`Resend sending failed: ${errorMessage}`);
  }
};




// --- AWS SES Implementation ---
let sesClient: SESv2Client | null = null;

const getSESClient = (): SESv2Client => {
  if (!sesClient) {
    if (!process.env.AWS_SES_REGION) {
      // Also checked by refine, but good for safety
      throw new Error('AWS_SES_REGION is not configured for SES provider.');
    }
    // SDK will automatically attempt to find credentials in the environment
    // (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN),
    // shared credentials file (~/.aws/credentials), or IAM role if running on AWS infra.
    // The refine in mailEnv makes ACCESS_KEY_ID and SECRET_ACCESS_KEY "required" for non-IAM scenarios.
    const credentials =
      process.env.AWS_SES_ACCESS_KEY_ID && process.env.AWS_SES_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
          }
        : undefined; // Let SDK handle discovery if keys are not explicitly set (e.g. IAM roles)

    sesClient = new SESv2Client(
      credentials
        ? {
            region: process.env.AWS_SES_REGION,
            credentials, // Pass explicit credentials if available
          }
        : {
            region: process.env.AWS_SES_REGION,
          }
    );
  }
  return sesClient;
};

const sendWithSES = async ({ to, subject, react, html: htmlContent, from }: SendEmailOptions) => {
  const client = getSESClient();
  
  let html: string;
  let textContent: string;
  
  if (react) {
    html = await render(react);
    textContent = await render(react, { plainText: true });
  } else if (htmlContent) {
    html = htmlContent;
    textContent = htmlContent.replace(/<[^>]*>/g, '');
  } else {
    throw new Error('Either react or html content must be provided');
  }

  const params: SendEmailCommandInput = {
    FromEmailAddress: getFromAddress(from),
    Destination: {
      ToAddresses: Array.isArray(to) ? to : [to],
    },
    Content: {
      Simple: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: html,
            Charset: 'UTF-8',
          },
          Text: {
            // Optional, but recommended
            Data: textContent,
            Charset: 'UTF-8',
          },
        },
      },
    },
  };

  if (process.env.AWS_SES_CONFIGURATION_SET_NAME) {
    params.ConfigurationSetName = process.env.AWS_SES_CONFIGURATION_SET_NAME;
  }
  if (process.env.AWS_SES_FROM_ARN) {
    params.FromEmailAddressIdentityArn = process.env.AWS_SES_FROM_ARN;
  }

  try {
    const command = new SendEmailCommand(params);
    const result = await client.send(command);
    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.log('Email sent successfully via AWS SES:', result.MessageId);
    return {
      provider: 'ses',
      id: result.MessageId,
      message: 'Email sent via AWS SES.',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.error('AWS SES Error:', errorMessage, error); // Log the full error for details
    // You might want to check for specific SES error codes here
    throw new Error(`Failed to send email via AWS SES: ${errorMessage}`);
  }
};

// --- Custom Implementation (Stub) ---
const sendWithCustom = async (options: SendEmailOptions) => {
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.warn(
    'Custom email provider is selected but not yet implemented.',
    options
  );
  throw new Error('Custom provider not implemented.');
};

// --- Main Send Email Function ---
export const sendEmail = async (options: SendEmailOptions) => {
  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.log(
    `Attempting to send email to '${options.to}' with subject '${options.subject}' via provider: ${process.env.EMAIL_PROVIDER}`
  );
  try {
    switch (process.env.EMAIL_PROVIDER || "resend") {
      case 'resend':
        return await sendWithResend(options);
      case 'ses':
        return await sendWithSES(options);
      case 'custom':
        return await sendWithCustom(options);
      default: {
        // This case should ideally be caught by the zod enum validation in mailEnv
        const exhaustiveCheck = process.env.EMAIL_PROVIDER;
        console.error(`Unsupported email provider: ${exhaustiveCheck}`);
        throw new Error(`Unsupported email provider: ${exhaustiveCheck}`);
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    // Log the error or handle it as per your application's needs before re-throwing
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.error(
      `Email sending failed for provider ${process.env.EMAIL_PROVIDER}: ${errorMessage}`,
      error
    );
    // Re-throw the original error or a new error wrapping it
    // This allows the caller to handle it specifically.
    throw error;
  }
};
