import { httpResource } from '@angular/common/http';
import { Component, computed, input, numberAttribute } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { createMetadataKey, Field, form, metadata, required, schema, SchemaPath, validate } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { initialPassenger, Passenger } from '../../logic-passenger/model/passenger';


// Custom Field Property
const ALLOWED_FIRSTNAMES = createMetadataKey<string[]>();

// Custom, parameterized Validator
export function validateFirstname(
  firstnameField: SchemaPath<string>,
  validFirstnames: string[]
): void {
  metadata(firstnameField, ALLOWED_FIRSTNAMES, () => validFirstnames);
  validate(firstnameField, ({ value }) =>
    validFirstnames.includes(value())
      ? null
      : {
        kind: 'forbiddenFirstname',
        message: 'The entered firstname is not allowed. Please use one of the following: '
          + validFirstnames.join(', ')
      }
  );
}

export const passengerSchema = schema<Passenger>(passengerPath => {
  required(passengerPath.name, {
    message: 'This field is mandatory, please enter a value.',
    when: ({ value, valueOf }) => value() !== valueOf(passengerPath.firstName)
  });
  validateFirstname(passengerPath.firstName, [
    'Hanna', 'Emma', 'Sofia'
  ]);
});


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
  readonly id = input(0, { transform: numberAttribute });
  protected readonly passengerResource = httpResource<Passenger>(
    () => `https://demo.angulararchitects.io/api/passenger?id=${ this.id() }`,
    { defaultValue: initialPassenger }
  );
  protected editForm = form(this.passengerResource.value, passengerSchema);
  allowedFirstnames = computed(() =>
    this.editForm.firstName().metadata(ALLOWED_FIRSTNAMES)?.join(', ')
  );

  protected save(): void {
    console.log(
      this.editForm().value(),
      this.passengerResource.value(),
      this.editForm.id().value()
    );
  }
}
