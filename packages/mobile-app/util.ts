import axios from 'axios';

const req = axios.create({
  baseURL: 'http://192.168.0.85:3333',
});

type NotionSearchItem = {
  id: string;
  isNavigatable: boolean;
  highlight: {
    text: string;
    pathText: string;
  };
  score: number;
};

export type notionQSRecord = {
    id: string,
    name: string,
    type: string,
}

export type notionQSResult = {
  record: notionQSRecord,
  acesstors: notionQSRecord[],
}

export type searchResult = {
  data: NotionSearchItem[];
  total: number;
};

export async function getSuggestionList(search: string): Promise<notionQSResult[]> {
  const response = await req.post(
    '/search-quick',
    {
      query: search,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  const result: notionQSResult[] = response.data.data;

  return result;
}
