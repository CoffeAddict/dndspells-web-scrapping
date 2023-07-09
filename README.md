# DND Spells Web Scrapping

This Node.js app scraps data from multiple webapps and generates a HTML File with it

Webpages used:

- DND Beyond
- DND 5e (wikidot)

## Setup

```bash
npm ci
```

## How it works

1. Set the Query String (form DND Beyond, here you can apply as many filters you want)
3. Get the scrapped html from DND Beyond, for the Spells name
4. Get the Spells details from DND 5e (wikidot)*
5. Create the HTML content and save it in a file

*this step is required but is done with a second source because this details are hidden behind a paywall on DND Beyond

## Running The Program

```
node main
```

## Future Features

- Select if want to directly save to pdf
- Create Spellbook for certain classes