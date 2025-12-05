import { eventGroup } from '@ngrx/signals/events';
import { FlightFilter } from '../model/flight-filter';
import { type } from '@ngrx/signals';
import { Flight } from '../model/flight';


export const flightEvents = eventGroup({
  source: 'flight',
  events: {
    filterChanged: type<FlightFilter>(),
    flightsChanged: type<Flight[]>(),
    flightsLoadedError: type<{ error: unknown }>(),
    flightDelayTriggered: type<{ id: number; min?: number; }>(),
    flightSelectionChanged: type<{ id: number; selected: boolean; }>(),
    flightsResetTriggered: type<void>(),
  }
});
