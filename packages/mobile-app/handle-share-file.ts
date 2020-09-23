import axios from 'axios';

type sharedFile = {
  filePath?: string;
  text?: string;
  weblink?: string;
  contentUri?: string;
  fileName?: string;
  extension?: string;
};

type sharedLink = {
  title: string;
  url: string;
};

const titlePatt = /<\s*title.*>(.*?)<\/title>/im;

async function handleShareFile(
  files: sharedFile[],
): Promise<sharedLink[] | sharedFile[]> {
  console.info({files});

  if (files.length > 0) {
    let afile = files[0];
    if (afile.weblink) {
      const result = await axios.get(afile.weblink);
      const html: string = result.data;
      const matches = html.match(titlePatt);


      const procssedFiles = [
        {
          title: matches ? matches[1] : '',
          url: afile.weblink,
        },
      ];

      console.info({procssedFiles});
    }
  }

  return files;
}

export {handleShareFile};
