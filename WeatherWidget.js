/**
 * WeatherWidget.js
 * Simple Weather Widget script to load Weather on National Trust website.
 *
 * @license Public
 * @version 0.1
 * @author  Danny Hickinbottom
 * @updated 2024-07-17
 */

// Get Latitude and Longitude from the __NEXT_DATA__ 
const weatherWidget_getLatLon = () => {
    try {
        return __NEXT_DATA__.props.pageProps.appContext.place.data.location.latitudeLongitude
    } catch(err) {
        console.error("Cannot get lat and long on this page")
        return null
    }
}

// Using the Latitude and Longitude fetch weather data from api, referencing 'open weather map' for icons
const weatherWidget_getWeather = (lat, lon) => {
    const url = `https://europe-west1-amigo-actions.cloudfunctions.net/recruitment-mock-weather-endpoint/forecast?appid=a2ef86c41a&lat=${lat}&lon=${lon}`

    return fetch(url).then((res) => res.json()).then((data) => {
        console.log('DATA', data)

        const currentWeather = data.list[0]
        const iconCode = currentWeather.weather[0].icon

        return {
            date: new Date(currentWeather.dt * 1000),
            temp: currentWeather.main.temp.toFixed(1),
            icon: `https://openweathermap.org/img/wn/${iconCode}@2x.png`,
            description: currentWeather.weather[0].main,
        }
    })
}

// Build HTML structure string with inline styling
const weatherWidget_buildWidgetHTML = ({ date, temp, icon, description }) => {
    return `
    <h3>Current Weather</h3>
    <div id="weather-widget">
        <div id="weather-widget-details">
            <img id="weather-widget-icon" src="${icon}">
            <span id="weather-widget-description">${description}</span>
        </div>
        <div>
            <span id="weather-widget-temp">${temp}</span>
        </div>
    </div>
    <style>
        #weather-widget {
            display: flex;
            width: 380px;
            background: #efefef;
            align-items: center;
        }

        #weather-widget div {
            width: 50%;
            padding: 15px;
        }

        #weather-widget-details {
            text-align: center;
        }

        #weather-widget span {
            display: block;
        }

        #weather-widget-temp {
            font-size: 4em;
            color: #4d4d4d;
            text-align: center;
        }

        #weather-widget-description {
            color: #4d4d4d;
            font-weight: bolder;
        }

        #weather-widget-icon {
            background: white;
            border-radius: 50%;
            margin: 10px;
        }

        #weather-widget-temp::after {
            content: '°c';
            font-size: 0.5em;
        }

        
    </style>
    `
}

// Insert Weather Widget into DOM
const weatherWidget_insertWidget = async () => {
    // Get location from body
    const location = weatherWidget_getLatLon()

    // Get the weather for that location
    const weather = await weatherWidget_getWeather(location.latitude, location.longitude)
    console.log(weather)


    const insertEl = document.querySelector('div[data-testid="place-summary-links"]')
    const widget = document.createElement('div')
    widget.id = 'weather-widget-wrapper'

    widget.innerHTML = weatherWidget_buildWidgetHTML(weather)

    // Insert after insert element
    insertEl.parentElement.append(widget)
}

// Send data to analytics for A/B testing
const weatherWidget_recordToAnalytics = (bucket) => {
    // @TODO: Dummy function, fill when analytics api known...
    console.debug(`User in bucket: ${bucket}`)
}

// Evaluate whether to run weather app in source code
const weatherWidget_main = () => {
    const random = Math.random()
    const bucket = (random <= 0.5) ? 'test' : 'control'

    weatherWidget_recordToAnalytics(bucket)

    if (bucket === 'test') {
        weatherWidget_insertWidget()
    }
}

weatherWidget_main()