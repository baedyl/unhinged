-- ─── Drop Supabase auth.users FK (incompatible with Clerk-only setup) ────────
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- ─── Onboarding columns on profiles ──────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_step int NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_urls text[] NOT NULL DEFAULT '{}';

-- ─── Prompts table ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prompts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text NOT NULL UNIQUE,
  text_en text NOT NULL,
  text_fr text NOT NULL,
  is_active boolean DEFAULT true
);

INSERT INTO prompts (slug, text_en, text_fr) VALUES
  ('montreal-opinion', 'My most unhinged Montreal opinion is...', 'Mon opinion montréalaise la plus « unhinged » est...'),
  ('surprised-by',     'The last thing that genuinely surprised me was...', 'La dernière chose qui m''a vraiment surpris est...'),
  ('bucket-list',      'One Montreal thing still on my bucket list:', 'Une chose à Montréal encore sur ma liste de choses à faire :')
ON CONFLICT (slug) DO NOTHING;

-- ─── User prompt answers ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_prompt_answers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  prompt_id int REFERENCES prompts(id) NOT NULL,
  answer_text text NOT NULL CHECK (char_length(answer_text) <= 280),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, prompt_id)
);

ALTER TABLE user_prompt_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Answers viewable by everyone"
  ON user_prompt_answers FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users insert own answers"
  ON user_prompt_answers FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Users update own answers"
  ON user_prompt_answers FOR UPDATE USING (true);

-- ─── Seed interests (extended) ────────────────────────────────────────────────
INSERT INTO interests (slug, label_en, label_fr, category) VALUES
  ('marche-atwater-regular', 'Marché Atwater regular',   'Habitué du Marché Atwater',         'food'),
  ('brunch-queue-warrior',   'Brunch queue warrior',     'Guerrier de la file de brunch',     'food'),
  ('parc-lafontaine-lounger','Parc Lafontaine lounger',  'Flâneur du Parc Lafontaine',        'outdoors'),
  ('bixi-commuter',          'Bixi commuter',            'Navetteur Bixi',                    'outdoors'),
  ('just-for-laughs-fan',    'Just for Laughs fan',      'Fan de Just for Laughs',            'culture'),
  ('fringe-theatre-goer',    'Fringe theatre-goer',      'Amateur de théâtre Fringe',         'culture'),
  ('dep-wine-enthusiast',    'Dép wine enthusiast',      'Amateur de vins de dépanneur',      'nightlife'),
  ('plateau-bar-hopper',     'Plateau bar hopper',       'Barman du Plateau',                 'nightlife'),
  ('karaoke-devotee',        'Karaoke devotee',          'Dévot du karaoké',                  'nightlife'),
  ('second-hand-shopper',    'Second-hand shopper',      'Acheteur de seconde main',          'lifestyle'),
  ('bilingual-mixer',        'Bilingual mixer',          'Mélangeur bilingue',                'lifestyle'),
  ('hockey-watcher',         'Hockey watcher',           'Amateur de hockey',                 'sports')
ON CONFLICT (slug) DO NOTHING;

-- ─── photos storage bucket (run as admin) ────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT DO NOTHING;

-- Allow public reads + authenticated uploads
CREATE POLICY IF NOT EXISTS "Photos are publicly readable"
  ON storage.objects FOR SELECT USING (bucket_id = 'photos');

CREATE POLICY IF NOT EXISTS "Anyone can upload photos"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos');

CREATE POLICY IF NOT EXISTS "Uploader can delete their photos"
  ON storage.objects FOR DELETE USING (bucket_id = 'photos');

-- ─── RPC: ranked matches with shared-interest count ─────────────────────────
CREATE OR REPLACE FUNCTION get_matches(p_clerk_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_id uuid;
  result     jsonb;
BEGIN
  SELECT id INTO current_id FROM profiles WHERE clerk_id = p_clerk_id;
  IF current_id IS NULL THEN RETURN '[]'::jsonb; END IF;

  SELECT jsonb_agg(row_data ORDER BY (row_data->>'shared_count')::int DESC)
  INTO   result
  FROM (
    SELECT jsonb_build_object(
      'id',                p.id,
      'name',              p.name,
      'age',               p.age,
      'neighbourhood',     p.neighbourhood,
      'photo_urls',        p.photo_urls,
      'shared_count', (
        SELECT COUNT(*) FROM user_interests ui
        WHERE ui.user_id = p.id
          AND ui.interest_id IN (
            SELECT interest_id FROM user_interests WHERE user_id = current_id
          )
      ),
      'common_interests', (
        SELECT COALESCE(array_agg(i.label_en), '{}')
        FROM user_interests ui
        JOIN interests i ON i.id = ui.interest_id
        WHERE ui.user_id = p.id
          AND ui.interest_id IN (
            SELECT interest_id FROM user_interests WHERE user_id = current_id
          )
      ),
      'all_interests', (
        SELECT COALESCE(array_agg(i.label_en), '{}')
        FROM user_interests ui JOIN interests i ON i.id = ui.interest_id
        WHERE ui.user_id = p.id
      ),
      'prompt', (
        SELECT jsonb_build_object(
          'question', pr.text_en,
          'answer',   upa.answer_text
        )
        FROM user_prompt_answers upa
        JOIN prompts pr ON pr.id = upa.prompt_id
        WHERE upa.user_id = p.id
        ORDER BY upa.prompt_id
        LIMIT 1
      )
    ) AS row_data
    FROM profiles p
    WHERE p.id != current_id
      AND p.onboarding_step >= 5
    LIMIT 30
  ) sub;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;
