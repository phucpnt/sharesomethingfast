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

app.post("/search", async (req, res) => {
  const { token, query } = req.body;

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

  res.send({ data, total: result.data.total });
});

app.listen(Number(PORT), "0.0.0.0", () => {
  console.info("server started on port %s", PORT);
});
