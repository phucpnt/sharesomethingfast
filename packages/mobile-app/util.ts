import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const req = axios.create({
  baseURL: 'http://192.168.0.85:3333',
});

if(__DEV__){
  const mock = new MockAdapter(req);

  mock.onPost('/text').reply(200, {
    ok: true,
    id: Math.random().toString().slice(2)
  })
}


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
  id: string;
  name: string;
  type: string;
};

export type notionQSResult = {
  record: notionQSRecord;
  acesstors: notionQSRecord[];
};

export type searchResult = {
  data: NotionSearchItem[];
  total: number;
};

export async function getSuggestionList(
  search: string,
): Promise<notionQSResult[]> {
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

type noteText = {
  text: string;
  service: 'notion';
  payload: {
    isWebLink: boolean;
    [key: string]: any;
  };
};

export async function sendNote(note: noteText) {
  const result = await req.post('/text', note);

  return result.data;
}
