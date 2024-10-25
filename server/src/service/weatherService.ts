import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state: string;
}


// TODO: Define a class for the Weather object
class Weather {
  temp: number;
  wind_speed: number;
  humidity: number;
  icon: string;
  dt_txt: string;

  constructor(temp: number, wind_speed: number,  humidity: number, icon: string, dt_txt: string) {
    this.temp = temp;
    this.wind_speed = wind_speed;
    this.humidity = humidity;
    this.icon = icon;
    this.dt_txt = dt_txt;

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
      let geoCode = await response.json();
      return geoCode;
    } catch (err) {
      console.log('Error:', err);
      return err;
    }
  }
  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates[]): Coordinates {
    let { name, lat, lon, country, state } = locationData[0];
    let coordinates: Coordinates = { name, lat, lon, country, state };
    return coordinates;

  }
  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    const query = `${this.baseURL}/geo/1.0/direct?q=${this.cityName}&limit=1&appid=${this.apiKey}`
    return query;
  }
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    const query = `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&limit=5&units=imperial&appid=${this.apiKey}`;
    return query;
  }
  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData() {
    let locationData = await this.fetchLocationData(this.buildGeocodeQuery()) as Coordinates[];
    let destructData = this.destructureLocationData(locationData);
    return destructData; 
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
    let currentWeather = new Weather (
      response.main.temp, 
      response.wind.speed, 
      response.main.humidity,
      response.weather[0].icon, 
      response.dt_txt);
    return currentWeather;
  }
  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
      const forecastArray = [];
      weatherData.forEach (data => {
        const forecast = {
          temp: data.main.temp, 
          wind_speed: data.wind.speed, 
          humidity: data.main.humidity,
          icon: data.weather[0].icon, 
          dt_txt: data.dt_txt
        };
        forecastArray.push(forecast);
      }
      )
      if (currentWeather) {
        forecastArray.unshift(currentWeather); // Add current weather at the beginning
    }
      return forecastArray;
    }
  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string): Promise<any> {
    this.cityName = city;
    try {
      let coordinates = await this.fetchAndDestructureLocationData();
      let response = await this.fetchWeatherData(coordinates);
      let currentWeather = this.parseCurrentWeather(response.list[0]);
      let weatherData = response.list;
      let forecast = this.buildForecastArray(currentWeather, weatherData);
      return forecast;
    } catch (err) {
      console.log('Error:', err);
      return err;
    }
  }
}

export default new WeatherService();
