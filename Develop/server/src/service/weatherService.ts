import dayjs from 'dayjs'
import dotenv from 'dotenv';

dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}
// TODO: Define a class for the Weather object
class Weather {
  city: string;
  date: string;
  icon: string;
  tempF: number;
  windSpeed: number;
  humidity: number;
  iconDescription: string;

constructor (city: string, date: string, icon: string, tempF: number, windSpeed: number, humidity: number, iconDescription: string) {
  this.city = city;
  this.date = date;
  this.icon = icon;
  this.tempF = tempF;
  this.windSpeed = windSpeed;
  this.humidity = humidity;
  this.iconDescription = iconDescription;
}
}
// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
private baseURL: string;
private apiKey: string;
private cityName: string;

constructor () {
  this.baseURL = process.env.API_BASE_URL || '';
  this.apiKey = process.env.API_KEY || '';
  this.cityName = '';

}

  // TODO: Create fetchLocationData method
private async fetchLocationData(query: string) {
  try {
    if (!this.baseURL || !this.apiKey) {
      throw new Error("Key or base URL not found")
    }
    
    const response: Coordinates[] = await fetch(query).then((res) =>
      res.json()
    );
    return response[0];
  } catch (error) {
    console.error(error);
    throw error;
  }
}
  // TODO: Create destructureLocationData method
private destructureLocationData(locationData: Coordinates): Coordinates {
  if (!locationData) {
    throw new Error("Please enter a location")
  }
  const {lat, lon} = locationData;
  const coordinates: Coordinates = {
    lat,
    lon
  }
  return coordinates;
}
  // TODO: Create buildGeocodeQuery method
private buildGeocodeQuery(): string {
  const geoQuery = `${this.baseURL}/geo/1.0/direct?q=${this.cityName}&appid=${this.apiKey}`
  return geoQuery;
}
  // TODO: Create buildWeatherQuery method
private buildWeatherQuery(coordinates: Coordinates): string {
  const weatherQuery = `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&units=imperial&appid=${this.apiKey}`;
    return weatherQuery;
}
  // TODO: Create fetchAndDestructureLocationData method
private async fetchAndDestructureLocationData() {
  return await this.fetchLocationData(this.buildGeocodeQuery()).then((data) =>
    this.destructureLocationData(data)
);
   
}
  // TODO: Create fetchWeatherData method
private async fetchWeatherData(coordinates: Coordinates) {
  try {
    const response = await fetch(this.buildWeatherQuery(coordinates)).then (
      (res) => res.json()
    );
    if (!response) {
      throw new Error(`Failed to fetch weather data`);
    }

    const currentWeather: Weather = this.parseCurrentWeather(
      response.list[0]
    );

    const forecast: Weather[] = this.buildForecastArray(
      currentWeather,
      response.list
    );

    return forecast;
  } catch (error: any) {
    console.error(error);
    return error;
  }
}
  // TODO: Build parseCurrentWeather method
private parseCurrentWeather(response: any): Weather {
  const parsedDate = dayjs.unix(response.dt).format('M/D/YYYY');
  
  const currentWeather = new Weather(
    this.cityName,
    parsedDate,
    response.weather[0].icon,
    response.main.temp,
    response.wind.speed,
    response.main.humidity,
    response.weather[0].description || response.weather[0].main    
  );
  return currentWeather;
}
  // TODO: Complete buildForecastArray method
private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
  const weatherForecast: Weather[] = [currentWeather];
  const filteredWeatherData = weatherData.filter((data: any) => {
    return data.dt_txt.includes('12:00:00');
  });
  for (const day of filteredWeatherData) {
    weatherForecast.push(
      new Weather(
        this.cityName,
        dayjs.unix(day.dt).format('M/D/YYYY'),
        day.weather[0].icon,
        day.main.temp,
        day.wind.speed,
        day.main.humidity,
        day.weather[0].description || day.weather[0].main
      )
    )
  }
  return weatherForecast;
}
  // TODO: Complete getWeatherForCity method
async getWeatherForCity(city: string) {
  try {
    this.cityName = city;
    const coordinates = await this.fetchAndDestructureLocationData();
    if (coordinates) {
      const weather = await this.fetchWeatherData(coordinates);
      return weather;
    }
    throw Error('Weather data not found');
  } catch (error: any) {
    console.error(error);
    throw error;
}
}
}
export default new WeatherService();
