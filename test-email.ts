import { sendOTPEmail } from "./src/lib/email";
async function test() {
  console.log("Sending email...");
  const res = await sendOTPEmail("admin@rkfabricszone.com", "123456", "EXECUTIVE_LOGIN");
  console.log("Result:", res);
}
test();
