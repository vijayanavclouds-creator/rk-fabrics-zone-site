import { Order, OrderItem } from "@prisma/client"

/**
 * Delhivery Delivery Integration
 * Make sure to set DELHIVERY_API_KEY in your .env file.
 */

const DELHIVERY_API_KEY = process.env.DELHIVERY_API_KEY || ""

// Toggle between 'sandbox' and 'production'
const DELHIVERY_ENV = process.env.DELHIVERY_ENV || "sandbox" 

const BASE_URL = DELHIVERY_ENV === "production" 
  ? "https://track.delhivery.com"
  : "https://staging-express.delhivery.com"

const PICKUP_LOCATION = "RK FABRIC ZONE B2C"

export interface ServiceabilityResponse {
  isServiceable: boolean
  expectedDeliveryDays?: number
  message?: string
}

/**
 * Check if Delhivery delivers to a specific pincode.
 */
export async function checkPincodeServiceability(pincode: string): Promise<ServiceabilityResponse> {
  if (!pincode || pincode.length !== 6 || isNaN(Number(pincode))) {
    return { isServiceable: false, message: "Invalid pincode format." }
  }

  if (!DELHIVERY_API_KEY) {
    return { isServiceable: false, message: "Delhivery API key not configured." }
  }

  try {
    const response = await fetch(`${BASE_URL}/c/api/pin-codes/json/?filter_codes=${pincode}`, {
      method: "GET",
      headers: {
        "Authorization": `Token ${DELHIVERY_API_KEY}`,
        "Content-Type": "application/json"
      }
    })

    if (!response.ok) {
      throw new Error(`Delhivery API Error: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Delhivery returns delivery_codes if serviceable
    if (data && data.delivery_codes && data.delivery_codes.length > 0) {
      const codeData = data.delivery_codes[0].postal_code
      
      if (codeData && codeData.is_oda === "Y") {
        return { isServiceable: true, expectedDeliveryDays: 7, message: "Delivery available (Out of Delivery Area - may take longer)" }
      }
      return { isServiceable: true, expectedDeliveryDays: 4, message: "Delivery available." }
    } else {
      return { isServiceable: false, message: "Sorry, we do not deliver to this location at the moment." }
    }
  } catch (error: any) {
    console.error("Delhivery Pincode Error:", error)
    return { isServiceable: false, message: "Failed to verify pincode serviceability." }
  }
}

/**
 * Generate a Waybill (AWB) for an order in Delhivery.
 */
export async function generateDelhiveryWaybill(order: any): Promise<{ success: boolean; awbNumber?: string; error?: string }> {
  if (!DELHIVERY_API_KEY) {
    // Generate a mock AWB number for testing purposes when credentials are not available
    const mockAwb = "DL" + Math.floor(Math.random() * 1000000000).toString().padStart(9, "0")
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    return {
      success: true,
      awbNumber: mockAwb
    }
  }

  try {
    // shippingAddress is a string like: "Vijay Jangir, 9999999999, Street 1, Jaipur, Rajasthan - 302001"
    const addrParts = order.shippingAddress.split(", ")
    const name = addrParts.length > 0 ? addrParts[0] : "Customer"
    const pincodeMatch = order.shippingAddress.match(/\d{6}$/)
    const pincode = pincodeMatch ? pincodeMatch[0] : "110001" // fallback
    const fullAddrString = order.shippingAddress

    const payload = {
      format: "json",
      data: {
        shipments: [
          {
            name: name,
            add: fullAddrString,
            pin: pincode,
            city: "Unknown", // Can extract if needed, but 'add' is primary
            state: "Unknown",
            country: "India",
            phone: order.phone || "9999999999",
            order: order.id,
            payment_mode: order.paymentMethod === "COD" ? "COD" : "Pre-paid",
            products_desc: order.items.map((item: any) => `${item.productName} (x${item.quantity})`).join(", "),
            cod_amount: order.paymentMethod === "COD" ? order.totalAmount : 0,
            order_date: new Date(order.createdAt).toISOString().replace("T", " ").substring(0, 19),
            total_amount: order.totalAmount,
            seller_name: "RK Fabrics Zone",
            quantity: order.items.reduce((acc: number, item: any) => acc + item.quantity, 0).toString(),
            shipping_mode: (order as any).shippingMode === "Express" ? "Express" : "Surface"
          }
        ],
        pickup_location: {
          name: PICKUP_LOCATION
        }
      }
    }

    // Delhivery requires payload to be form-encoded for `format=json&data={...}`
    const formData = new URLSearchParams()
    formData.append("format", "json")
    formData.append("data", JSON.stringify(payload.data))

    const response = await fetch(`${BASE_URL}/api/cmu/create.json`, {
      method: "POST",
      headers: {
        "Authorization": `Token ${DELHIVERY_API_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData.toString()
    })

    const data = await response.json()

    if (data.success && data.packages && data.packages.length > 0) {
      const packageData = data.packages[0]
      if (packageData.status === "Success" || packageData.waybill) {
        return {
          success: true,
          awbNumber: packageData.waybill
        }
      } else {
        return { success: false, error: packageData.remarks?.[0] || "Failed to generate AWB" }
      }
    } else {
       return { success: false, error: data.rmk || "Invalid response from Delhivery" }
    }
  } catch (error: any) {
    console.error("Delhivery Waybill Generation Error:", error)
    return { success: false, error: error.message || "Failed to connect to Delhivery" }
  }
}

/**
 * Fetch the latest tracking status for an AWB.
 */
export async function trackShipment(awbNumber: string) {
  if (!DELHIVERY_API_KEY) {
    return {
      status: "IN TRANSIT",
      lastUpdated: new Date().toISOString(),
      history: [
        {
          date: new Date().toISOString(),
          location: "Delhivery Hub",
          activity: "Shipment Arrived at Hub"
        }
      ]
    }
  }

  try {
    const response = await fetch(`${BASE_URL}/api/v1/packages/json/?waybill=${awbNumber}`, {
      method: "GET",
      headers: {
        "Authorization": `Token ${DELHIVERY_API_KEY}`,
        "Content-Type": "application/json"
      }
    })

    const data = await response.json()

    if (data && data.ShipmentData && data.ShipmentData.length > 0) {
      const shipment = data.ShipmentData[0].Shipment
      const scans = shipment.Scans || []
      
      return {
        status: shipment.Status?.Status || "IN TRANSIT",
        lastUpdated: shipment.Status?.StatusDateTime || new Date().toISOString(),
        history: scans.map((scan: any) => ({
          date: scan.ScanDetail.ScanDateTime,
          location: scan.ScanDetail.ScannedLocation,
          activity: scan.ScanDetail.Scan
        }))
      }
    }

    return null
  } catch (error) {
    console.error("Delhivery Tracking Error:", error)
    return null
  }
}
