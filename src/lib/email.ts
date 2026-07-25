import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendOrderConfirmationEmail(order: any) {
  const from = process.env.SMTP_FROM || '"RK Fabrics Zone" <noreply@rkfabricszone.com>'
  const to = order.email

  const itemsHtml = order.items.map((item: any) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <strong>${item.productName}</strong><br/>
        <span style="color: #666; font-size: 12px;">${item.variantName}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toLocaleString()}</td>
    </tr>
  `).join('')

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background-color: #0d9488; padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0;">RK Fabrics Zone</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Order Confirmation</p>
      </div>
      
      <div style="padding: 24px; background-color: #fdfaf6;">
        <h2 style="margin-top: 0;">Thank you for your order!</h2>
        <p>Your order <strong>#${order.id.slice(-8).toUpperCase()}</strong> has been received and is currently being processed.</p>
        
        <h3 style="margin-top: 32px; border-bottom: 2px solid #eee; padding-bottom: 8px;">Order Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="padding: 12px; text-align: left;">Item</th>
              <th style="padding: 12px; text-align: center;">Qty</th>
              <th style="padding: 12px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold;">Subtotal:</td>
              <td style="padding: 12px; text-align: right;">₹${order.subtotalAmount.toLocaleString()}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold;">Shipping:</td>
              <td style="padding: 12px; text-align: right;">₹${order.shippingAmount.toLocaleString()}</td>
            </tr>
            ${order.platformFeeAmount ? `
            <tr>
              <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold;">Platform Fee:</td>
              <td style="padding: 12px; text-align: right;">₹${order.platformFeeAmount.toLocaleString()}</td>
            </tr>
            ` : ''}
            <tr>
              <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px;">Total:</td>
              <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px; color: #0d9488;">₹${order.totalAmount.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <div style="background-color: white; padding: 16px; border: 1px solid #eee; border-radius: 8px;">
          <h4 style="margin-top: 0;">Shipping Address</h4>
          <p style="margin-bottom: 0; line-height: 1.5; color: #555;">
            ${order.shippingAddress}
          </p>
        </div>

        <p style="margin-top: 32px; text-align: center; color: #666; font-size: 14px;">
          If you have any questions, reply to this email or contact our support team.
        </p>
      </div>
    </div>
  `

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: `Order Confirmation - #${order.id.slice(-8).toUpperCase()}`,
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
  const from = process.env.SMTP_FROM || '"RK Fabrics Zone" <noreply@rkfabricszone.com>'
  const to = order.email

  const itemsHtml = order.items.map((item: any) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <strong>${item.productName}</strong><br/>
        <span style="color: #666; font-size: 12px;">${item.variantName}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
    </tr>
  `).join('')

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background-color: #0d9488; padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0;">RK Fabrics Zone</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Order Shipped</p>
      </div>
      
      <div style="padding: 24px; background-color: #fdfaf6;">
        <h2 style="margin-top: 0;">Your order is on the way!</h2>
        <p>Your order <strong>#${order.id.slice(-8).toUpperCase()}</strong> has been shipped and is heading your way.</p>
        
        <h3 style="margin-top: 32px; border-bottom: 2px solid #eee; padding-bottom: 8px;">Shipped Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="padding: 12px; text-align: left;">Item</th>
              <th style="padding: 12px; text-align: center;">Qty</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="background-color: white; padding: 16px; border: 1px solid #eee; border-radius: 8px;">
          <h4 style="margin-top: 0;">Shipping To</h4>
          <p style="margin-bottom: 0; line-height: 1.5; color: #555;">
            ${order.shippingAddress}
          </p>
        </div>

        <p style="margin-top: 32px; text-align: center; color: #666; font-size: 14px;">
          Thank you for shopping with us!
        </p>
      </div>
    </div>
  `

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: `Order Shipped - #${order.id.slice(-8).toUpperCase()}`,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error("Error sending shipped email:", error)
    return { success: false, error }
  }
}

