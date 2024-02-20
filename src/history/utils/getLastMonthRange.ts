import moment from 'moment';

export function getLastMonthRange(): [moment.Moment, moment.Moment] {
  const today = moment();
  const startOfMonth = today.clone().startOf('month').subtract(1, 'months');
  const endOfMonth = startOfMonth.clone().endOf('month');
  return [startOfMonth, endOfMonth];
}
