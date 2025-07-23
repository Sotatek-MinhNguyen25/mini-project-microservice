'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/useToast';
import { useGetTags } from '@/hooks/usePosts';
import CompactPostView from './createPost/CompactPostView';
import PostFormHeader from './createPost/PostFormHeader';
import PostFormFields from './createPost/PostFormFields';
import PostTagsInput from './createPost/PostTagsInput';
import PostFileUpload from './createPost/PostFileUpload';
import { Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useCreatePost } from '@/hooks/usePosts';
import { CreatePostRequest, PostImage, TagId, Tag } from '@/types/post';
import { FilePreview } from '@/types';

interface ExtendedFilePreview extends FilePreview {
  altText?: string;
}

export function CreatePost() {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [content, setContent] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [filePreviews, setFilePreviews] = useState<ExtendedFilePreview[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<TagId[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { mutate: createPost, isPending } = useCreatePost();
  const {
    data: tagsResponse,
    isLoading: isTagsLoading,
    error: tagsError,
  } = useGetTags();

  const tags: Tag[] = tagsResponse?.data || [];

  const handleTagSelect = (tagId: string) => {
    if (!selectedTagIds.some((tag) => tag.tag.id === tagId)) {
      const tag = tags.find((tag) => tag.id === tagId);
      if (tag) {
        setSelectedTagIds([...selectedTagIds, { tag }]);
      }
    }
  };

  const removeTag = (tagIdToRemove: string) => {
    setSelectedTagIds(
      selectedTagIds.filter((tag) => tag.tag.id !== tagIdToRemove),
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      files.forEach((file) => {
        const url = URL.createObjectURL(file);
        const type = file.type.startsWith('image/') ? 'image' : 'video';
        const altText = file.type.startsWith('image/')
          ? `Image ${filePreviews.length + 1}`
          : undefined;
        setFilePreviews((prev) => [...prev, { file, url, type, altText }]);
      });
    }
  };

  const updateAltText = (index: number, altText: string) => {
    setFilePreviews((prev) =>
      prev.map((preview, i) =>
        i === index ? { ...preview, altText } : preview,
      ),
    );
  };

  const removeFile = (indexToRemove: number) => {
    setFilePreviews((prev) => {
      const newPreviews = prev.filter((_, index) => index !== indexToRemove);
      URL.revokeObjectURL(prev[indexToRemove].url);
      return newPreviews;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user?.id) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in content and ensure you are logged in',
        variant: 'destructive',
      });
      return;
    }

    if (tagsError) {
      toast({
        title: 'Error',
        description: 'Failed to load tags. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    const postImages: PostImage[] = filePreviews
      .filter((preview) => preview.type === 'image')
      .map((preview) => ({
        id: '',
        url: preview.url,
        altText:
          preview.altText || `Image ${filePreviews.indexOf(preview) + 1}`,
      }));

    const postData: CreatePostRequest = {
      title: title || 'Untitled Post',
      content,
      userId: user.id,
      postImages: postImages.length > 0 ? postImages : undefined,
      tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
    };

    createPost(
      {
        ...postData,
        files: filePreviews.map((p) => p.file),
      },
      {
        onSuccess: () => {
          setContent('');
          setTitle('');
          setSelectedTagIds([]);
          setFilePreviews([]);
          setIsExpanded(false);
          toast({
            title: 'Success! 🎉',
            description: 'Your post has been shared with the world!',
          });
        },
        onError: (error: any) => {
          toast({
            title: 'Error',
            description: error.message || 'Failed to create post',
            variant: 'destructive',
          });
        },
      },
    );
  };

  if (!user) return null;

  const fullName = `${user.profile.firstName} ${user.profile.lastName}`;

  return isExpanded ? (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
    >
      <PostFormHeader
        fullName={fullName}
        user={user}
        setIsExpanded={setIsExpanded}
      />
      <PostFormFields
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
      />
      <PostTagsInput
        tags={selectedTagIds.map((tag) => tag.tag.id)}
        availableTags={tags}
        handleTagSelect={handleTagSelect}
        removeTag={removeTag}
        isLoading={isTagsLoading}
      />
      <PostFileUpload
        filePreviews={filePreviews}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
        removeFile={removeFile}
        updateAltText={updateAltText}
      />
      <div className="flex justify-between items-center pt-4 border-t border-border/40">
        <Button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          disabled={!content.trim() || isPending || isTagsLoading}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? 'Sharing...' : 'Share Post'} ✨
        </Button>
      </div>
    </form>
  ) : (
    <CompactPostView
      user={user}
      fullName={fullName}
      setIsExpanded={setIsExpanded}
    />
  );
}
