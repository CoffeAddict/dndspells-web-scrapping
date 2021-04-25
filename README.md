# DND Spells Web Scrapping

This Node.js code gets data from multiple webpages and prints a HTML File with data

Webpages used:

- DND Beyond
- DND 5e (wikidot)

## Setting Up

```bash
npm i
```

## Functionality

The steps for this process for this are the following:

1. Set the Query String (form DND Beyond, here you can apply as many filters you want)
2. Create the progress bar instance
3. Get the scrapped html from DND Beyond, for the Spells name
4. Get the Spells details from DND 5e (wikidot)*
5. Create the HTML content and save it in a file

*this step is needed and done in another page because this content is paid in the first page, and in the other is not filterable.

## Running The Program

```
node main
```

## Future Features

- Select filters directly from console
- Progress bar for both processes
- Select if want to directly save to pdf
- Create Spellbook for certain classes