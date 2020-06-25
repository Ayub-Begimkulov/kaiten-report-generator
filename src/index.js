const express = require("express");
const axios = require("axios");
const {
  getTodayFromMidnight,
  compose,
  filterReducer,
  mapReducer,
} = require("./utils");

require("dotenv").config();

const app = express();

const columnsMap = {
  Review: true,
  testing: true,
  "TEST: In progress": true,
  Done: true,
  "On Deploy": true,
  "TEST: PROD": true,
};

app.get("/api/v1/report", async (req, res) => {
  try {
    const { data } = await axios.get(`${process.env.BASE_URL}/api/v1/cards`, {
      headers: { Authorization: `Bearer ${process.env.AUTH_KEY}` },
      params: {
        space_id: process.env.SPACE_ID,
        limit: 1000000,
        condition: 1,
      },
    });
    const today = getTodayFromMidnight();
    const predicate = card => {
      if (typeof card === "object" && card !== null) {
        const date = new Date(card.last_moved_at);
        const validDate = date >= today;
        const { parent, title } = card.column || {};
        const validColumn =
          columnsMap[title] || (parent && columnsMap[parent.title]);
        return validColumn && validDate;
      }
      return false;
    };
    let index = 0;
    const mapper = card => {
      if (card && card.column && card.title) {
        const { title } = card;
        const column = card.column;
        let columnTitle = column && column.title;
        if (
          columnTitle === "Doing" &&
          column.parent &&
          column.parent.title === "testing"
        ) {
          columnTitle = "testing";
        }
        if (typeof columnTitle === "string" && typeof title === "string") {
          index++;
          return `${index}. ${title} - ${columnTitle}\n`;
        }
        return "";
      }
      return "";
    };

    const stringCombiner = (acc, c) => {
      acc += c;
      return acc;
    };

    const transducer = compose(
      filterReducer(predicate),
      mapReducer(mapper)
    )(stringCombiner);

    const todayCards = data.reduce(transducer, "");

    res.status(200).send(todayCards);
  } catch (e) {
    console.error(e);
    res.status(500).send("error");
  }
});

app.listen(3000, () => {
  console.log("===================================");
  console.log("app is listening on port 3000");
  console.log("===================================");
});
