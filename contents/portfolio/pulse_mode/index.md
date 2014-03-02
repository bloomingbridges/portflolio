---
title: Pulse Mode by Stavros Didakis
date: 2013
category: installation, ui
colour: "rgb(0,38,45)"
slug: pulse_mode
description: "Network architecture and UI design for <em>Stavros Didakis</em>'s participatory audiovisual installation at <strong>Code Control Festival 2013</strong> in Leicester."
---

__Pulse Mode__ is an audio-visual installation by my former study supervisor _Stavor Didakis_ and was on display at __Code Control Festival 2013__ in Leicester. It requires a room to be put in and is made up of several components:

- Dynamic visuals, projected onto wall-mounted shards
- A continuous stream of music of several genres (A pc running _Ableton Live_)
- A web-based voting mechanism to affect the style of music being played on location
- A tablet showing playback information, plus the latest poll results
- A _Neurosky MindWave_ headset with monitor, that allows visitors to compete against the web participants
- Yet another machine running a _NodeJS_ server, managing the communication between the web voters, _Ableton Live_ and tablets (via _OSC_)

![Interface](pulse_mode_closeup.jpg)
<p class="caption">&copy; Pamela Raith</p>

<!-- ![Setup](pulse_mode_setup.jpg) -->

I assisted the development of _Pulse Mode_ by writing the server- and client-side code required for the voting mechanism (_WebSockets_, _HTML5_), as well as the local server communicating with various parts of the installation and the monitor client (_SVG_). Sadly I couldn't attend the festival in person, but from what I've read it seemed to have been a success.

![Web Voting Interface](voting_interface.png)
![Tablet Monitor](monitor.png)

<p class="caption">Screenshots from back when the project was running under the codename DAVE</p>