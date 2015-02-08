# Hack Housing Hackathon: OmniScore

This application was developed on February 8th, 2015 for the Hack Housing Hackathon.

![Isn't our app beautiful?!](screenshot.jpg)

You can also check out [this demo screencast](https://www.youtube.com/watch?v=dQw4w9WgXcQ) of our application on YouTube.

## Challenge and Approach

Our submission is to give access to personalized information (work travel, budget costs, area schools, hospitals, groceries, and safety) across all website domains: everywhere from Zillow and Craigslist to public housing directories and even the HUD API webpages. 

Our approach for satisfying this challenge was to:

- Develop a plugin that fits over all webpages. All it needs is an address. 
- Process the datafeed from 8 different datasets/APIs in real time. 
- Make it seemless and easy as possible. 
- Personalized weighting algorithm. 

## Team Members

Our team is comprised of:

- Aaron Yip - move fast and break things, ahh it wasn't me 
- Sally Huang - umm 

## Technologies, APIs, and Datasets Utilized

We made use of:

- Typical web stack: AWS content host, Javscript/HTML Chrome plugin stuff 
- Loads of API calls: Google Maps API, Google Places API, Google Geocoding API, HUD public housing datasets, GreatSchools API, Socrata's Seattle crime dataset, Zillow's API 

## Contributing

In order to build and run our app:

1. Download to a local directory. 
2. Get on Chrome browser, go to chrome://extensions/ to set up developer mode and "Load unpacked extension..." from that local directory. 
3. Press the plugin button after a webpage has been loaded. 

Our code is licensed under the [MIT License](LICENSE.md). Pull requests will be accepted to this repo, pending review and approval.