import moment from 'moment';

// Last month
export function getLastMonthRange(): [moment.Moment, moment.Moment] {
  const today = moment();
  const startOfMonth = today.clone().startOf('month').subtract(1, 'months');
  const endOfMonth = startOfMonth.clone().endOf('month');
  return [startOfMonth, endOfMonth];
}

//Last week
export function getLastWeekRange(): [moment.Moment, moment.Moment] {
  const today = moment();
  const startOfWeek = today.clone().startOf('isoWeek').subtract(7, 'days'); // Start of last week
  const endOfWeek = startOfWeek.clone().add(6, 'days'); // End of last week
  return [startOfWeek, endOfWeek];
}

// This Week
export function getThisWeekRange(): [moment.Moment, moment.Moment] {
  const today = moment();
  const startOfWeek = today.clone().startOf('isoWeek'); // ISO week starts on Monday
  const endOfWeek = today.clone().endOf('isoWeek');
  return [startOfWeek, endOfWeek];
}

// This Month
export function getThisMonthRange(): [moment.Moment, moment.Moment] {
  const today = moment();
  const startOfMonth = today.clone().startOf('month');
  const endOfMonth = today.clone().endOf('month');
  return [startOfMonth, endOfMonth];
}
