import { httpResource } from '@angular/common/http';
import { Component, input, numberAttribute, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { form, Field } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { initialPassenger, Passenger } from '../../logic-passenger/model/passenger';


@Component({
  selector: 'app-passenger-edit',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    Field
],
  templateUrl: './passenger-edit.component.html'
})
export class PassengerEditComponent {
  protected readonly passenger = signal(initialPassenger);
  protected editForm = form(this.passenger);

  readonly id = input(0, { transform: numberAttribute });
  protected readonly passengerResource = httpResource<Passenger>(
    () => `https://demo.angulararchitects.io/api/passenger?id=${ this.id() }`,
    { defaultValue: initialPassenger }
  );

  constructor() {
    /* effect(() => {
      if (this.passengerResource.hasValue()) {
        this.editForm.patchValue(this.passengerResource.value());
      }
    }); */
  }

  protected save(): void {
    // this.passengerResource.set(this.editForm.getRawValue());
    // console.log(this.passengerResource.value());
    console.log(
      this.editForm().value(),
      this.passenger()
    );
  }
}
