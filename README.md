# YouTube Mixtape

*A web radio app using Spotify to generate a list of similar artists, and YouTube to find and play their songs.*

### Deployed [here](https://youtube-mixtape.herokuapp.com) on Heroku for demonstration purposes.
Note that it takes a moment for Heroku's services to initially activate.

---

### Detailed description
The app first uses Spotify's API to validate your search as a known artist. Immediately after this validation, the app uses YouTube's API to search for a short, music category video result, and begins playing.

Now that music is playing, the app continues to make calls to Spotify's API with a *search algorithm to generate a list of similar artists based on one or more common genres. Currently, the results are presented by the number of common genres. *Find this code in ````'./views/js/searchSpotify.js'````

As each video finishes playing, the app advances to the next artist result, and retrieves a new video result from YouTube.

The app also offers the ability to create/view/edit a YouTube playlist. Get started with this feature by clicking *+ Add to Mixtape*. Note that to save your playlist, you will be required to sign into your Google account.

### Other features
* Drag and drop artist results to change mix order. (Not yet supported for touch devices.)
* Remove a specific artist result with the *X* button.
* Directly clicking an artist result will trigger a YouTube search and begin playing a resulting video.
* Show/hide video player.
* Select the *Lock artist* button to keep listening to videos from the same artist.
* The app keeps track of your listen history and avoids replaying the same song in a given session.
* Quietly retrieves an access token to Spotify's API via a back-end Node/Express server. (From a UX perspective, I feel this is better than requiring users to sign-in to their Spotify accounts just to try out the app.)
* Responsive design.

---
### Desktop
![homepage screenshot](./screenshots/homePage6_2_17.png)



---
### Mobile
Although it's not yet optimized for mobile use, the responsive design allows for decent usability.

![android mobile screenshot](./screenshots/android6_2_17.jpg)

### To install locally
1. Clone this repo    
2. ````cd YouTube-Mixtape````             
3. ````npm i```` to install dependencies    
4. ````npm run start```` to get things going on localhost:3000