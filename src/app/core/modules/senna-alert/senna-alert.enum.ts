export const SENNA_ALERT_TYPES = {
  'SUCCESS': 'alert-success',
  'WARNING': 'alert-warning',
  'ERROR' : 'alert-danger',
};

export function SennaAlertTypesAware(constructor: Function) {
  constructor.prototype.SENNA_ALERT_TYPES = SENNA_ALERT_TYPES;
}
