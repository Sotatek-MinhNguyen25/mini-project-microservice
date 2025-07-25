'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/useToast';
import { useGetTags, useCreatePost } from '@/hooks/usePosts';
import CompactPostView from './createPost/CompactPostView';
import PostFormHeader from './createPost/PostFormHeader';
import PostTagsInput from './createPost/PostTagsInput';
import PostFileUpload from './createPost/PostFileUpload';
import { LoadingOutlined } from '@ant-design/icons';
import { Form, Input, Button } from 'antd';
import { CreatePostRequest, PostImage, TagId, Tag } from '@/types/post';
import { FilePreview } from '@/types';
import { useTheme } from 'next-themes';

interface ExtendedFilePreview extends FilePreview {
  altText?: string;
}

export function CreatePost() {
  const [form] = Form.useForm();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [filePreviews, setFilePreviews] = useState<ExtendedFilePreview[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<TagId[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { theme } = useTheme();
  const { toast } = useToast();
  const { mutate: createPost, isPending } = useCreatePost();
  const {
    data: tagsResponse,
    isLoading: isTagsLoading,
    error: tagsError,
  } = useGetTags();

  const tags: any = tagsResponse || [];
  const MAX_TITLE_LENGTH = 100;
  const MAX_CONTENT_LENGTH = 5000;
  const MAX_TAGS = 5;
  const MAX_FILES = 5;
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'video/mp4',
    'video/webm',
  ];

  const inputClassName =
    theme === 'dark'
      ? 'bg-gray-700 text-white border-gray-600 hover:border-gray-500 focus:border-blue-500'
      : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400 focus:border-blue-500';

  const formClassName =
    theme === 'dark'
      ? 'space-y-6 bg-gray-800 p-6 rounded-lg shadow-lg'
      : 'space-y-6 bg-white p-6 rounded-lg shadow-lg';

  const buttonClassName =
    theme === 'dark'
      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200'
      : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200';

  const cancelButtonClassName =
    theme === 'dark'
      ? 'text-gray-300 hover:text-white'
      : 'text-gray-600 hover:text-gray-900';

  const handleTagSelect = (tagId: string) => {
    if (selectedTagIds.length >= MAX_TAGS) {
      toast({
        title: 'Tag Limit Reached',
        description: `You can only select up to ${MAX_TAGS} tags`,
        variant: 'destructive',
      });
      return;
    }

    if (!selectedTagIds.some((tag: any) => tag.tagId === tagId)) {
      const tag = tags.find((tag: any) => tag.id === tagId);
      if (tag) {
        setSelectedTagIds([
          ...selectedTagIds,
          { tagId: tag.id, tag: { id: tag.id, name: tag.name } },
        ]);
      }
    }
  };

  const removeTag = (tagIdToRemove: string) => {
    setSelectedTagIds(
      selectedTagIds.filter((tag) => tag.tagId !== tagIdToRemove),
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      if (filePreviews.length + files.length > MAX_FILES) {
        toast({
          title: 'File Limit Reached',
          description: `You can only upload up to ${MAX_FILES} files`,
          variant: 'destructive',
        });
        return;
      }

      const validFiles = files.filter((file) => {
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          toast({
            title: 'Invalid File Type',
            description:
              'Only JPEG, PNG images, and MP4, WebM videos are allowed',
            variant: 'destructive',
          });
          return false;
        }

        if (file.size > MAX_FILE_SIZE) {
          toast({
            title: 'File Too Large',
            description: `Each file must be less than ${
              MAX_FILE_SIZE / (1024 * 1024)
            }MB`,
            variant: 'destructive',
          });
          return false;
        }
        return true;
      });

      validFiles.forEach((file) => {
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
    if (altText.length > 200) {
      toast({
        title: 'Alt Text Too Long',
        description: 'Alt text must be 200 characters or less',
        variant: 'destructive',
      });
      return;
    }
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

  const handleSubmit = async (values: { title: string; content: string }) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to create a post',
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
      title: values.title?.trim() || 'Untitled Post',
      content: values.content.trim(),
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
          form.resetFields();
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

  return isExpanded ? (
    <Form
      form={form}
      onFinish={handleSubmit}
      layout="vertical"
      className={formClassName}
    >
      <PostFormHeader user={user} setIsExpanded={setIsExpanded} />

      <Form.Item
        name="title"
        label={
          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
            Title
          </span>
        }
        rules={[
          { required: true, message: 'Title is required' },
          {
            max: MAX_TITLE_LENGTH,
            message: `Title must be ${MAX_TITLE_LENGTH} characters or less`,
          },
        ]}
      >
        <Input
          placeholder="Enter post title"
          className={`${inputClassName} rounded-md transition-all duration-200`}
          style={{ color: '#000' }}
          autoFocus
        />
      </Form.Item>

      <Form.Item
        name="content"
        label={
          <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
            Content
          </span>
        }
        rules={[
          { required: true, message: 'Content is required' },
          {
            max: MAX_CONTENT_LENGTH,
            message: `Content must be ${MAX_CONTENT_LENGTH} characters or less`,
          },
        ]}
      >
        <Input.TextArea
          rows={4}
          placeholder="What's on your mind?"
          className={`${inputClassName} rounded-md transition-all duration-200`}
          style={{ color: '#000' }}
        />
      </Form.Item>

      <PostTagsInput
        tags={selectedTagIds.map((tag) => tag.tagId)}
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

      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="default"
          onClick={() => {
            form.resetFields();
            setIsExpanded(false);
          }}
          className={cancelButtonClassName}
        >
          Cancel
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          className={buttonClassName}
          disabled={isPending || isTagsLoading}
          icon={isPending ? <LoadingOutlined /> : null}
        >
          {isPending ? 'Sharing...' : 'Share Post'} ✨
        </Button>
      </div>
    </Form>
  ) : (
    <CompactPostView user={user} setIsExpanded={setIsExpanded} />
  );
}
