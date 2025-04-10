# How to Run the Legendary Snake Game Project

This is a Next.js project built with React, TypeScript, and Tailwind CSS. Here's how to get it up and running on your local machine:
Prerequisites
# LIVE DEMO LINK
https://vsnakegame.vercel.app/
note left keyboard button not working but on screen works.

# Make sure you have the following installed:

    Node.js

(version 16.8 or later)
npm (comes with Node.js) or yarn
#Step 1: Set Up the Project

First, create a new directory for your project and download or copy all the files from our conversation into the appropriate folder structure.
mkdir legendary-snake-game
cd legendary-snake-game
#Step 2: Install Dependencies

Install all the required dependencies:
npm install
# or
yarn install

#This will install all necessary packages including:

    Next.js
    React
    Framer Motion
    Tailwind CSS
    shadcn/ui components
    Lucide React icons

#Step 3: Start the Development Server

Run the development server:
npm run dev
# or
yarn dev

This will start the development server, typically on port 3000.
#Step 4: Open the Game in Your Browser

Open your browser and navigate to:
http://localhost:3000

#You should now see the Legendary Snake Game menu screen and be able to play the game!
Game Controls

    Arrow keys or on-screen buttons to move the snake
    P key or Pause button to pause/resume the game
    M key or Menu button to return to the main menu
    F key to toggle fullscreen mode
    S key to toggle sound effects

#Project Structure

The main components of the game are:

    app/page.tsx - Main entry point
    components/game-screen.tsx - The actual game canvas and logic
    components/menu-screen.tsx - Main menu
    components/settings-screen.tsx - Settings page
    components/about-screen.tsx - About page
    context/game-context.tsx - Game state management

#Building for Production

If you want to build the game for production:
npm run build
# or
yarn build
# SCREENSHOTS
![Screenshot 2025-04-08 at 04-00-07 v0](https://github.com/user-attachments/assets/8ffe90b2-6299-4617-9e37-91d4ff9f3dc0)
![Screenshot 2025-04-08 at 14-12-38 v0 App](https://github.com/user-attachments/assets/c9b95f20-00a6-4651-b3a2-3c7dc04728bf)
![Screenshot 2025-04-08 at 14-12-52 v0 App](https://github.com/user-attachments/assets/867e0c82-a960-4b38-b792-239b54e20b52)
![Screenshot 2025-04-08 at 14-15-13 v0 App](https://github.com/user-attachments/assets/c09fb033-6775-45e7-bfad-890ae7ca731a)


#Then you can start the production server:
npm start
# or
yarn start

Enjoy playing your Legendary Snake Game!
