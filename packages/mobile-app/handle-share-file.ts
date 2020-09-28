type sharedFile = {
  filePath?: string;
  text?: string;
  weblink?: string;
  contentUri?: string;
  fileName?: string;
  extension?: string;
  subject: string;
};

export type sharedObj = sharedFile;

const titlePatt = /<\s*title.*>(.*?)<\/title>/im;

async function handleShareFile(
  files: sharedFile[],
  ...rest: any
): Promise<sharedObj[]> {
  console.info({files, rest});

  if (files.length > 0) {
    let afile = files[0];
    if (afile.weblink) {
      const procssedFiles = [
        {
          title: afile.subject,
          url: afile.weblink,
        },
      ];

      console.info({procssedFiles});
    }
  }

  return files;
}

export {handleShareFile};
