import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 5000,
})

export async function sendOrderConfirmationEmail(order: any) {
  const from = process.env.SMTP_FROM || '"RK Fabrics Zone" <no-reply@rkfabricszone.com>'
  const to = order.email

  const itemsHtml = order.items.map((item: any) => `
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #E6F0F9;">
                    <strong style="color: #0A1931; display: block; margin-bottom: 4px;">${item.productName}</strong>
                    <span style="font-size: 13px;">${item.variantName} | Qty: ${item.quantity}</span>
                  </td>
                  <td align="right" style="padding: 15px 0; border-bottom: 1px solid #E6F0F9; font-weight: bold; color: #0A1931;">
                    ₹${(item.price).toLocaleString()}
                  </td>
                </tr>
  `).join('')

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #E8EBEF; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #E8EBEF; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #F6FAFD; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #D1CDC1;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 20px 20px 20px;">
              <img src="https://www.rkfabricszone.com/logo.png" alt="RK Fabrics Zone" width="80" style="display: block; margin-bottom: 15px; border-radius: 50%;">
              <h1 style="margin: 0; color: #0A1931; font-size: 24px; font-weight: bold; letter-spacing: 1px;">RK Fabrics Zone</h1>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td align="center" style="padding: 0 30px 30px 30px; border-bottom: 2px dashed #D1CDC1;">
              <h2 style="margin: 0 0 10px 0; color: #0A1931; font-size: 26px;">Order Confirmed!</h2>
              <p style="margin: 0; color: #2F5370; font-size: 15px; line-height: 1.6;">
                Thank you for your purchase. We are getting your order ready to be shipped. We will notify you when it has been sent.
              </p>
              <div style="margin-top: 20px; display: inline-block; background-color: #0A1931; color: #F6FAFD; padding: 8px 16px; border-radius: 4px; font-weight: bold; letter-spacing: 2px;">
                ORDER #${order.id.slice(-8).toUpperCase()}
              </div>
            </td>
          </tr>

          <!-- Order Details -->
          <tr>
            <td style="padding: 30px;">
              <h3 style="margin: 0 0 20px 0; color: #0A1931; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">Order Summary</h3>
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; color: #2F5370;">
                <!-- Item Rows -->
                ${itemsHtml}
                <!-- End Item Rows -->

                <!-- Totals -->
                <tr>
                  <td style="padding-top: 20px; text-align: right;">Subtotal:</td>
                  <td align="right" style="padding-top: 20px;">₹${order.subtotalAmount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding-top: 10px; text-align: right;">Shipping:</td>
                  <td align="right" style="padding-top: 10px;">₹${order.shippingAmount.toLocaleString()}</td>
                </tr>
                ${order.platformFeeAmount ? `
                <tr>
                  <td style="padding-top: 10px; text-align: right;">Platform Fee:</td>
                  <td align="right" style="padding-top: 10px;">₹${order.platformFeeAmount.toLocaleString()}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding-top: 15px; text-align: right; font-weight: bold; font-size: 18px; color: #0A1931;">Total:</td>
                  <td align="right" style="padding-top: 15px; font-weight: bold; font-size: 18px; color: #0A1931;">₹${order.totalAmount.toLocaleString()}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping Info -->
          <tr>
            <td style="padding: 0 30px 40px 30px;">
              <div style="background-color: #FFFFFF; padding: 20px; border-radius: 8px; border: 1px solid #E6F0F9;">
                <h4 style="margin: 0 0 10px 0; color: #0A1931; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Shipping Address</h4>
                <p style="margin: 0; color: #2F5370; font-size: 14px; line-height: 1.6;">
                  ${order.shippingAddress.replace(/\n/g, '<br>')}
                </p>
              </div>
            </td>
          </tr>
          
        </table>

        <!-- Footer / Signature -->
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin-top: 20px;">
          <tr>
            <td align="center" style="padding: 20px;">
              
              <!-- Rich Signature -->
              <table cellpadding="0" cellspacing="0" border="0" style="border: none; border-radius: 12px; background-color: #FFFFFF; font-family: Arial, sans-serif; color: #0A1931; padding: 20px 25px; border: 1px solid #D1CDC1; width: 100%; max-width: 450px; text-align: left;">
                <tr>
                  <!-- Left Column: Logo -->
                  <td valign="middle" style="padding-right: 25px; border-right: 1px solid #D1CDC1; width: 80px;">
                    <img src="https://www.rkfabricszone.com/logo.png" width="80" height="80" style="display: block; border-radius: 50%; border: 3px solid #D4AF37; object-fit: contain;" alt="RK Fabrics Zone">
                  </td>
                  
                  <!-- Right Column: Details -->
                  <td valign="middle" style="padding-left: 25px;">
                    <!-- Name & Role -->
                    <h2 style="margin: 0 0 4px 0; color: #0A1931; font-size: 20px; font-weight: bold; white-space: nowrap;">Customer Support</h2>
                    <p style="margin: 0 0 12px 0; color: #0A1931; font-size: 13px; line-height: 1.4; white-space: nowrap;">Always Here To Help</p>
                    
                    <!-- Contact Info -->
                    <table cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; line-height: 22px; color: #0A1931;">
                      <tr>
                        <td style="padding-right: 10px; font-size: 14px;">🌐</td>
                        <td><a href="https://www.rkfabricszone.com/contact" style="color: #0A1931; text-decoration: none; white-space: nowrap;">www.rkfabricszone.com</a></td>
                      </tr>
                      <tr>
                        <td style="padding-right: 10px; font-size: 14px;">✉️</td>
                        <td><a href="mailto:support@rkfabricszone.com" style="color: #0A1931; text-decoration: none; white-space: nowrap;">support@rkfabricszone.com</a></td>
                      </tr>
                      <tr>
                        <td style="padding-right: 10px; font-size: 14px;">🇮🇳 📞</td>
                        <td style="color: #0A1931; white-space: nowrap;">+91 82094 89552</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; color: #666666; font-size: 12px;">&copy; 2026 RK Fabrics Zone. All rights reserved.</p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: `💖 Thank you for your order! - #${order.id.slice(-8).toUpperCase()} 🚚`,
      html,
    })
    console.log("Message sent: %s", info.messageId)
    return { success: true }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

export async function sendOrderShippedEmail(order: any) {
  const from = process.env.SMTP_FROM || '"RK Fabrics Zone" <no-reply@rkfabricszone.com>'
  const to = order.email

  const itemsHtml = order.items.map((item: any) => `
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #E6F0F9;">
                    <strong style="color: #0A1931; display: block; margin-bottom: 4px;">${item.productName}</strong>
                    <span style="font-size: 13px;">${item.variantName} | Qty: ${item.quantity}</span>
                  </td>
                </tr>
  `).join('')

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Shipped</title>
</head>
<body style="margin: 0; padding: 0; background-color: #E8EBEF; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #E8EBEF; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #F6FAFD; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #D1CDC1;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 20px 20px 20px;">
              <img src="https://www.rkfabricszone.com/logo.png" alt="RK Fabrics Zone" width="80" style="display: block; margin-bottom: 15px; border-radius: 50%;">
              <h1 style="margin: 0; color: #0A1931; font-size: 24px; font-weight: bold; letter-spacing: 1px;">RK Fabrics Zone</h1>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td align="center" style="padding: 0 30px 30px 30px; border-bottom: 2px dashed #D1CDC1;">
              <h2 style="margin: 0 0 10px 0; color: #0A1931; font-size: 26px;">Your Order is Shipped!</h2>
              <p style="margin: 0; color: #2F5370; font-size: 15px; line-height: 1.6;">
                Great news! Your order has been packed and handed over to our delivery partners. It is now on its way to you.
              </p>
              <div style="margin-top: 20px; display: inline-block; background-color: #0A1931; color: #F6FAFD; padding: 8px 16px; border-radius: 4px; font-weight: bold; letter-spacing: 2px;">
                ORDER #${order.id.slice(-8).toUpperCase()}
              </div>
            </td>
          </tr>

          <!-- Order Details -->
          <tr>
            <td style="padding: 30px;">
              <h3 style="margin: 0 0 20px 0; color: #0A1931; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">Shipped Items</h3>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; color: #2F5370;">
                ${itemsHtml}
              </table>
            </td>
          </tr>

          <!-- Shipping Info -->
          <tr>
            <td style="padding: 0 30px 40px 30px;">
              <div style="background-color: #FFFFFF; padding: 20px; border-radius: 8px; border: 1px solid #E6F0F9;">
                <h4 style="margin: 0 0 10px 0; color: #0A1931; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Shipping To</h4>
                <p style="margin: 0; color: #2F5370; font-size: 14px; line-height: 1.6;">
                  ${order.shippingAddress.replace(/\n/g, '<br>')}
                </p>
              </div>
            </td>
          </tr>
          
        </table>

        <!-- Footer / Signature -->
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin-top: 20px;">
          <tr>
            <td align="center" style="padding: 20px;">
              
              <!-- Rich Signature -->
              <table cellpadding="0" cellspacing="0" border="0" style="border: none; border-radius: 12px; background-color: #FFFFFF; font-family: Arial, sans-serif; color: #0A1931; padding: 20px 25px; border: 1px solid #D1CDC1; width: 100%; max-width: 450px; text-align: left;">
                <tr>
                  <!-- Left Column: Logo -->
                  <td valign="middle" style="padding-right: 25px; border-right: 1px solid #D1CDC1; width: 80px;">
                    <img src="https://www.rkfabricszone.com/logo.png" width="80" height="80" style="display: block; border-radius: 50%; border: 3px solid #D4AF37; object-fit: contain;" alt="RK Fabrics Zone">
                  </td>
                  
                  <!-- Right Column: Details -->
                  <td valign="middle" style="padding-left: 25px;">
                    <!-- Name & Role -->
                    <h2 style="margin: 0 0 4px 0; color: #0A1931; font-size: 20px; font-weight: bold; white-space: nowrap;">Customer Support</h2>
                    <p style="margin: 0 0 12px 0; color: #0A1931; font-size: 13px; line-height: 1.4; white-space: nowrap;">Always Here To Help</p>
                    
                    <!-- Contact Info -->
                    <table cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; line-height: 22px; color: #0A1931;">
                      <tr>
                        <td style="padding-right: 10px; font-size: 14px;">🌐</td>
                        <td><a href="https://www.rkfabricszone.com/contact" style="color: #0A1931; text-decoration: none; white-space: nowrap;">www.rkfabricszone.com</a></td>
                      </tr>
                      <tr>
                        <td style="padding-right: 10px; font-size: 14px;">✉️</td>
                        <td><a href="mailto:support@rkfabricszone.com" style="color: #0A1931; text-decoration: none; white-space: nowrap;">support@rkfabricszone.com</a></td>
                      </tr>
                      <tr>
                        <td style="padding-right: 10px; font-size: 14px;">🇮🇳 📞</td>
                        <td style="color: #0A1931; white-space: nowrap;">+91 82094 89552</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; color: #666666; font-size: 12px;">&copy; 2026 RK Fabrics Zone. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: `📦 Your Order is on the way! - #${order.id.slice(-8).toUpperCase()} 🚚`,
      html,
    })
    console.log("Message sent: %s", info.messageId)
    return { success: true }
  } catch (error) {
    console.error("Error sending shipped email:", error)
    return { success: false, error }
  }
}

