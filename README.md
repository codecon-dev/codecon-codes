# :robot: Codecon Codes

![Repo status](https://www.repostatus.org/badges/latest/active.svg)
![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)
[![Build Status](https://github.com/codecon-dev/codecon-codes/actions/workflows/main.yml/badge.svg)](https://github.com/codecon-dev/codecon-codes/actions/workflows/main.yml)
[![https://img.shields.io/badge/made%20with-discordjs-blue](https://img.shields.io/badge/made%20with-discordjs-blue)](https://discord.js.org/)

This is a Discord Bot that helps to manage the gamification feature for the CodeCon's Event.  

## Commands

### 🔶 `.about`

Find more about this bot  

### 🔶 `.help`

Get help for some commands

### 🔶 `.rank`

Get the top 10 users in the rank and their scores

### 🔶 `.me`

Get your rank position and score

### 🔶 `.claim` _(DM only)_

Claim a token by providing its code  
Example: `.claim CODECON21`  

### 🔶 `.token get` _(admins only)_

Check the details from a given token.  
Example: `.token get CODECON21`

### 🔶 `.token create` _(admins only)_

Create a new token by answering some questions  

### 🔶 `.token update` _(admins only)_

Update an existing token by answering some questions  

### 🔶 `.token list` _(admins only)_

List all tokens  

### 🔶 `.user` _(admins only)_

Get information about a user by Discord ID

## Develop

* Clone this repository and install dependencies with `npm install`
* Copy `.env.example` and rename it to `.env`
* Put the credentials needed
* Run `npm run test` or `npm run test -- --watch` while developing
* Run `npm start` to run this bot locally
