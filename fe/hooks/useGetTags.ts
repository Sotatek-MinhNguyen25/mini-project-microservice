import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

interface Tag {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface GetTagsResponse {
  status: string;
  statusCode: number;
  message: string;
  data: Tag[];
  meta: Record<string, any>;
  timestamp: string;
}

export function useGetTags() {
  return useQuery<GetTagsResponse, Error>({
    queryKey: ['tags'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:8000/tag', {
        headers: {
          accept: '*/*',
        },
      })
      return response.data
    },
  })
}