export async function sendOTPEmail(email: string, otp: string, type: 'SIGNUP' | 'REACTIVATE' | 'RESET_PASSWORD' | 'EXECUTIVE_LOGIN' | 'SUPPORT_LOGIN') {
  const from = process.env.SMTP_FROM || '"RK Fabrics Zone" <no-reply@rkfabricszone.com>'
  const to = email

  let subject = "✅ Your Verification Code 🔢"
  let title = "Verification Code"
  let message = "Use the following OTP to complete your request."

  if (type === 'SIGNUP') {
    subject = "✨ Verify your email for RK Fabrics Zone ✉️"
    title = "Welcome to RK Fabrics Zone!"
    message = "Please use the following OTP to verify your email and complete your registration."
  } else if (type === 'REACTIVATE') {
    subject = "👋 Welcome back! Reactivate your account 🔄"
    title = "Reactivate Account"
    message = "Please use the following OTP to verify your email and reactivate your account."
  } else if (type === 'RESET_PASSWORD') {
    subject = "🔒 Reset your password for RK Fabrics Zone 🔑"
    title = "Reset Password"
    message = "You have requested to reset your password. Please use the following OTP to proceed."
  } else if (type === 'EXECUTIVE_LOGIN' || type === 'SUPPORT_LOGIN') {
    subject = "🛡️ Executive Security OTP — RK Fabrics Zone 🔐"
    title = "Staff Verification Code"
    message = "An authentication request was initiated for your executive account. Use the following security code to complete 2FA verification."
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #E8EBEF; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #E8EBEF; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #F6FAFD; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #D1CDC1;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 20px 20px 20px; border-bottom: 1px solid #E6F0F9;">
              <img src="https://www.rkfabricszone.com/logo.png" alt="RK Fabrics Zone" width="80" style="display: block; margin-bottom: 15px; border-radius: 50%;">
              <h1 style="margin: 0; color: #0A1931; font-size: 24px; font-weight: bold; letter-spacing: 1px;">RK Fabrics Zone</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td align="center" style="padding: 40px 30px;">
              <h2 style="margin: 0 0 15px 0; color: #0A1931; font-size: 20px;">${title}</h2>
              <p style="margin: 0 0 30px 0; color: #2F5370; font-size: 15px; line-height: 1.6;">
                ${message}
              </p>
              
              <!-- OTP Box -->
              <div style="background-color: #FFFFFF; border: 2px dashed #3D6A8C; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <h1 style="margin: 0; color: #0A1931; font-size: 36px; letter-spacing: 8px;">${otp}</h1>
              </div>
              
              <p style="margin: 0; color: #666666; font-size: 13px; line-height: 1.5;">
                This code is valid for 15 minutes.<br>If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
        </table>

        <!-- Footer / Signature -->
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin-top: 20px;">
          <tr>
            <td align="center" style="padding: 20px;">
              
              <!-- Rich Signature -->
              <table cellpadding="0" cellspacing="0" border="0" style="border: none; border-radius: 12px; background-color: #FFFFFF; font-family: Arial, sans-serif; color: #0A1931; padding: 20px 25px; border: 1px solid #D1CDC1; width: 100%; max-width: 450px; text-align: left;">
                <tr>
                  <!-- Left Column: Logo -->
                  <td valign="middle" style="padding-right: 25px; border-right: 1px solid #D1CDC1; width: 80px;">
                    <img src="https://www.rkfabricszone.com/logo.png" width="80" height="80" style="display: block; border-radius: 50%; border: 3px solid #D4AF37; object-fit: contain;" alt="RK Fabrics Zone">
                  </td>
                  
                  <!-- Right Column: Details -->
                  <td valign="middle" style="padding-left: 25px;">
                    <!-- Name & Role -->
                    <h2 style="margin: 0 0 4px 0; color: #0A1931; font-size: 20px; font-weight: bold; white-space: nowrap;">Customer Support</h2>
                    <p style="margin: 0 0 12px 0; color: #0A1931; font-size: 13px; line-height: 1.4; white-space: nowrap;">Always Here To Help</p>
                    
                    <!-- Contact Info -->
                    <table cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; line-height: 22px; color: #0A1931;">
                      <tr>
                        <td style="padding-right: 10px; font-size: 14px;">🌐</td>
                        <td><a href="https://www.rkfabricszone.com/contact" style="color: #0A1931; text-decoration: none; white-space: nowrap;">www.rkfabricszone.com</a></td>
                      </tr>
                      <tr>
                        <td style="padding-right: 10px; font-size: 14px;">✉️</td>
                        <td><a href="mailto:support@rkfabricszone.com" style="color: #0A1931; text-decoration: none; white-space: nowrap;">support@rkfabricszone.com</a></td>
                      </tr>
                      <tr>
                        <td style="padding-right: 10px; font-size: 14px;">🇮🇳 📞</td>
                        <td style="color: #0A1931; white-space: nowrap;">+91 82094 89552</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; color: #666666; font-size: 12px;">&copy; 2026 RK Fabrics Zone. All rights reserved.</p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error("Error sending OTP email:", error)
    return { success: false, error }
  }
}

