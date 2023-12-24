import express, { Express, Request, Response } from "express"
import dotenv from "dotenv"
import { SuggestionService } from "./services/suggestions";
import suggestionService from "./services/llm_suggestion";
import { Suggestion } from "./constants";


dotenv.config()


const app: Express = express();
const PORT = process.env.PORT;

/**
  * Add a JSON middleware that intercepts and
  * parses requests that have application/json
  * as their content type.
  * This enables us to get JSON from request.body.
  */
app.use(express.json())

// Add CORS headers so clients can reach us
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOW_ORIGIN!);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get('/', async (req: Request, res: Response) => {
  res.send('Express & Typescript server');
})

app.post('/suggestions', async (req, res) => {
  console.log("Got a request for suggestions", req)
  const lesson = req.body.lesson;
  const numberOfProverbs = 5;
  const excludeSuggestions: Suggestion[] = [];

  const suggestions = await suggestionService.getSuggestions({ lesson, numberOfProverbs, excludeSuggestions })

  const remoteSuggestions = suggestions.map(suggestion => ({
    id: suggestion.id,
    proverb: suggestion.proverb,
    relation: suggestion.relation
  }))

  res.json({ "suggestions": remoteSuggestions });
})

app.listen(PORT, () => {
  console.log(`[server]: Server is running at localhost:${PORT}`)
})
