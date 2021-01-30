# Yogscast YouTube Statistics

## Explanation
An interactive webpage for exploring the YouTube statistics for the <a href="https://www.youtube.com/channel/UCH-_hzb2ILSCo9ftVSnrCIQ">Yogscast channel</a>. Includes all videos from 2020.

## Live Version

https://robson.plus/yogscast-youtube-statistics/

## Files

### Everything in the GetYouTubeChannelStatistics folder
This is the C# code that connects to the <a href="https://developers.google.com/youtube/v3/getting-started">YouTube API v3</a>, gets the list of videos and then gets the metadata for those videos. It then writes that out to data.json.

If you use this code you will need to create a *key.txt* file, with your own YouTube API key. Put that in the same folder as program.cs, then add it to the Visual Studio project.

### data.json
All of the video data.

### index.html + style.css
The files for the interactive webpage.

## Technologies

This is built using:
 * C#
 * HTML
 * CSS
 * JavaScript
   * <a href="https://github.com/d3/d3">D3.js</a>

<a href="https://validator.w3.org/nu/?doc=https%3A%2F%2Frobson.plus%2Fyogscast-youtube-statistics%2F"><img src="https://www.w3.org/Icons/valid-html401-blue" alt="Valid HTML" /></a>
<a href="http://jigsaw.w3.org/css-validator/validator?uri=https%3A%2F%2Frobson.plus%2Fyogscast-youtube-statistics%2Fstyle.css&profile=css3svg&usermedium=all&warning=1"><img src="https://jigsaw.w3.org/css-validator/images/vcss-blue" alt="Valid CSS" /></a>   