# Cron Job Setup
```js
// This Belongs in your Cron File
// Execute it using
crontab -e
// You will be prompted to select an editor
// Select one that you are comfortable with
 ```

## Delete Expiried Sessions
*Append* this to the **bottom** of your ***cron*** file. To *access* your cron file look **above**. 
#### First Run This Command
```sh
npx tsc ./pruneSession.ts
```
```sh
0 0 * * * /YOUR_PATH_TO_CRON_DIR/pruneSession.js
```


