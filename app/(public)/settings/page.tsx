'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/use-translation';
import { useUserContext } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Camera, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/container';

export default function SettingsPage() {
  const { locale } = useTranslation();
  const { user, isLoading: userLoading, refetch } = useUserContext();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Cargar datos del usuario
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setBio(user.bio || '');
      setAvatarPreview(user.imageUrl || null);
    }
  }, [user]);

  // La autenticación se maneja en el layout (public)/layout.tsx

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo
      if (!file.type.startsWith('image/')) {
        setError(locale === 'es' ? 'El archivo debe ser una imagen' : 'File must be an image');
        return;
      }

      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(locale === 'es' ? 'La imagen es demasiado grande. Máximo 5MB' : 'Image is too large. Maximum 5MB');
        return;
      }

      setAvatarFile(file);
      setError(null);

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('firstName', firstName || '');
      formData.append('lastName', lastName || '');
      formData.append('bio', bio || '');
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const response = await fetch('/api/users/me', {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || (locale === 'es' ? 'Error al actualizar perfil' : 'Error updating profile'));
      }

      setSuccess(true);
      // Refrescar datos del usuario
      await refetch();
      
      // Limpiar preview temporal
      if (avatarFile) {
        setAvatarFile(null);
      }

      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || (locale === 'es' ? 'Error al actualizar perfil' : 'Error updating profile'));
    } finally {
      setSaving(false);
    }
  };

  if (userLoading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const pageTitle = locale === 'es' ? 'Configuración' : 'Settings';
  const firstNameLabel = locale === 'es' ? 'Nombre' : 'First Name';
  const lastNameLabel = locale === 'es' ? 'Apellido' : 'Last Name';
  const bioLabel = locale === 'es' ? 'Descripción' : 'Bio';
  const bioPlaceholder = locale === 'es' 
    ? 'Escribe una breve descripción sobre ti...' 
    : 'Write a brief description about yourself...';
  const saveButton = locale === 'es' ? 'Guardar cambios' : 'Save changes';
  const cancelButton = locale === 'es' ? 'Cancelar' : 'Cancel';

  return (
    <Container className="bg-background">
      <section className="pt-24 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-8">
              {pageTitle}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="space-y-4">
                <Label>{locale === 'es' ? 'Foto de perfil' : 'Profile Picture'}</Label>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="size-24 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-2xl font-semibold text-muted-foreground">
                          {firstName.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Camera className="size-4" />
                    {locale === 'es' ? 'Cambiar foto' : 'Change photo'}
                  </Button>
                </div>
              </div>

              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName">{firstNameLabel}</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={firstNameLabel}
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName">{lastNameLabel}</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={lastNameLabel}
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">{bioLabel}</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={bioPlaceholder}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">
                  {locale === 'es' ? 'Perfil actualizado correctamente' : 'Profile updated successfully'}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      {locale === 'es' ? 'Guardando...' : 'Saving...'}
                    </>
                  ) : (
                    saveButton
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={saving}
                >
                  {cancelButton}
                </Button>
              </div>
            </form>
          </motion.div>
      </section>
    </Container>
  );
}

