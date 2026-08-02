import prisma from "./src/lib/prisma";
import { sendStaffLoginOtp } from "./src/actions/auth";

async function test() {
  try {
    const adminEmail = "testadmin@rkfabricszone.com";
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: "ADMIN", isActive: true },
      create: {
        email: adminEmail,
        name: "Test Admin",
        password: "hashedpassword",
        role: "ADMIN",
        isActive: true,
      }
    });
    
    console.log("Admin created, sending OTP...");
    const res = await sendStaffLoginOtp(adminEmail, "ADMIN");
    console.log("Result:", res);
  } catch (e) {
    console.error("Exception in script:", e);
  }
}
test();
