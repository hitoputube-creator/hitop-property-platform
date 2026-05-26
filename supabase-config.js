// Supabase 클라이언트 설정 (ESM CDN)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL      = 'https://xaxbkdnrzsghsabkdvzj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhheGJrZG5yenNnaHNhYmtkdnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNjc5NTIsImV4cCI6MjA4OTY0Mzk1Mn0.l27ZYQHLt48p7EQrZ8gbAOmJHvCfIur84CtgoWlA8Wg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const LISTING_IMAGES_BUCKET = 'listing-images';
