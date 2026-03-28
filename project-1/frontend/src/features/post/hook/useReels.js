// import { useEffect, useState } from "react";
// import { getReels } from "../services/post.api";



// export function useReels() {
//   const [reels, setReels] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const fetchReels = async () => {
//     try {
//       const data = await getReels();
//       setReels(data.reels || []);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchReels();
//   }, []);

//   return { reels, loading, fetchReels };
// }