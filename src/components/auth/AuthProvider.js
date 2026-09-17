"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthProvider({ children }) {
  // Menggunakan useState untuk memastikan client Supabase di-instantiate hanya 1x
  // Ini menjaga background token refresh berjalan selama tab terbuka
  useState(() => createClient());

  return <>{children}</>;
}
