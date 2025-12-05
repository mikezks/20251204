import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Flight } from '../model/flight';
import { FlightFilter } from '../model/flight-filter';
import { pipe, switchMap } from 'rxjs';
import { inject } from '@angular/core';
import { FlightService } from '../data-access/flight.service';
import { addMinutes } from '@flight-demo/shared/core';


export interface BookingState {
  filter: FlightFilter;
  basket: Record<number, boolean>;
  flights: Flight[];
}

export const initialBookingState: BookingState = {
  filter: {
    from: 'Paris',
    to: 'New York',
    urgent: false
  },
  basket: {
    3: true,
    5: true,
  },
  flights: []
};

const entityState = {
  entities: {
    3: {
      id: 3,
      from: 'Hamburg',
      to: 'Graz',
      date: new Date().toISOString(),
      delayed: false
    },
    4: {
      id: 4,
      from: 'Hamburg',
      to: 'Graz',
      date: new Date().toISOString(),
      delayed: false
    },
    1: {
      id: 1,
      from: 'Hamburg',
      to: 'Graz',
      date: new Date().toISOString(),
      delayed: false
    }
  } as Record<number, Flight>,
  ids: [3, 4, 1]
}

const flights = entityState.ids.map(id => entityState.entities[id]);
console.log(flights);


export const BookingStore = signalStore(
  // DI Config
  { providedIn: 'root' },
  // State
  withState(initialBookingState),
  withComputed(store => ({
    delayedFlights: () => store.flights().filter(flight => flight.delayed),
  })),
  withProps(() => ({
    _flightService: inject(FlightService)
  })),
  // Updaters
  withMethods(store => ({
    setFilter: (filter: FlightFilter) => patchState(store, { filter }),
    setFlights: (flights: Flight[]) => patchState(store, { flights }),
    updateBasket: (id: number, selected: boolean) => patchState(store, state => ({
      basket: {
        ...state.basket,
        [id]: selected
      }
    })),
    delayFlight: (id: number, addMin = 5) => patchState(store, state => ({
      flights: state.flights.map(
        flight => flight.id === id ? {
          ...flight,
          date: addMinutes(flight.date, addMin)
        } : flight
      )
    })),
    resetFlights: () => patchState(store, { flights: [] })
  })),
  // Side-Effects
  withMethods(store => ({
    loadFlights: rxMethod<FlightFilter>(pipe(
      switchMap(filter => store._flightService.find(
        filter.from, filter.to, filter.urgent
      ).pipe(
        tapResponse({
          next: flights => store.setFlights(flights),
          error: err => console.error(err)
        })
      ))
    )),
  })),
  // Lifecycle Hook
  withHooks(store => ({
    onInit: () => store.loadFlights(store.filter),
  }))
);