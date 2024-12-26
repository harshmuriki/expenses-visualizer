// import { getProcessedData } from "./upload"; // Import shared variable getter

// export default function handler(req, res) {
//   try {
//     if (req.method === "GET") {
//       const data = getProcessedData(); // Access processed data
//       console.log("data is:", data);
//       if (!data) {
//         res.status(404).json({ error: "No processed data available" });
//         return;
//       }
//       res.status(200).json(data);
//     } else {
//       res.status(405).json({ error: "Method not allowed" });
//     }
//   } catch (error) {
//     console.error("Error in /api/data:", error);
//     res
//       .status(500)
//       .json({ error: "Internal Server Error", details: error.message });
//   }
// }
