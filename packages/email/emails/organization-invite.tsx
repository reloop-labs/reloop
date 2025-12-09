import {
  Body,
  Button,
  Container,
  Heading,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { EmailThemeProvider } from "../components/theme";

interface OrganizationInviteEmailProps {
  inviteLink: string;
  organizationName: string;
  inviterName: string;
  inviterEmail: string;
  role: string;
}

const getRoleDescription = (role: string): string => {
  switch (role.toLowerCase()) {
    case "admin":
      return "Full access to all organization features";
    case "member":
      return "Read and limited write access";
    case "viewer":
      return "Read-only access to organization data";
    case "owner":
      return "Full ownership of the organization";
    default:
      return `${role} access`;
  }
};

export const OrganizationInviteEmail = ({
  inviteLink,
  organizationName,
  inviterName,
  inviterEmail,
  role,
}: OrganizationInviteEmailProps) => {
  const roleDescription = getRoleDescription(role);

  return (
    <EmailThemeProvider
      preview={<Preview>You've been invited to join {organizationName}</Preview>}
    >
      <Body className="bg-gray-50 font-sans">
        <Container className="mx-auto mb-16 bg-white py-5 pb-12">
          <Section className="mb-5 rounded-lg bg-gray-50 p-5 text-center">
            <Text className="m-0 font-bold text-2xl text-blue-600">Reloop</Text>
          </Section>

          <Section className="rounded-lg bg-white p-8 shadow-sm">
            <Heading className="mb-5 font-bold text-2xl text-gray-800">
              You're Invited!
            </Heading>
            <Text className="mb-4 text-base text-gray-800 leading-relaxed">
              Hello,
            </Text>
            <Text className="mb-4 text-base text-gray-800 leading-relaxed">
              <strong>{inviterName}</strong> ({inviterEmail}) has invited you to
              join <strong>{organizationName}</strong> on Reloop.
            </Text>

            <Section className="my-4 rounded-lg bg-gray-100 p-4">
              <Text className="m-0 text-gray-600 text-sm">Your Role</Text>
              <Text className="m-0 mt-1 font-semibold text-gray-800 text-lg capitalize">
                {role}
              </Text>
              <Text className="m-0 mt-1 text-gray-600 text-sm">
                {roleDescription}
              </Text>
            </Section>

            <Section className="my-5 text-center">
              <Button
                className="inline-block rounded-md bg-blue-600 px-6 py-3 font-medium text-base text-white leading-none no-underline"
                href={inviteLink}
              >
                Accept Invitation
              </Button>
            </Section>

            <Text className="mb-4 text-base text-gray-800 leading-relaxed">
              If the button doesn't work, you can copy and paste this link into
              your browser:
            </Text>

            <Text className="break-all rounded bg-gray-100 p-2.5 font-mono text-gray-800 text-sm leading-snug">
              {inviteLink}
            </Text>

            <Text className="my-4 font-bold text-base text-amber-600">
              <strong>
                This invitation will expire in 7 days.
              </strong>
            </Text>

            <Text className="mb-4 text-base text-gray-800 leading-relaxed">
              If you didn't expect this invitation, you can safely ignore this
              email.
            </Text>
          </Section>

          <Section className="mt-8 border-gray-200 border-t pt-5">
            <Text className="mb-2 text-gray-500 text-sm leading-snug">
              This email was sent from Reloop. If you have any questions, please
              contact our support team.
            </Text>
            <Text className="mb-2 text-gray-500 text-sm leading-snug">
              &copy; 2024 Reloop. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </EmailThemeProvider>
  );
};

export default OrganizationInviteEmail;
