import { inject } from '@angular/core';
import { addMinutes, delegated } from '@flight-demo/shared/core';
import { mapResponse } from '@ngrx/operators';
import { signalStore, type, withComputed, withMethods, withProps, withState } from '@ngrx/signals';
import { entityConfig, removeAllEntities, setAllEntities, updateEntity, withEntities } from '@ngrx/signals/entities';
import { Events, injectDispatch, on, withEffects, withReducer } from '@ngrx/signals/events';
import { switchMap } from 'rxjs';
import { FlightService } from '../data-access/flight.service';
import { Flight } from '../model/flight';
import { FlightFilter } from '../model/flight-filter';
import { flightEvents } from './flight.events';


export interface BookingState {
  filter: FlightFilter;
  basket: Record<number, boolean>;
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
  }
};

export const flightConfig = entityConfig({
  entity: type<Flight>(),
  collection: 'flight',
  // selectId: flight => flight.id
});


export const BookingStore = signalStore(
  // DI Config
  { providedIn: 'root' },
  // State
  withState(initialBookingState),
  withEntities(flightConfig),
  withComputed(store => ({
    delayedFlights: () => store.flightEntities().filter(flight => flight.delayed),
  })),
  withProps(() => ({
    _events: inject(Events),
    _flightService: inject(FlightService),
    _flightDispatch: injectDispatch(flightEvents),
  })),
  // Updaters
  withReducer(
    on(flightEvents.filterChanged, ({ payload: filter }) => ({ filter })),
    on(flightEvents.flightsChanged, ({ payload: flights }) =>
      setAllEntities(flights, flightConfig)
    ),
    on(flightEvents.flightDelayTriggered, ({ payload: { id, min }}) =>
      updateEntity({ id, changes:
        flight => ({ ...flight, date: addMinutes(flight.date, min || 5) })
      }, flightConfig)
    ),
    on(flightEvents.flightSelectionChanged, ({ payload: { id, selected }}, state) => ({
      basket: { ...state.basket, [id]: selected }
    })),
    on(flightEvents.flightsResetTriggered, () => removeAllEntities(flightConfig)),
  ),
  // Writable Facade
  withMethods(store => ({
    writableFilter: delegated(
      store.filter,
      store._flightDispatch.filterChanged
    ),
    createFlightWithDelayUpdater: (flight: Flight) => delegated(
      () => flight,
      () => store._flightDispatch.flightDelayTriggered({
        id: flight.id
      })
    ),
    createBasketSelection: (flight: Flight) => delegated(
      () => store.basket()[flight.id],
      selected => store._flightDispatch.flightSelectionChanged(
        { id: flight.id, selected }
      )
    ),
  })),
  // Side-Effects
  withEffects(({
    _events: events,
    _flightService: flightService
  }) => ({
    loadFlights$: events
      .on(flightEvents.filterChanged).pipe(
        switchMap(({ payload: filter }) => flightService.find(
          filter.from, filter.to, filter.urgent
        ).pipe(
          mapResponse({
            next: flights => flightEvents.flightsChanged(flights),
            error: err => flightEvents.flightsLoadedError({ error: err })
          })
      ))
    ),
  })),
);