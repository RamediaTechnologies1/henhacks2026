import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

function getClient() {
  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials not configured");
  }
  return twilio(accountSid, authToken);
}

export async function sendPinSMS(phone: string, pin: string): Promise<void> {
  const client = getClient();

  if (!fromPhone) {
    throw new Error("TWILIO_PHONE_NUMBER not configured");
  }

  await client.messages.create({
    body: `Your FixIt AI login code: ${pin}. Expires in 10 minutes.`,
    from: fromPhone,
    to: phone,
  });
}
