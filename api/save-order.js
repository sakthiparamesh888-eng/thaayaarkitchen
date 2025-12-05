import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    const { cart, paymentId, user } = req.body;

    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: "Cart empty" });
    }

    // Authenticate Google Sheets
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const sheetId = process.env.SHEET_ID;

    // Format items
    const items = cart
      .map((i) => `${i.qty || 1}x ${i.name} (₹${i.price})`)
      .join(" | ");

    // Prepare row EXACTLY matching Sheet1 columns
    const row = [
      paymentId,                  // orderId
      user?.name || "",           // customerName
      user?.phone || "",          // customerPhone
      user?.address || "",        // customerAddress
      items                       // items
    ];

    // Append to Sheet1
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Sheet1!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });

    // WhatsApp message
    const message = `
New Order Received!

Order ID: ${paymentId}
Name: ${user?.name}
Phone: ${user?.phone}
Address: ${user?.address}

Items:
${items}
`.trim();

    const url = `https://wa.me/${process.env.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    return res.json({ success: true, whatsappUrl: url });

  } catch (err) {
    console.error("SAVE ORDER ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Saving order failed",
      details: err.message,
    });
  }
}
