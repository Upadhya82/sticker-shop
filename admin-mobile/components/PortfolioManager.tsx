import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type WorkItem = {
  id: string;
  title: string;
  description: string | null;
  image_path: string;
  created_at: string;
};

const BUCKET = 'shop-portfolio';
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export default function PortfolioManager({ session }: { session: Session }) {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [permissionConfirmed, setPermissionConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadItems = useCallback(async (showLoading = true) => {
    if (!supabase) return;
    if (showLoading) setLoading(true);
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('id, title, description, image_path, created_at')
      .order('created_at', { ascending: false })
      .limit(12);
    if (error) setMessage(error.message);
    else setItems((data ?? []) as WorkItem[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    let canceled = false;
    async function loadInitialItems() {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('id, title, description, image_path, created_at')
        .order('created_at', { ascending: false })
        .limit(12);
      if (canceled) return;
      if (error) setMessage(error.message);
      else setItems((data ?? []) as WorkItem[]);
      setLoading(false);
    }
    void loadInitialItems();
    return () => { canceled = true; };
  }, []);

  async function chooseImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo permission needed', 'Allow photo library access to add a completed project photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      exif: false,
    });
    if (result.canceled) return;
    const selected = result.assets[0];
    if (selected.fileSize && selected.fileSize > MAX_IMAGE_BYTES) {
      setMessage('Choose a photo smaller than 8 MB.');
      return;
    }
    setImage(selected);
    setMessage('');
  }

  async function publishWork() {
    if (!supabase || !image) return;
    if (!title.trim() || title.trim().length > 120) {
      setMessage('Enter a title between 1 and 120 characters.');
      return;
    }
    if (description.length > 500) {
      setMessage('Description must be 500 characters or fewer.');
      return;
    }
    if (!permissionConfirmed) {
      setMessage('Confirm that this photo can be shared publicly.');
      return;
    }

    setSaving(true);
    setMessage('');
    let uploadedPath = '';
    try {
      const mimeType = image.mimeType === 'image/png' || image.mimeType === 'image/webp'
        ? image.mimeType
        : 'image/jpeg';
      const extension = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
      const bytes = await fetch(image.uri).then((response) => response.arrayBuffer());
      if (bytes.byteLength > MAX_IMAGE_BYTES) throw new Error('Choose a photo smaller than 8 MB.');
      uploadedPath = `${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(uploadedPath, bytes, {
        contentType: mimeType,
        upsert: false,
      });
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from('portfolio_items').insert({
        title: title.trim(),
        description: description.trim() || null,
        image_path: uploadedPath,
        created_by: session.user.id,
      });
      if (insertError) {
        await supabase.storage.from(BUCKET).remove([uploadedPath]);
        throw insertError;
      }

      setTitle('');
      setDescription('');
      setImage(null);
      setPermissionConfirmed(false);
      setMessage('Published. The project is now visible on the customer website.');
      await loadItems();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not publish this project.');
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(item: WorkItem) {
    Alert.alert('Remove project?', `“${item.title}” will no longer appear on the website.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => { void removeWork(item); } },
    ]);
  }

  async function removeWork(item: WorkItem) {
    if (!supabase) return;
    setMessage('');
    const { error } = await supabase.from('portfolio_items').delete().eq('id', item.id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setItems((current) => current.filter((entry) => entry.id !== item.id));
    const { error: imageError } = await supabase.storage.from(BUCKET).remove([item.image_path]);
    if (imageError) setMessage(`Project removed; its image could not be deleted: ${imageError.message}`);
  }

  return <View style={{ margin: 16, marginTop: 8, gap: 12, borderRadius: 16, borderWidth: 1, borderColor: '#27272a', backgroundColor: '#18181b', padding: 16 }}>
    <View>
      <Text style={{ color: '#fafafa', fontSize: 19, fontWeight: '800' }}>Our Work gallery</Text>
      <Text style={{ color: '#a1a1aa', fontSize: 13, lineHeight: 19, marginTop: 4 }}>Add completed work for customers to see on the website.</Text>
    </View>

    <Pressable onPress={chooseImage} accessibilityRole="button" style={{ minHeight: 46, justifyContent: 'center', alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#52525b' }}>
      <Text style={{ color: '#fbbf24', fontWeight: '700' }}>{image ? 'Choose a different photo' : 'Choose project photo'}</Text>
    </Pressable>
    {image ? <Image source={{ uri: image.uri }} alt="Selected project preview" style={{ width: '100%', height: 180, borderRadius: 10, backgroundColor: '#09090b' }} resizeMode="cover" /> : null}
    <TextInput value={title} onChangeText={setTitle} maxLength={120} placeholder="Project title" placeholderTextColor="#71717a" style={inputStyle} />
    <TextInput value={description} onChangeText={setDescription} maxLength={500} multiline placeholder="Short description (optional)" placeholderTextColor="#71717a" style={[inputStyle, { minHeight: 78, textAlignVertical: 'top', paddingTop: 12 }]} />
    <Pressable onPress={() => setPermissionConfirmed((value) => !value)} accessibilityRole="checkbox" accessibilityState={{ checked: permissionConfirmed }} style={{ flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 2 }}>
      <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 5, borderWidth: 1, borderColor: permissionConfirmed ? '#fbbf24' : '#71717a', backgroundColor: permissionConfirmed ? '#fbbf24' : 'transparent' }}>
        {permissionConfirmed ? <Text style={{ color: '#18181b', fontWeight: '900', fontSize: 13 }}>✓</Text> : null}
      </View>
      <Text style={{ flex: 1, color: '#d4d4d8', fontSize: 12, lineHeight: 17 }}>I have permission to share this photo publicly.</Text>
    </Pressable>
    <Pressable onPress={publishWork} disabled={saving || !image} accessibilityRole="button" style={{ minHeight: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#fbbf24', opacity: saving || !image ? 0.55 : 1 }}>
      {saving ? <ActivityIndicator color="#18181b" /> : <Text style={{ color: '#18181b', fontWeight: '800' }}>Publish to website</Text>}
    </Pressable>
    {message ? <Text accessibilityRole="alert" style={{ color: message.startsWith('Published') ? '#86efac' : '#fca5a5', fontSize: 12, lineHeight: 17 }}>{message}</Text> : null}

    <View style={{ height: 1, backgroundColor: '#27272a', marginVertical: 2 }} />
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ color: '#fafafa', fontWeight: '700' }}>Published projects</Text>
      <Pressable onPress={() => { void loadItems(); }}><Text style={{ color: '#fbbf24', fontWeight: '600' }}>Refresh</Text></Pressable>
    </View>
    {loading ? <ActivityIndicator color="#fbbf24" /> : null}
    {!loading && items.length === 0 ? <Text style={{ color: '#a1a1aa', fontSize: 13 }}>No projects published yet.</Text> : null}
    {items.map((item) => {
      const imageUrl = supabase?.storage.from(BUCKET).getPublicUrl(item.image_path).data.publicUrl;
      return <View key={item.id} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        {imageUrl ? <Image source={{ uri: imageUrl }} alt={item.title} style={{ width: 64, height: 54, borderRadius: 8, backgroundColor: '#09090b' }} /> : null}
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ color: '#fafafa', fontWeight: '600' }}>{item.title}</Text>
          {item.description ? <Text numberOfLines={1} style={{ color: '#a1a1aa', fontSize: 12 }}>{item.description}</Text> : null}
        </View>
        <Pressable onPress={() => confirmDelete(item)} accessibilityRole="button"><Text style={{ color: '#fca5a5', fontWeight: '700', padding: 5 }}>Remove</Text></Pressable>
      </View>;
    })}
  </View>;
}

const inputStyle = {
  minHeight: 46,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#3f3f46',
  backgroundColor: '#09090b',
  color: '#fafafa',
  paddingHorizontal: 12,
  fontSize: 14,
} as const;
