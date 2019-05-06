export const SENNA_ALERT_TYPES = {
  'SUCCESS': 'success',
  'ERROR': 'error'
};

export function SennaAlertTypesAware(constructor: Function) {
  constructor.prototype.SENNA_ALERT_TYPES = SENNA_ALERT_TYPES;
}
