import fs from 'node:fs/promises';
import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
  name: string;
  country: string;
  state: string;
}


// TODO: Define a class for the Weather object
class Weather {
  temp: number;
  wind_speed: number;
  humidity: number;

  constructor(temp: number, wind_speed: number,  humidity: number) {
    this.temp = temp;
    this.wind_speed = wind_speed;
    this.humidity = humidity;

  }

}


// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL?: string;
  private apiKey?: string;
  cityName: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.API_KEY || '';
    this.cityName = '';
  }
  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string) {
    try{
      const response = await fetch(query);
      const cities = await response.json();
      return cities;
    } catch (err) {
      console.log('Error:', err);
      return err;
    }
  }
  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates): Coordinates {
    let { lat , lon, name, country, state } = locationData;
    return {lat, lon, name, country, state};

  }
  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    const query = `${this.baseURL}/geo/1.0/direct?q=${this.cityName}&appid=${this.apiKey}`
    return query;
  }
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    const query = `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}`;
    return query;
  }
  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData() {
    let locationData = await this.fetchLocationData(this.buildGeocodeQuery());
    return this.destructureLocationData(locationData);
  }
  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    try{
      const response = await fetch(this.buildWeatherQuery(coordinates));
      const weather = await response.json();
      return weather;
    } catch (err) {
      console.log('Error:', err);
      return err;
    }
  }
  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any) {
    let weather = response;
    let currentWeather = {temp: weather.list.main.temp, wind_speed: weather.list.wind.speed, humidity: weather.list.main.humidity};
    return currentWeather;
  }
  // TODO: Complete buildForecastArray method
  // private buildForecastArray(currentWeather: Weather, weatherData: any[]) {}
  // TODO: Complete getWeatherForCity method
  // async getWeatherForCity(city: string) {}
}

export default new WeatherService();
