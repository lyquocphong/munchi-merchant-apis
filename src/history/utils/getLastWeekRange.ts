import moment from 'moment';

export function getLastWeekRange(): [moment.Moment, moment.Moment] {
  const today = moment();
  const startOfWeek = today.clone().startOf('isoWeek').subtract(7, 'days'); // Start of last week
  const endOfWeek = startOfWeek.clone().add(6, 'days'); // End of last week
  return [startOfWeek, endOfWeek];
}
