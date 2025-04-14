# Pol Air Status
 Discord bot that tracks the use of Pol Air in Apollo Networks or other use cases based on input via the bot.

 The program was initally designed for use in Apollo Networks (FiveM) how ever could be easily adapted to different use cases.

## How to Initialise Bot
 1. /init_embed
    - In the discord channel you would like to have the main embed run.
 3. /set_log_channel
    - In the channel you would like the log message to go to run.

## Other Commands
 - /force_refuel
   - Forces embed in and out of refuel mode reguardless of current status

> [!WARNING]
> If you restart the bot you will have to set it up again in discord!

## Develpment notes
 Ignore failed checks from the cloudflare worker, forgot to delete it after i worked out it didn't support discord.js.
