'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';

interface EditImageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAlt: string;
  onSave: (alt: string) => void;
}

export function EditImageModal({ 
  open, 
  onOpenChange, 
  currentAlt,
  onSave 
}: EditImageModalProps) {
  const { locale } = useTranslation();
  const [alt, setAlt] = useState(currentAlt);

  useEffect(() => {
    if (open) {
      setAlt(currentAlt);
    }
  }, [open, currentAlt]);

  const handleSave = () => {
    onSave(alt);
    onOpenChange(false);
  };

  const handleClose = () => {
    setAlt(currentAlt);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {locale === 'es' ? 'Editar descripción de la imagen' : 'Edit image description'}
          </DialogTitle>
          <DialogDescription>
            {locale === 'es' 
              ? 'La descripción ayuda con la accesibilidad y SEO'
              : 'The description helps with accessibility and SEO'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="alt-text">
              {locale === 'es' ? 'Descripción (alt text)' : 'Description (alt text)'}
            </Label>
            <Input
              id="alt-text"
              type="text"
              placeholder={locale === 'es' ? 'Describe la imagen...' : 'Describe the image...'}
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
          >
            {locale === 'es' ? 'Cancelar' : 'Cancel'}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
          >
            {locale === 'es' ? 'Guardar' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