export async function sendCouponEmail(email: string, userName: string, couponCode: string, discountValue: number, discountType: string, expiresAt: Date) {
  const from = process.env.SMTP_FROM || '"RK Fabrics Zone" <no-reply@rkfabricszone.com>'
  const to = email

  const subject = "A Special Offer Just For You!"
  const title = "Exclusive Discount Inside"
  
  const discountText = discountType === 'PERCENTAGE' ? `${discountValue}% OFF` : `₹${discountValue} OFF`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background-color: #0d9488; padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0;">RK Fabrics Zone</h1>
      </div>
      
      <div style="padding: 24px; background-color: #fdfaf6; text-align: center;">
        <h2 style="margin-top: 0;">Hi ${userName},</h2>
        <p>As a thank you for your support, we'd like to offer you a special, exclusive discount for your next purchase.</p>
        
        <div style="margin: 32px 0; padding: 24px; background-color: white; border: 2px dashed #0d9488; border-radius: 12px;">
          <p style="margin: 0 0 10px 0; font-size: 18px; color: #666;">Get ${discountText} on your next order!</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 2px; color: #0d9488;">
            ${couponCode}
          </div>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          This code is exclusive to your account and is valid until ${expiresAt.toLocaleDateString()}.
        </p>
        
        <div style="margin-top: 32px;">
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/shop" style="display: inline-block; padding: 12px 24px; background-color: #0d9488; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Shop Now</a>
        </div>
      </div>
    </div>
  `

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error("Error sending coupon email:", error)
    return { success: false, error }
  }
}

export async function sendOrderDeliveredEmail(order: any) {
  const from = process.env.SMTP_FROM || '"RK Fabrics Zone" <no-reply@rkfabricszone.com>'
  const to = order.email

  const itemsHtml = order.items.map((item: any) => `
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #E6F0F9;">
                    <strong style="color: #0A1931; display: block; margin-bottom: 4px;">${item.productName}</strong>
                    <span style="font-size: 13px;">${item.variantName} | Qty: ${item.quantity}</span>
                  </td>
                </tr>
  `).join('')

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Delivered</title>
</head>
<body style="margin: 0; padding: 0; background-color: #E8EBEF; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #E8EBEF; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #F6FAFD; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #D1CDC1;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 20px 20px 20px;">
              <img src="https://www.rkfabricszone.com/logo.png" alt="RK Fabrics Zone" width="80" style="display: block; margin-bottom: 15px; border-radius: 50%;">
              <h1 style="margin: 0; color: #0A1931; font-size: 24px; font-weight: bold; letter-spacing: 1px;">RK Fabrics Zone</h1>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td align="center" style="padding: 0 30px 30px 30px; border-bottom: 2px dashed #D1CDC1;">
              <h2 style="margin: 0 0 10px 0; color: #0A1931; font-size: 26px;">Your Order is Delivered!</h2>
              <p style="margin: 0; color: #2F5370; font-size: 15px; line-height: 1.6;">
                Hooray! Your order has been successfully delivered. We hope you love your new fabrics!
              </p>
              <div style="margin-top: 20px; display: inline-block; background-color: #0A1931; color: #F6FAFD; padding: 8px 16px; border-radius: 4px; font-weight: bold; letter-spacing: 2px;">
                ORDER #${order.id.slice(-8).toUpperCase()}
              </div>
            </td>
          </tr>

          <!-- Order Details -->
          <tr>
            <td style="padding: 30px;">
              <h3 style="margin: 0 0 20px 0; color: #0A1931; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">Delivered Items</h3>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; color: #2F5370;">
                ${itemsHtml}
              </table>
            </td>
          </tr>
          
        </table>

        <!-- Footer / Signature -->
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin-top: 20px;">
          <tr>
            <td align="center" style="padding: 20px;">
              
              <!-- Rich Signature -->
              <table cellpadding="0" cellspacing="0" border="0" style="border: none; border-radius: 12px; background-color: #FFFFFF; font-family: Arial, sans-serif; color: #0A1931; padding: 20px 25px; border: 1px solid #D1CDC1; width: 100%; max-width: 450px; text-align: left;">
                <tr>
                  <!-- Left Column: Logo -->
                  <td valign="middle" style="padding-right: 25px; border-right: 1px solid #D1CDC1; width: 80px;">
                    <img src="https://www.rkfabricszone.com/logo.png" width="80" height="80" style="display: block; border-radius: 50%; border: 3px solid #D4AF37; object-fit: contain;" alt="RK Fabrics Zone">
                  </td>
                  
                  <!-- Right Column: Details -->
                  <td valign="middle" style="padding-left: 25px;">
                    <!-- Name & Role -->
                    <h2 style="margin: 0 0 4px 0; color: #0A1931; font-size: 20px; font-weight: bold; white-space: nowrap;">Customer Support</h2>
                    <p style="margin: 0 0 12px 0; color: #0A1931; font-size: 13px; line-height: 1.4; white-space: nowrap;">Always Here To Help</p>
                    
                    <!-- Contact Info -->
                    <table cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; line-height: 22px; color: #0A1931;">
                      <tr>
                        <td style="padding-right: 10px; font-size: 14px;">🌐</td>
                        <td><a href="https://www.rkfabricszone.com/contact" style="color: #0A1931; text-decoration: none; white-space: nowrap;">www.rkfabricszone.com</a></td>
                      </tr>
                      <tr>
                        <td style="padding-right: 10px; font-size: 14px;">✉️</td>
                        <td><a href="mailto:support@rkfabricszone.com" style="color: #0A1931; text-decoration: none; white-space: nowrap;">support@rkfabricszone.com</a></td>
                      </tr>
                      <tr>
                        <td style="padding-right: 10px; font-size: 14px;">🇮🇳 📞</td>
                        <td style="color: #0A1931; white-space: nowrap;">+91 82094 89552</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; color: #666666; font-size: 12px;">&copy; 2026 RK Fabrics Zone. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: `🎉 Your Order has been Delivered! - #${order.id.slice(-8).toUpperCase()} 🎁`,
      html,
    })
    console.log("Message sent: %s", info.messageId)
    return { success: true }
  } catch (error) {
    console.error("Error sending delivered email:", error)
    return { success: false, error }
  }
}

