const API = "https://6842adafe1347494c31d8de0.mockapi.io/api/v1/messages";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const response = await fetch(API);
      const data = await response.json();
      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      const { username, name, text, fileUrl } = req.body;
      if (!username || (!text && !fileUrl)) {
        return res.status(400).json({ error: "Missing text or fileUrl" });
      }

      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, name, text, fileUrl }),
      });

      const result = await response.json();
      return res.status(201).json({ success: true, message: result });
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: "Missing message ID" });
      }

      await fetch(`${API}/${id}`, { method: "DELETE" });
      return res.status(200).json({ success: true });
    }

    if (req.method === "PUT") {
      const { id } = req.query;
      const { text } = req.body;
      if (!id || typeof text !== "string" || text.trim() === "") {
        return res.status(400).json({ error: "Missing or invalid fields" });
      }

      await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}