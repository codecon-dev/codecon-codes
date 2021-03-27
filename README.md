# :robot: Codecon Codes

This is a Discord Bot that helps to manage the gamification feature for the Codecon's Event.  

## Commands

### `.about`

Find more about this bot  

### `.help`

Get help for some commands

### `.claim`

Claim a token by providing its code  
Example: `.claim CODECON21`  

### `.token get` _(admins only)_

Check the details from a given token.  
Example: `.token get CODECON21`

### `.token create` _(admins only)_

Create a new token by answering some questions  

### `.token update` _(admins only)_

Update an existing token by answering some questions  

### `.token list` _(admins only)_

List all tokens  

## Develop

* Clone this repository and install dependencies with `npm install`
* Copy .env.example and rename it to .env
* Put the credentials needed
* Run `npm run test` or `npm run test -- --watch` while developing
* Run `npm start` to run this bot locally
