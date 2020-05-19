/*
|---------------------------------------------------------------------
| Firelayer Template Config File
|---------------------------------------------------------------------
*/
module.exports = async function({ chalk, open, logger, prompt, targetDir }) {
  const website = 'https://firelayer.io/templates/chat'

  console.log(`\nTemplate Documentation - ${chalk.bold.green(website)}\n`)

  open(website)
}
