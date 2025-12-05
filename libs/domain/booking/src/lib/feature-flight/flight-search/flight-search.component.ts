import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Flight } from '@flight-demo/domain/booking-api-boarding';
import { FlightFilter } from '../../logic-flight/model/flight-filter';
import { BookingStore } from '../../logic-flight/state/booking.store';
import { FlightCardComponent } from '../../ui-flight/flight-card/flight-card.component';
import { FlightFilterComponent } from '../../ui-flight/flight-filter/flight-filter.component';


@Component({
  selector: 'app-flight-search',
  imports: [
    CommonModule,
    FormsModule,
    FlightCardComponent,
    FlightFilterComponent
  ],
  templateUrl: './flight-search.component.html',
})
export class FlightSearchComponent {
  private store = inject(BookingStore);

  protected filter = this.store.filter;
  protected basket = this.store.basket;
  protected flights = this.store.flights;

  constructor() {
    effect(() => this.search());
  }

  protected search(): void {
    if (!this.filter.from || !this.filter.to) {
      return;
    }

    this.store.loadFlights(this.filter());
  }

  protected delay(flight: Flight): void {
    const oldFlight = flight;
    const oldDate = new Date(oldFlight.date);

    const newDate = new Date(oldDate.getTime() + 1000 * 60 * 5); // Add 5 min
    const newFlight = {
      ...oldFlight,
      date: newDate.toISOString(),
      delayed: true
    };

    this.store.setFlights(this.flights().map(
      flight => flight.id === newFlight.id ? newFlight : flight
    ));
  }

  protected setFilter(filter: FlightFilter): void {
    this.store.setFilter(filter);
  }

  protected updateBasket(id: number, selected: boolean): void {
    this.store.updateBasket(id, selected);
  }

  protected reset(): void {
    this.store.setFlights([]);
  }
}
