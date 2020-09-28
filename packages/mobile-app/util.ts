import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const req = axios.create({
  baseURL: 'http://192.168.0.120:5000',
});

if (false && __DEV__) {
  const mock = new MockAdapter(req);

  mock.onPost('/text').reply(200, {
    ok: true,
    id: Math.random().toString().slice(2),
  });

  mock.onPost('/file').reply(() => {
    return [200, {ok: true, id: Math.random().toString().slice(2)}];
  });
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
  payload: {
    service: 'notion';
    isWebLink: boolean;
    [key: string]: any;
  };
};

type fileSend = {
  fileName?: string;
  filePath?: string;
  contentUri?: string;
  mimeType?: string;
};

type noteFile = {
  text: string;
  payload: {
    service: 'notion';
    files: fileSend[];
    [key: string]: any;
  };
};

export async function sendNote(note: noteText) {
  const result = await req.post('/text', note);

  return result.data;
}

export async function sendFile(note: noteFile) {
  const form = new FormData();

  note.payload.files.forEach((i) => {
    form.append('file', {
      name: i.fileName,
      uri: i.contentUri,
      type: i.mimeType,
    });
  });

  form.append(
    'payload',
    JSON.stringify({text: note.text, service: note.payload.service}),
  );

  form.append('service', note.payload.service);

  const res1 = await req.get('/');

  console.info(res1.data);

  try {
    const result = await req.post('/file', form, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    });
    return result;
  } catch (error) {
    console.error(error);
  }
  return null;
}
