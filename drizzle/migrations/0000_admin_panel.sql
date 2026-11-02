CREATE TABLE public.access_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  revoked boolean NOT NULL DEFAULT false,
  uses integer NOT NULL DEFAULT 0,
  last_used_at timestamptz
);
GRANT ALL ON public.access_keys TO service_role;
ALTER TABLE public.access_keys ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.visitor_sessions (
  session_id text PRIMARY KEY,
  path text NOT NULL DEFAULT '/',
  user_agent text NOT NULL DEFAULT '',
  first_seen timestamptz NOT NULL DEFAULT now(),
  last_seen timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.visitor_sessions TO service_role;
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;