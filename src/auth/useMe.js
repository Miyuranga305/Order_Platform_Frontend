
import { useEffect, useState } from "react";
import { fetchMe } from "./user";

export function useMe() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchMe().then(setMe).catch(()=>setMe(null)).finally(()=>setLoading(false));
  }, []);
  return { me, loading };
}
