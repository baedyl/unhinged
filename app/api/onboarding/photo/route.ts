import { auth } from '@clerk/nextjs/server';
import { createServiceClient, getOrCreateProfile } from '@/lib/supabase-server';

const BUCKET = 'photos';
const MAX_PHOTOS = 4;

/** POST multipart/form-data: photo file → upload to Supabase Storage, return URL */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('photo') as File | null;
    if (!file) return Response.json({ error: 'photo field required' }, { status: 400 });

    const supabase = createServiceClient();
    const profile = await getOrCreateProfile(userId);

    const currentPhotos: string[] = profile.photo_urls ?? [];
    if (currentPhotos.length >= MAX_PHOTOS) {
      return Response.json({ error: `Maximum ${MAX_PHOTOS} photos allowed` }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const path = `${profile.id}/${Date.now()}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

    if (uploadError) return Response.json({ error: uploadError.message }, { status: 500 });

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);

    const updatedPhotos = [...currentPhotos, publicUrl];
    await supabase
      .from('profiles')
      .update({ photo_urls: updatedPhotos })
      .eq('id', profile.id);

    return Response.json({ url: publicUrl, photos: updatedPhotos });
  } catch (err) {
    console.error('[POST /api/onboarding/photo]', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** DELETE body: { url: string } — remove one photo */
export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { url } = await req.json() as { url: string };
    if (!url) return Response.json({ error: 'url required' }, { status: 400 });

    const supabase = createServiceClient();
    const profile = await getOrCreateProfile(userId);

    // Extract storage path from public URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split(`/${BUCKET}/`);
    const storagePath = pathParts[1];

    if (storagePath) {
      await supabase.storage.from(BUCKET).remove([storagePath]);
    }

    const updatedPhotos = (profile.photo_urls ?? []).filter((p: string) => p !== url);
    await supabase
      .from('profiles')
      .update({ photo_urls: updatedPhotos })
      .eq('id', profile.id);

    return Response.json({ photos: updatedPhotos });
  } catch (err) {
    console.error('[DELETE /api/onboarding/photo]', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
