# Inkling

A drawing journal for life's moments. **AI draws the first line. You decide the rest.**

Inkling is the product side of a study on human–AI co-creation for emotional
expression: the AI only offers a way into a drawing, while the participant
decides how it develops, what it means, and when it is "enough".

The whole app is one file, `index.html`, with no build step and no server.
Drawings and notes are saved in the participant's own browser (localStorage).

## The flow

| Step | Screen | Who acts | What happens |
|---|---|---|---|
| 1 | **Moment** | Participant | Picks the kind of life event (a beginning, an ending or loss, a celebration, a change, a hard day, an everyday moment, something else) and can add a one-line note. |
| 2 | **Feeling** | Participant | Picks up to two feelings and their strength (1–5), then chooses **what they want from the drawing**: let it out, make sense of it, hold on to it, celebrate it, or just see what happens. |
| 3 | **Spark** | AI | Offers three starting points. Each is a first mark drawn on the page plus a short prompt. The participant picks one, asks for three others, or starts blank. The AI does nothing after this step. |
| 4 | **Draw** | Participant | Draws freely (pen, wash, eraser, sizes, colours from their feelings). The AI's mark can be hidden or erased. "I'm stuck" shows a reflective question, never a drawing instruction. |
| 5 | **Meaning** | Participant | Titles the drawing, writes what it means, and records how they feel now. |
| 6 | **Enough?** | Participant | Judges the drawing against the goal they set in step 2 (Not yet / A little / Mostly / Fully). "Not yet" offers to keep drawing. Also rates how much the drawing feels like theirs. |

Saved entries appear in the **Journal** with before/after feelings, the
starting prompt and process data (time drawing, strokes, questions asked,
times they went back to draw more).

### Research data

On the Journal screen, **Export notes (JSON)** downloads every entry without
the images: moment, feelings before/after with intensity, goal, satisfaction,
ownership, the prompt used and whether the AI's mark was kept, plus the
process data above. Participants can send this file to the researcher.

## Deploy on Netlify

**Netlify Drop (fastest):** open <https://app.netlify.com/drop> and drag the
`inkling` folder onto the page. You get a public link in a few seconds.

**From GitHub:** in Netlify, *Add new site → Import an existing project*,
pick this repository, set **Base directory** to `inkling`, leave the build
command empty, and deploy. Every push then updates the site.

## Prompts: library now, AI later

Right now the starting prompts come from a built-in library, matched to the
moment and feelings the participant chose. The page says so under the cards.

To switch to prompts written by an AI model, add a Netlify Function at
`/api/spark` that returns `{"sparks": [{"mark": "<mark id>", "text": "<prompt>"}, …]}`
(three items, mark ids listed in `MARK_IDS` inside `index.html`), then set
`AI_ENDPOINT = "/api/spark"` in `index.html`. If the function fails or is
slow, the page falls back to the library on its own.
