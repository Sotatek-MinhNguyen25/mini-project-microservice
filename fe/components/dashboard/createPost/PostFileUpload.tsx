'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ImageIcon, Video, X, Plus } from 'lucide-react'
// import { PostFileUploadProps } from '@/types/post'

export interface PostFileUploadProps {
  filePreviews: Array<{
    file: File;
    url: string;
    type: 'image' | 'video';
    altText?: string;
  }>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: (index: number) => void;
  updateAltText: (index: number, altText: string) => void;
}

export default function PostFileUpload({
  filePreviews,
  fileInputRef,
  handleFileChange,
  removeFile,
  updateAltText,
}: PostFileUploadProps) {
  return (
    <div>
      <div className="border-2 border-dashed border-border/40 rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
        <div className="flex items-center justify-center mb-2">
          <ImageIcon className="h-5 w-5 text-muted-foreground mr-2" />
          <Video className="h-5 w-5 text-muted-foreground" />
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          className="text-primary hover:text-primary/80"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Photos/Videos
        </Button>
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <p className="text-xs text-muted-foreground mt-1">Support: PNG, JPG, MP4, MOV • Max: 10MB per file</p>
      </div>
      {filePreviews.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          {filePreviews.map((preview, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                {preview.type === 'image' ? (
                  <img
                    src={preview.url || '/placeholder.svg'}
                    alt={preview.altText || `Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video src={preview.url} className="w-full h-full object-cover" muted />
                )}
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
              >
                <X className="h-3 w-3" />
              </Button>
              <div className="absolute bottom-2 left-2">
                <Badge variant="secondary" className="text-xs">
                  {preview.type === 'image' ? <ImageIcon className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                </Badge>
              </div>
              {preview.type === 'image' && (
                <div className="mt-2">
                  <Input
                    type="text"
                    placeholder={`Alt text for image ${index + 1}`}
                    value={preview.altText || ''}
                    onChange={(e) => updateAltText(index, e.target.value)}
                    className="text-sm border-border/40 focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}