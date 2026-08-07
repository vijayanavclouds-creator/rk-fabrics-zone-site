require('dotenv').config();

async function testDelhivery() {
  const apiKey = process.env.DELHIVERY_API_KEY;
  const baseUrl = "https://track.delhivery.com";
  
  if (!apiKey) {
    console.error("No API key found in .env");
    return;
  }

  const payload = {
    format: "json",
    data: {
      shipments: [
        {
          name: "Test User",
          add: "123 Test Street, Test Area, Jaipur, Rajasthan",
          pin: "302001",
          city: "Jaipur",
          state: "Rajasthan",
          country: "India",
          phone: "9999999999",
          order: "TEST_ORDER_" + Date.now(),
          payment_mode: "Pre-paid",
          products_desc: "Test Product (x1)",
          cod_amount: 0,
          order_date: new Date().toISOString().replace("T", " ").substring(0, 19),
          total_amount: 500,
          seller_name: "RK Fabrics Zone",
          quantity: "1",
          shipping_mode: "Surface"
        }
      ],
      pickup_location: {
        name: "RK FABRIC ZONE B2C"
      }
    }
  };

  const formData = new URLSearchParams();
  formData.append("format", "json");
  formData.append("data", JSON.stringify(payload.data));

  try {
    console.log("Generating AWB...");
    const response = await fetch(`${baseUrl}/api/cmu/create.json`, {
      method: "POST",
      headers: {
        "Authorization": `Token ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData.toString()
    });

    const data = await response.json();
    console.log("Delhivery Create Response:", JSON.stringify(data, null, 2));

    if (data.success && data.packages && data.packages.length > 0) {
      const waybill = data.packages[0].waybill;
      if (waybill) {
        console.log(`AWB ${waybill} generated successfully. Attempting to cancel...`);

        // Cancel the shipment
        const cancelData = {
          waybill: waybill,
          cancellation: true
        };
        const cancelRes = await fetch(`${baseUrl}/api/p/edit`, {
          method: "POST",
          headers: {
            "Authorization": `Token ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(cancelData)
        });
        const cancelResult = await cancelRes.json();
        console.log("Delhivery Cancel Response:", JSON.stringify(cancelResult, null, 2));
      }
    }
    
  } catch (error) {
    console.error("Error connecting to Delhivery:", error);
  }
}

testDelhivery();
