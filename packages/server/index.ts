import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3333;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

type NotionSearchResult = {
  id: string;
  isNavigatable: boolean;
  highlight: {
    text: string;
    pathText: string;
  };
  score: number;
};

type NotionQSRecord = {
    id: string,
    name: string,
    type: string,
}

type NotionQSResult = {
  record: NotionQSRecord,
  acesstors: NotionQSRecord[],
}

const TOKEN = process.env.TOKEN;

app.post("/search-quick", async (req, res) => {
  const { token = TOKEN, query } = req.body;

  const result = await axios.post(
    "https://www.notion.so/api/v3/searchWebClipperPages",
    {
      type: "BlocksInSpace",
      query: query,
      spaceId: "4b11c342-af11-401b-aae7-47a97101da61",
      limit: 20,
      filters: {
        isDeletedOnly: false,
        excludeTemplates: false,
        isNavigableOnly: false,
        requireEditPermissions: false,
        ancestors: [],
        createdBy: [],
        editedBy: [],
        lastEditedTime: {},
        createdTime: {},
      },
      sort: "Relevance",
      source: "quick_find",
    },
    {
      headers: {
        "Content-Type": "application/json",
        "accept-language": "en-US,en;q=0.9,vi-VN;q=0.8,vi;q=0.7",
        cookie: `token_v2=${token}; `,
      },
    }
  );

  const data: NotionQSResult[] = result.data.results;

  res.send({ data });
});

app.post("/search", async (req, res) => {
  const { token = TOKEN, query } = req.body;

  const result = await axios.post(
    "https://www.notion.so/api/v3/search",
    {
      type: "BlocksInSpace",
      query: query,
      spaceId: "4b11c342-af11-401b-aae7-47a97101da61",
      limit: 20,
      filters: {
        isDeletedOnly: false,
        excludeTemplates: false,
        isNavigableOnly: false,
        requireEditPermissions: false,
        ancestors: [],
        createdBy: [],
        editedBy: [],
        lastEditedTime: {},
        createdTime: {},
      },
      sort: "Relevance",
      source: "quick_find",
    },
    {
      headers: {
        "Content-Type": "application/json",
        "accept-language": "en-US,en;q=0.9,vi-VN;q=0.8,vi;q=0.7",
        cookie: `token_v2=${token}; `,
      },
    }
  );

  let data: NotionSearchResult[] = result.data.results;
  let tagname: string | null = null;

  if (data.length > 0) {
    let matches = data[0].highlight.text.match(/<(.*?)>/);
    tagname = matches ? matches[1] : null;
  }

  if (tagname) {
    const tagOpenPatt = RegExp(`<${tagname}>`, "g");
    const tagClosePatt = RegExp(`<\/${tagname}>`, "g");
    data = data.map((i) => {
      return {
        ...i,
        highlight: {
          text: i.highlight.text
            ? i.highlight.text
                .replace(tagOpenPatt, "")
                .replace(tagClosePatt, "")
            : "",
          pathText: i.highlight.pathText
            ? i.highlight.pathText
                .replace(tagOpenPatt, "")
                .replace(tagClosePatt, "")
            : "",
        },
      };
    });
  }

  res.send({ data, total: result.data.total });
});

app.listen(Number(PORT), "0.0.0.0", () => {
  console.info("server started on port %s", PORT);
});