export async function sendOrderCancelledEmail(order: any) {
  const from = process.env.SMTP_FROM || '"RK Fabrics Zone" <no-reply@rkfabricszone.com>'
  const to = order.email

  const itemsHtml = order.items.map((item: any) => `
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #E6F0F9;">
                    <strong style="color: #0A1931; display: block; margin-bottom: 4px;">${item.productName}</strong>
                    <span style="font-size: 13px;">${item.variantName} | Qty: ${item.quantity}</span>
                  </td>
                </tr>
  `).join('')

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Cancelled</title>
</head>
<body style="margin: 0; padding: 0; background-color: #E8EBEF; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #E8EBEF; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #F6FAFD; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #D1CDC1;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 20px 20px 20px;">
              <img src="https://www.rkfabricszone.com/logo.png" alt="RK Fabrics Zone" width="80" style="display: block; margin-bottom: 15px; border-radius: 50%;">
              <h1 style="margin: 0; color: #0A1931; font-size: 24px; font-weight: bold; letter-spacing: 1px;">RK Fabrics Zone</h1>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td align="center" style="padding: 0 30px 30px 30px; border-bottom: 2px dashed #D1CDC1;">
              <h2 style="margin: 0 0 10px 0; color: #b91c1c; font-size: 26px;">Order Cancelled</h2>
              <p style="margin: 0; color: #2F5370; font-size: 15px; line-height: 1.6;">
                Your order has been cancelled. If you have already paid for this order, the refund process will be initiated shortly according to our policy.
              </p>
              <div style="margin-top: 20px; display: inline-block; background-color: #b91c1c; color: #F6FAFD; padding: 8px 16px; border-radius: 4px; font-weight: bold; letter-spacing: 2px;">
                ORDER #${order.id.slice(-8).toUpperCase()}
              </div>
            </td>
          </tr>

          <!-- Order Details -->
          <tr>
            <td style="padding: 30px;">
              <h3 style="margin: 0 0 20px 0; color: #0A1931; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">Cancelled Items</h3>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; color: #2F5370;">
                ${itemsHtml}
              </table>
            </td>
          </tr>
          
        </table>

        <!-- Footer / Signature -->
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin-top: 20px;">
          <tr>
            <td align="center" style="padding: 20px;">
              
              <!-- Rich Signature -->
              <table cellpadding="0" cellspacing="0" border="0" style="border: none; border-radius: 12px; background-color: #FFFFFF; font-family: Arial, sans-serif; color: #0A1931; padding: 20px 25px; border: 1px solid #D1CDC1; width: 100%; max-width: 450px; text-align: left;">
                <tr>
                  <!-- Left Column: Logo -->
                  <td valign="middle" style="padding-right: 25px; border-right: 1px solid #D1CDC1; width: 80px;">
                    <img src="https://www.rkfabricszone.com/logo.png" width="80" height="80" style="display: block; border-radius: 50%; border: 3px solid #D4AF37; object-fit: contain;" alt="RK Fabrics Zone">
                  </td>
                  
                  <!-- Right Column: Details -->
                  <td valign="middle" style="padding-left: 25px;">
                    <!-- Name & Role -->
                    <h2 style="margin: 0 0 4px 0; color: #0A1931; font-size: 20px; font-weight: bold; white-space: nowrap;">Customer Support</h2>
                    <p style="margin: 0 0 12px 0; color: #0A1931; font-size: 13px; line-height: 1.4; white-space: nowrap;">Always Here To Help</p>
                    
                    <!-- Contact Info -->
                    <table cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; line-height: 22px; color: #0A1931;">
                      <tr>
                        <td style="padding-right: 10px; font-size: 14px;">🌐</td>
                        <td><a href="https://www.rkfabricszone.com/contact" style="color: #0A1931; text-decoration: none; white-space: nowrap;">www.rkfabricszone.com</a></td>
                      </tr>
                      <tr>
                        <td style="padding-right: 10px; font-size: 14px;">✉️</td>
                        <td><a href="mailto:support@rkfabricszone.com" style="color: #0A1931; text-decoration: none; white-space: nowrap;">support@rkfabricszone.com</a></td>
                      </tr>
                      <tr>
                        <td style="padding-right: 10px; font-size: 14px;">🇮🇳 📞</td>
                        <td style="color: #0A1931; white-space: nowrap;">+91 82094 89552</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; color: #666666; font-size: 12px;">&copy; 2026 RK Fabrics Zone. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: `❌ Order Cancelled - #${order.id.slice(-8).toUpperCase()}`,
      html,
    })
    console.log("Message sent: %s", info.messageId)
    return { success: true }
  } catch (error) {
    console.error("Error sending cancelled email:", error)
    return { success: false, error }
  }
}

