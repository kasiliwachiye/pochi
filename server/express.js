import express from "express";
import path from "path";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compress from "compression";
import cors from "cors";
import helmet from "helmet";
import Template from "./../template";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import expenseRoutes from "./routes/expense.routes";

// modules for server side rendering
import React from "react";
import ReactDOMServer from "react-dom/server";
import { CacheProvider } from "@emotion/react";
import createEmotionServer from "@emotion/server/create-instance";
import { StaticRouter } from "react-router-dom";
import createCache from "@emotion/cache";

import MainRouter from "./../client/MainRouter";
import theme from "./../client/theme";
import { ThemeProvider } from "@mui/material/styles";

//comment out before building for production
// import devBundle from './devBundle'

const CURRENT_WORKING_DIR = process.cwd();
const app = express();

//comment out before building for production
// devBundle.compile(app)

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compress());
// secure apps by setting various HTTP headers
app.use(helmet());
// enable CORS - Cross Origin Resource Sharing
app.use(cors());

app.use("/dist", express.static(path.join(CURRENT_WORKING_DIR, "dist")));

// mount routes
app.use("/", userRoutes);
app.use("/", authRoutes);
app.use("/", expenseRoutes);

app.get("*", (req, res) => {
  const cache = createCache({ key: "css", prepend: true });
  const { extractCriticalToChunks, constructStyleTagsFromChunks } =
    createEmotionServer(cache);

  const context = {};
  const markup = ReactDOMServer.renderToString(
    <CacheProvider value={cache}>
      <StaticRouter location={req.url} context={context}>
        <ThemeProvider theme={theme}>
          <MainRouter />
        </ThemeProvider>
      </StaticRouter>
    </CacheProvider>
  );

  const emotionChunks = extractCriticalToChunks(markup);
  const css = constructStyleTagsFromChunks(emotionChunks);

  if (context.url) {
    return res.redirect(303, context.url);
  }

  res.status(200).send(
    Template({
      markup: markup,
      css: css,
    })
  );
});

// Catch unauthorised errors
app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ error: err.name + ": " + err.message });
  } else if (err) {
    res.status(400).json({ error: err.name + ": " + err.message });
    console.log(err);
  }
});

export default app;