export async function sendOTPEmail(email: string, otp: string, type: 'SIGNUP' | 'REACTIVATE' | 'RESET_PASSWORD' | 'EXECUTIVE_LOGIN' | 'SUPPORT_LOGIN') {
  const from = process.env.SMTP_FROM || '"RK Fabrics Zone" <noreply@rkfabricszone.com>'
  const to = email

  let subject = "Your Verification Code"
  let title = "Verification Code"
  let message = "Use the following OTP to complete your request."

  if (type === 'SIGNUP') {
    subject = "Verify your email for RK Fabrics Zone"
    title = "Welcome to RK Fabrics Zone!"
    message = "Please use the following OTP to verify your email and complete your registration."
  } else if (type === 'REACTIVATE') {
    subject = "Reactivate your account"
    title = "Reactivate Account"
    message = "Please use the following OTP to verify your email and reactivate your account."
  } else if (type === 'RESET_PASSWORD') {
    subject = "Reset your password"
    title = "Reset Password"
    message = "You have requested to reset your password. Please use the following OTP to proceed."
  } else if (type === 'EXECUTIVE_LOGIN' || type === 'SUPPORT_LOGIN') {
    subject = "Executive Security OTP — RK Fabrics Zone"
    title = "Staff Verification Code"
    message = "An authentication request was initiated for your executive account. Use the following security code to complete 2FA verification."
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background-color: #0d9488; padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0;">RK Fabrics Zone</h1>
      </div>
      
      <div style="padding: 24px; background-color: #fdfaf6; text-align: center;">
        <h2 style="margin-top: 0;">${title}</h2>
        <p>${message}</p>
        
        <div style="margin: 32px 0; padding: 24px; background-color: white; border: 1px solid #eee; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #0d9488;">
          ${otp}
        </div>
        
        <p style="color: #666; font-size: 14px;">
          This code is valid for 15 minutes. If you didn't request this, you can safely ignore this email.
        </p>
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
    console.error("Error sending OTP email:", error)
    return { success: false, error }
  }
}

export async function sendCouponEmail(email: string, userName: string, couponCode: string, discountValue: number, discountType: string, expiresAt: Date) {
  const from = process.env.SMTP_FROM || '"RK Fabrics Zone" <noreply@rkfabricszone.com>'
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
  const from = process.env.SMTP_FROM || '"RK Fabrics Zone" <noreply@rkfabricszone.com>'
  const to = order.email

  const itemsHtml = order.items.map((item: any) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <strong>${item.productName}</strong><br/>
        <span style="color: #666; font-size: 12px;">${item.variantName}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
    </tr>
  `).join('')

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background-color: #0d9488; padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0;">RK Fabrics Zone</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Order Delivered</p>
      </div>
      
      <div style="padding: 24px; background-color: #fdfaf6;">
        <h2 style="margin-top: 0;">Your order has been delivered!</h2>
        <p>Your order <strong>#${order.id.slice(-8).toUpperCase()}</strong> has been successfully delivered to your address.</p>
        
        <h3 style="margin-top: 32px; border-bottom: 2px solid #eee; padding-bottom: 8px;">Delivered Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="background-color: #f1f5f9;">
               <th style="padding: 12px; text-align: left;">Item</th>
               <th style="padding: 12px; text-align: center;">Qty</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <p style="margin-top: 32px; text-align: center; color: #666; font-size: 14px;">
          Thank you for shopping with us! We hope you love your purchase.
        </p>
      </div>
    </div>
  `

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: `Order Delivered - #${order.id.slice(-8).toUpperCase()}`,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

export async function sendOrderCancelledEmail(order: any) {
  const from = process.env.SMTP_FROM || '"RK Fabrics Zone" <noreply@rkfabricszone.com>'
  const to = order.email

  const itemsHtml = order.items.map((item: any) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <strong>${item.productName}</strong><br/>
        <span style="color: #666; font-size: 12px;">${item.variantName}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
    </tr>
  `).join('')

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background-color: #e11d48; padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0;">RK Fabrics Zone</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Order Cancelled</p>
      </div>
      
      <div style="padding: 24px; background-color: #fdfaf6;">
        <h2 style="margin-top: 0;">Order Cancelled</h2>
        <p>Your order <strong>#${order.id.slice(-8).toUpperCase()}</strong> has been cancelled.</p>
        <p>If you have already paid for this order, the refund process will be initiated shortly according to our policy.</p>
        
        <h3 style="margin-top: 32px; border-bottom: 2px solid #eee; padding-bottom: 8px;">Order Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="background-color: #f1f5f9;">
               <th style="padding: 12px; text-align: left;">Item</th>
               <th style="padding: 12px; text-align: center;">Qty</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <p style="margin-top: 32px; text-align: center; color: #666; font-size: 14px;">
          If you have any questions, please contact our support team.
        </p>
      </div>
    </div>
  `

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: `Order Cancelled - #${order.id.slice(-8).toUpperCase()}`,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

export async function sendAbandonedCartEmail(user: any, cartItems: any[]) {
  const from = process.env.SMTP_FROM || '"RK Fabrics Zone" <noreply@rkfabricszone.com>'
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