export async function sendAbandonedCartEmail(user: any, cartItems: any[]) {
  const from = process.env.SMTP_FROM || '"RK Fabrics Zone" <no-reply@rkfabricszone.com>'
  const to = user.email

  const itemsHtml = cartItems.map((item: any) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <strong>${item.product?.name || item.productName || 'Product'}</strong><br/>
        <span style="color: #666; font-size: 12px;">${item.variant?.size || ''} ${item.variant?.color || ''}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.variant?.salePrice || item.variant?.price || 0}</td>
    </tr>
  `).join("")

  const subject = `You left something behind, ${user.name || 'Friend'}! 🛍️`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #0f172a; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0;">RK Fabrics Zone</h1>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #0f172a; margin-top: 0;">Did you forget something?</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.5;">
          Hi ${user.name || 'there'}, we noticed you left some amazing items in your cart. They are waiting for you, but they might sell out soon!
        </p>
        
        <div style="margin: 32px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8fafc;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #eee;">Item</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #eee;">Qty</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #eee;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <div style="text-align: center; margin-top: 32px;">
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/cart" style="display: inline-block; padding: 14px 28px; background-color: #0d9488; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Complete Your Purchase</a>
        </div>
      </div>
    </div>
  `

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error("Error sending abandoned cart email:", error)
    return { success: false, error }
  }
}
